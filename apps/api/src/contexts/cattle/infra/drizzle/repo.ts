import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import {
	events,
	bloodline,
	breedingStatus,
	breedingSummary,
	cattle,
	cattleStatusHistory,
	motherInfo
} from "../../../../db/schema";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import type { CattleRepoPort } from "../../ports";
import { toDomain } from "../mappers/dbToDomain";
import { toDbInsert, toDbUpdate } from "../mappers/domainToDb";

export function makeCattleRepo(db: AnyD1Database): CattleRepoPort {
	const d = drizzle(db);
	return {
		async findById(id: CattleId) {
			const numId = id as unknown as number;
			const rows = (await d
				.select({ cattle })
				.from(cattle)
				.where(eq(cattle.cattleId, numId))) as Array<{ cattle: unknown }>;
			const matched: { cattle: { cattleId?: number } } | undefined =
				Array.isArray(rows)
					? ((rows.find(
							(r) => (r.cattle as { cattleId?: number })?.cattleId === numId
						) as { cattle: { cattleId?: number } } | undefined) ??
						(rows[0] as { cattle: { cattleId?: number } } | undefined))
					: undefined;
			type Row = Parameters<typeof toDomain>[0];
			return matched?.cattle ? toDomain(matched.cattle as Row) : null;
		},
		async findByIds(ids: CattleId[]) {
			// Implementation for batch finding by IDs
			const numIds = ids.map((id) => id as unknown as number);
			const rows = await d
				.select()
				.from(cattle)
				.where(sql`${cattle.cattleId} IN (${sql.join(numIds, sql`, `)})`);
			return rows.map((row) => toDomain(row));
		},
		async findByIdentificationNumber(
			ownerUserId: UserId,
			identificationNumber: number
		) {
			const rows = await d
				.select()
				.from(cattle)
				.where(
					and(
						eq(cattle.ownerUserId, ownerUserId as unknown as number),
						eq(cattle.identificationNumber, identificationNumber)
					)
				);
			return rows.length > 0 ? toDomain(rows[0]) : null;
		},
		async search(q) {
			const conditions = [
				eq(cattle.ownerUserId, q.ownerUserId as unknown as number)
			];
			if (q.search) {
				conditions.push(
					sql`(${cattle.name} LIKE ${`%${q.search}%`} OR CAST(${cattle.identificationNumber} AS TEXT) LIKE ${`%${q.search}%`} OR CAST(${cattle.earTagNumber} AS TEXT) LIKE ${`%${q.search}%`})`
				);
			}
			if (q.growthStage && q.growthStage.length > 0) {
				const quoted = q.growthStage.map((s) => `'${s}'`).join(",");
				conditions.push(sql`${cattle.growthStage} IN (${sql.raw(quoted)})`);
			}
			if (q.gender && q.gender.length > 0) {
				const quoted = q.gender.map((s) => `'${s}'`).join(",");
				conditions.push(sql`${cattle.gender} IN (${sql.raw(quoted)})`);
			}
			if (q.status && q.status.length > 0) {
				const quoted = q.status.map((s) => `'${s}'`).join(",");
				conditions.push(sql`${cattle.status} IN (${sql.raw(quoted)})`);
			}
			if (q.cursor) {
				const cursorCondition =
					q.sortOrder === "desc"
						? sql`${getSortColumn(q.sortBy)} < ${q.cursor.value}`
						: sql`${getSortColumn(q.sortBy)} > ${q.cursor.value}`;
				conditions.push(cursorCondition);
			}
			const rows = await d
				.select()
				.from(cattle)
				.where(and(...conditions))
				.orderBy(
					q.sortOrder === "desc"
						? desc(getSortColumn(q.sortBy))
						: asc(getSortColumn(q.sortBy))
				)
				.limit(q.limit + 1);
			return rows.map(toDomain);
		},
		async create(dto) {
			// Convert NewCattleProps to Cattle-like object for database insertion
			const cattleData = {
				cattleId: 0 as unknown as CattleId, // Will be set by database auto-increment
				...dto,
				age: null,
				monthsOld: null,
				daysOld: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				version: 1
			} as Cattle;

			const [row] = await d
				.insert(cattle)
				.values(toDbInsert(cattleData))
				.returning();
			return toDomain(row);
		},
		async update(id, partial) {
			// Convert partial NewCattleProps to partial Cattle for database update
			const partialCattle = {
				...partial,
				updatedAt: new Date()
			} as Partial<Cattle>;

			await d
				.update(cattle)
				.set(toDbUpdate(partialCattle))
				.where(eq(cattle.cattleId, id as unknown as number))
				.returning();
			const [selected] = await d
				.select()
				.from(cattle)
				.where(eq(cattle.cattleId, id as unknown as number))
				.limit(1);
			return toDomain(selected);
		},
		async delete(id) {
			// cascade deletes to related tables to preserve current API behavior
			const numId = id as unknown as number;
			await d.delete(events).where(eq(events.cattleId, numId));
			await d.delete(bloodline).where(eq(bloodline.cattleId, numId));
			await d.delete(breedingStatus).where(eq(breedingStatus.cattleId, numId));
			await d
				.delete(breedingSummary)
				.where(eq(breedingSummary.cattleId, numId));
			await d.delete(motherInfo).where(eq(motherInfo.cattleId, numId));
			await d.delete(cattle).where(eq(cattle.cattleId, numId));
		},
		async searchCount(q) {
			// Implementation for counting search results
			const conditions = [
				eq(cattle.ownerUserId, q.ownerUserId as unknown as number)
			];
			// Add same filters as search method
			const [result] = await d
				.select({ count: sql<number>`COUNT(*)`.as("count") })
				.from(cattle)
				.where(and(...conditions));
			return result.count;
		},
		async countByStatus(ownerUserId: UserId) {
			const rows = await d
				.select({
					status: cattle.status,
					count: sql<number>`COUNT(*)`.as("count")
				})
				.from(cattle)
				.where(eq(cattle.ownerUserId, ownerUserId as unknown as number))
				.groupBy(cattle.status);
			return rows as Array<{ status: Cattle["status"]; count: number }>;
		},
		async updateStatus(id, newStatus, changedBy, reason) {
			// Update cattle status and log history
			await d
				.update(cattle)
				.set({ status: newStatus })
				.where(eq(cattle.cattleId, id as unknown as number))
				.returning();

			// Log status change
			await d
				.insert(cattleStatusHistory)
				.values({
					cattleId: id as unknown as number,
					newStatus:
						newStatus as unknown as (typeof cattleStatusHistory.$inferInsert)["newStatus"],
					changedBy: changedBy as unknown as number,
					reason: reason ?? null
				})
				.returning();

			// Return updated cattle
			const [updated] = await d
				.select()
				.from(cattle)
				.where(eq(cattle.cattleId, id as unknown as number));
			return toDomain(updated);
		},
		async getStatusHistory(cattleId, limit = 10) {
			const rows = await d
				.select()
				.from(cattleStatusHistory)
				.where(eq(cattleStatusHistory.cattleId, cattleId as unknown as number))
				.orderBy(desc(cattleStatusHistory.changedAt))
				.limit(limit);
			return rows.map((row) => ({
				oldStatus: row.oldStatus as Cattle["status"] | null,
				newStatus: row.newStatus as NonNullable<Cattle["status"]>,
				changedBy: row.changedBy as unknown as UserId,
				reason: row.reason,
				changedAt: row.changedAt ? new Date(row.changedAt) : new Date()
			}));
		},
		async getAgeDistribution(ownerUserId: UserId) {
			// Stub implementation
			return [];
		},
		async getBreedDistribution(ownerUserId: UserId) {
			// Stub implementation
			return [];
		},
		async getCattleNeedingAttention(ownerUserId: UserId) {
			// Stub implementation
			return [];
		},
		async batchUpdate(updates) {
			// Stub implementation
			return [];
		},
		async updateWithVersion(id, updates, expectedVersion) {
			// Stub implementation with optimistic concurrency
			const current = await this.findById(id);
			if (!current) throw new Error("Not found");
			if (current.version !== expectedVersion)
				throw new Error("Version conflict");
			return this.update(id, updates);
		},

		// Legacy methods still used by some routes
		async appendStatusHistory(e: {
			cattleId: CattleId;
			oldStatus?: Cattle["status"] | null;
			newStatus: NonNullable<Cattle["status"]>;
			changedBy: UserId;
			reason?: string | null;
		}) {
			// Use the same drizzle instance that's used throughout the repo
			await d
				.insert(cattleStatusHistory)
				.values({
					cattleId: e.cattleId as unknown as number,
					newStatus:
						e.newStatus as unknown as (typeof cattleStatusHistory.$inferInsert)["newStatus"],
					changedBy: e.changedBy as unknown as number,
					reason: e.reason ?? null,
					...(e.oldStatus
						? {
								oldStatus:
									e.oldStatus as unknown as (typeof cattleStatusHistory.$inferInsert)["oldStatus"]
							}
						: {})
				})
				.returning();
		},

		async upsertBreedingStatus(
			cattleId: CattleId,
			data: Record<string, unknown>
		) {
			const cid = cattleId as unknown as number;
			const existing = await d
				.select()
				.from(breedingStatus)
				.where(eq(breedingStatus.cattleId, cid))
				.limit(1);
			if (existing.length > 0) {
				await d
					.update(breedingStatus)
					.set({ ...data, updatedAt: new Date().toISOString() })
					.where(eq(breedingStatus.cattleId, cid))
					.returning();
			} else {
				await d
					.insert(breedingStatus)
					.values({ cattleId: cid, ...data })
					.returning();
			}
		},

		async upsertBreedingSummary(
			cattleId: CattleId,
			data: Record<string, unknown>
		) {
			const cid = cattleId as unknown as number;
			const existing = await d
				.select()
				.from(breedingSummary)
				.where(eq(breedingSummary.cattleId, cid))
				.limit(1);
			if (existing.length > 0) {
				await d
					.update(breedingSummary)
					.set({ ...data, updatedAt: new Date().toISOString() })
					.where(eq(breedingSummary.cattleId, cid))
					.returning();
			} else {
				await d
					.insert(breedingSummary)
					.values({ cattleId: cid, ...data })
					.returning();
			}
		},

		async getBloodline(id) {
			const rows = await d
				.select()
				.from(bloodline)
				.where(eq(bloodline.cattleId, id as unknown as number))
				.limit(1);
			return rows[0] ?? null;
		},

		async getMotherInfo(id) {
			const rows = await d
				.select()
				.from(motherInfo)
				.where(eq(motherInfo.cattleId, id as unknown as number))
				.limit(1);
			const row = rows[0];
			if (!row) return null;
			return {
				motherInfoId: row.motherInfoId as number,
				cattleId: row.cattleId as number,
				motherCattleId: row.motherCattleId as number,
				motherName: row.motherName ?? null,
				motherIdentificationNumber: row.motherIdentificationNumber ?? null,
				motherScore: row.motherScore ?? null
			};
		},

		async getBreedingStatus(id) {
			const rows = await d
				.select()
				.from(breedingStatus)
				.where(eq(breedingStatus.cattleId, id as unknown as number))
				.limit(1);
			const row = rows[0];
			if (!row) return null;
			return {
				breedingStatusId: row.breedingStatusId as number,
				cattleId: row.cattleId as number,
				parity: row.parity ?? null,
				expectedCalvingDate: row.expectedCalvingDate ?? null,
				scheduledPregnancyCheckDate: row.scheduledPregnancyCheckDate ?? null,
				daysAfterCalving: row.daysAfterCalving ?? null,
				daysOpen: row.daysOpen ?? null,
				pregnancyDays: row.pregnancyDays ?? null,
				daysAfterInsemination: row.daysAfterInsemination ?? null,
				inseminationCount: row.inseminationCount ?? null,
				breedingMemo: row.breedingMemo ?? null,
				isDifficultBirth:
					(row.isDifficultBirth as unknown as boolean | null) ?? null,
				createdAt: (row.createdAt ?? new Date().toISOString()) as string,
				updatedAt: (row.updatedAt ?? new Date().toISOString()) as string
			};
		},

		async getBreedingSummary(id) {
			const rows = await d
				.select()
				.from(breedingSummary)
				.where(eq(breedingSummary.cattleId, id as unknown as number))
				.limit(1);
			const row = rows[0];
			if (!row) return null;
			return {
				breedingSummaryId: row.breedingSummaryId as number,
				cattleId: row.cattleId as number,
				totalInseminationCount: row.totalInseminationCount ?? null,
				averageDaysOpen: row.averageDaysOpen ?? null,
				averagePregnancyPeriod: row.averagePregnancyPeriod ?? null,
				averageCalvingInterval: row.averageCalvingInterval ?? null,
				difficultBirthCount: row.difficultBirthCount ?? null,
				pregnancyHeadCount: row.pregnancyHeadCount ?? null,
				pregnancySuccessRate: row.pregnancySuccessRate ?? null,
				createdAt: (row.createdAt ?? new Date().toISOString()) as string,
				updatedAt: (row.updatedAt ?? new Date().toISOString()) as string
			};
		}
	};
}

function getSortColumn(
	sortBy: "id" | "name" | "days_old" | "created_at" | "updated_at"
) {
	switch (sortBy) {
		case "id":
			return cattle.cattleId;
		case "name":
			return cattle.name;
		case "days_old":
			return sql`CAST((julianday('now') - julianday(${cattle.birthday})) AS INTEGER)`;
		case "created_at":
			return cattle.createdAt;
		case "updated_at":
			return cattle.updatedAt;
		default:
			return cattle.cattleId;
	}
}

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
			const [row] = await d.insert(cattle).values(toDbInsert(dto)).returning();
			return toDomain(row);
		},
		async update(id, partial) {
			await d
				.update(cattle)
				.set(toDbUpdate(partial))
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
		async appendStatusHistory(e) {
			await d
				.insert(cattleStatusHistory)
				.values({
					cattleId: e.cattleId as unknown as number,
					newStatus: e.newStatus,
					changedBy: e.changedBy as unknown as number,
					reason: e.reason ?? null,
					...(e.oldStatus ? { oldStatus: e.oldStatus } : {}),
					changedAt: new Date().toISOString()
				})
				.returning();
		},
		async upsertBreedingStatus(cattleId, data) {
			const cid = cattleId as unknown as number;
			const existing = await d
				.select()
				.from(breedingStatus)
				.where(eq(breedingStatus.cattleId, cid))
				.limit(1);
			if (existing && existing.length > 0) {
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
		async upsertBreedingSummary(cattleId, data) {
			const cid = cattleId as unknown as number;
			const existing = await d
				.select()
				.from(breedingSummary)
				.where(eq(breedingSummary.cattleId, cid))
				.limit(1);
			if (existing && existing.length > 0) {
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
		}
	};
}

function getSortColumn(sortBy: "id" | "name" | "days_old") {
	switch (sortBy) {
		case "id":
			return cattle.cattleId;
		case "name":
			return cattle.name;
		case "days_old":
			return sql`CAST((julianday('now') - julianday(${cattle.birthday})) AS INTEGER)`;
		default:
			return cattle.cattleId;
	}
}

import { and, asc, desc, eq, exists, inArray, not, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import {
	events,
	alerts,
	breedingStatus,
	cattle,
	cattleStatusHistory
} from "../../../../db/schema";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import type { CattleRepoPort } from "../../ports";
import { toDomain } from "../mappers/dbToDomain";
import { toDbInsert, toDbUpdate } from "../mappers/domainToDb";

// アラート情報を取得するヘルパー関数
async function getAlertInfoForCattle(
	db: AnyD1Database,
	cattleId: number,
	ownerUserId: number
) {
	try {
		const alertRows = await db
			.prepare(`
				SELECT severity, status
				FROM alerts 
				WHERE cattle_id = ? AND owner_user_id = ? AND status IN ('active', 'acknowledged')
				ORDER BY severity DESC
			`)
			.bind(cattleId, ownerUserId)
			.all<{ severity: string; status: string }>();

		const alerts = alertRows.results;
		const hasActiveAlerts = alerts.length > 0;
		const alertCount = alerts.length;

		// 最高重要度を決定
		let highestSeverity: "high" | "medium" | "low" | null = null;
		if (alerts.length > 0) {
			const severities = alerts.map(
				(a: { severity: string; status: string }) => a.severity
			);
			if (severities.includes("high")) {
				highestSeverity = "high";
			} else if (severities.includes("medium")) {
				highestSeverity = "medium";
			} else if (severities.includes("low")) {
				highestSeverity = "low";
			}
		}

		return {
			hasActiveAlerts,
			alertCount,
			highestSeverity
		};
	} catch (error) {
		// エラーが発生した場合はデフォルト値を返す
		return {
			hasActiveAlerts: false,
			alertCount: 0,
			highestSeverity: null
		};
	}
}

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

			// 空胎日数順の並び替えの場合のみ、経産牛と初産牛を表示
			// 空胎日数が計算可能な牛のみを対象とする
			if (q.sortBy === "days_open") {
				conditions.push(
					inArray(cattle.growthStage, ["FIRST_CALVED", "MULTI_PAROUS"])
				);
			}

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
			// アラート有無によるフィルタリング（active/acknowledged を「アクティブ」とみなす）
			if (q.hasAlert !== undefined) {
				const alertSubquery = d
					.select({ cattleId: alerts.cattleId })
					.from(alerts)
					.where(
						and(
							eq(alerts.cattleId, cattle.cattleId),
							inArray(alerts.status, ["active", "acknowledged"]),
							eq(alerts.ownerUserId, q.ownerUserId as unknown as number)
						)
					);

				if (q.hasAlert) {
					conditions.push(exists(alertSubquery));
				} else {
					conditions.push(not(exists(alertSubquery)));
				}
			}
			if (q.cursor) {
				const cursorCondition =
					q.sortOrder === "desc"
						? sql`${getSortColumn(q.sortBy)} < ${q.cursor.value}`
						: sql`${getSortColumn(q.sortBy)} > ${q.cursor.value}`;
				conditions.push(cursorCondition);
			}

			// 空胎日数順の並び替えの場合はbreeding_statusテーブルとJOIN
			const needsBreedingJoin = q.sortBy === "days_open";

			let rows: Record<string, unknown>[];
			if (needsBreedingJoin) {
				rows = await d
					.select({
						cattleId: cattle.cattleId,
						ownerUserId: cattle.ownerUserId,
						identificationNumber: cattle.identificationNumber,
						earTagNumber: cattle.earTagNumber,
						name: cattle.name,
						gender: cattle.gender,
						birthday: cattle.birthday,
						growthStage: cattle.growthStage,
						breed: cattle.breed,
						status: cattle.status,
						producerName: cattle.producerName,
						barn: cattle.barn,
						breedingValue: cattle.breedingValue,
						notes: cattle.notes,
						weight: cattle.weight,
						score: cattle.score,
						createdAt: cattle.createdAt,
						updatedAt: cattle.updatedAt,
						daysOpen: breedingStatus.daysOpen
					})
					.from(cattle)
					.leftJoin(
						breedingStatus,
						eq(cattle.cattleId, breedingStatus.cattleId)
					)
					.where(and(...conditions))
					.orderBy(
						q.sortOrder === "desc"
							? desc(getSortColumn(q.sortBy))
							: asc(getSortColumn(q.sortBy))
					)
					.limit(q.limit + 1);
			} else {
				rows = await d
					.select()
					.from(cattle)
					.where(and(...conditions))
					.orderBy(
						q.sortOrder === "desc"
							? desc(getSortColumn(q.sortBy))
							: asc(getSortColumn(q.sortBy))
					)
					.limit(q.limit + 1);
			}

			// 各牛にアラート情報を追加
			const cattleWithAlerts = await Promise.all(
				rows.map(async (row) => {
					// JOIN結果の場合、daysOpenフィールドを除外してからtoDomainを適用
					const { daysOpen, ...cattleRow } = row as Record<string, unknown>;
					const cattleData = toDomain(
						cattleRow as Parameters<typeof toDomain>[0]
					);
					const alertInfo = await getAlertInfoForCattle(
						db,
						(row as Record<string, unknown>).cattleId as number,
						q.ownerUserId as unknown as number
					);

					return {
						...cattleData,
						alerts: alertInfo,
						// 空胎日数順で並び替えている場合はdaysOpenも含める
						...(needsBreedingJoin && { daysOpen })
					};
				})
			);

			return cattleWithAlerts;
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
				version: 1,
				alerts: {
					hasActiveAlerts: false,
					alertCount: 0,
					highestSeverity: null
				}
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
			// Hex: cascade is orchestrated in use case, repo deletes cattle only
			const numId = id as unknown as number;
			await d.delete(events).where(eq(events.cattleId, numId));
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
			return rows.map((row) => ({
				status: row.status as Cattle["status"],
				count: row.count
			}));
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
		}
	};
}

function getSortColumn(
	sortBy: "id" | "name" | "days_old" | "days_open" | "created_at" | "updated_at"
) {
	switch (sortBy) {
		case "id":
			return cattle.cattleId;
		case "name":
			return cattle.name;
		case "days_old":
			return sql`CAST((julianday('now') - julianday(${cattle.birthday})) AS INTEGER)`;
		case "days_open":
			return sql`COALESCE(breeding_status.daysOpen, 0)`;
		case "created_at":
			return cattle.createdAt;
		case "updated_at":
			return cattle.updatedAt;
		default:
			return cattle.cattleId;
	}
}

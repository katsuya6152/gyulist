/**
 * Cattle Repository Implementation
 *
 * 牛管理リポジトリのDrizzle ORM実装
 */

import { and, asc, desc, eq, exists, inArray, not, or, sql } from "drizzle-orm";
import {
	events,
	alerts,
	breedingStatus,
	cattle,
	cattleStatusHistory
} from "../../../db/schema";
import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type {
	Cattle,
	CattleSearchCriteria,
	NewCattleProps
} from "../../../domain/types/cattle";
import type {
	Barn,
	Breed,
	BreedingValue,
	CattleName,
	EarTagNumber,
	Gender,
	GrowthStage,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Status,
	Weight
} from "../../../domain/types/cattle/CattleTypes";
import type { CattleId, UserId } from "../../../shared/brand";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import { cattleDbMapper } from "../mappers/cattleDbMapper";

/**
 * Cattle Repository Implementation using Drizzle ORM
 */
export class CattleRepositoryImpl implements CattleRepository {
	private readonly db: D1DatabasePort;

	constructor(dbInstance: D1DatabasePort) {
		this.db = dbInstance;
	}

	async findById(id: CattleId): Promise<Result<Cattle | null, CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();

			// 牛の基本情報を取得
			const cattleRow = await drizzleDb
				.select()
				.from(cattle)
				.where(eq(cattle.cattleId, id))
				.get();

			if (!cattleRow) {
				return ok(null);
			}

			// アラート情報を別途取得
			const alertRows = await drizzleDb
				.select({
					severity: alerts.severity,
					status: alerts.status
				})
				.from(alerts)
				.where(
					and(
						eq(alerts.cattleId, id),
						inArray(alerts.status, ["active", "acknowledged"])
					)
				)
				.orderBy(desc(alerts.severity));

			if (!cattleRow) {
				return ok(null);
			}

			// アラート情報を構築
			const hasActiveAlerts = alertRows.length > 0;
			const alertCount = alertRows.length;

			// 最高重要度を決定
			let highestSeverity: "high" | "medium" | "low" | null = null;
			if (alertRows.length > 0) {
				const severities = alertRows.map((row) => row.severity);
				if (severities.includes("high")) {
					highestSeverity = "high";
				} else if (severities.includes("medium")) {
					highestSeverity = "medium";
				} else if (severities.includes("low")) {
					highestSeverity = "low";
				}
			}

			const alertInfo = {
				hasActiveAlerts,
				alertCount,
				highestSeverity
			};

			const cattleEntity = cattleDbMapper.toDomain(cattleRow, alertInfo);
			return ok(cattleEntity);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to find cattle by ID",
				cause: error
			});
		}
	}

	async findByIds(ids: CattleId[]): Promise<Result<Cattle[], CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();

			// 牛の基本情報を取得
			const cattleRows = await drizzleDb
				.select()
				.from(cattle)
				.where(inArray(cattle.cattleId, ids));

			// 各牛のアラート情報を取得
			const cattleEntities = await Promise.all(
				cattleRows.map(async (row) => {
					// アラート情報を別途取得
					const alertRows = await drizzleDb
						.select({
							severity: alerts.severity,
							status: alerts.status
						})
						.from(alerts)
						.where(
							and(
								eq(alerts.cattleId, row.cattleId),
								inArray(alerts.status, ["active", "acknowledged"])
							)
						)
						.orderBy(desc(alerts.severity));

					// アラート情報を構築
					const hasActiveAlerts = alertRows.length > 0;
					const alertCount = alertRows.length;

					// 最高重要度を決定
					let highestSeverity: "high" | "medium" | "low" | null = null;
					if (alertRows.length > 0) {
						const severities = alertRows.map((alertRow) => alertRow.severity);
						if (severities.includes("high")) {
							highestSeverity = "high";
						} else if (severities.includes("medium")) {
							highestSeverity = "medium";
						} else if (severities.includes("low")) {
							highestSeverity = "low";
						}
					}

					const alertInfo = {
						hasActiveAlerts,
						alertCount,
						highestSeverity
					};

					return cattleDbMapper.toDomain(row, alertInfo);
				})
			);

			return ok(cattleEntities);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to find cattle by IDs",
				cause: error
			});
		}
	}

	async findByIdentificationNumber(
		ownerUserId: UserId,
		identificationNumber: number
	): Promise<Result<Cattle | null, CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();
			// 牛の基本情報を取得
			const cattleRow = await drizzleDb
				.select()
				.from(cattle)
				.where(
					and(
						eq(cattle.ownerUserId, ownerUserId),
						eq(cattle.identificationNumber, identificationNumber)
					)
				)
				.get();

			if (!cattleRow) {
				return ok(null);
			}

			// アラート情報を別途取得
			const alertRows = await drizzleDb
				.select({
					severity: alerts.severity,
					status: alerts.status
				})
				.from(alerts)
				.where(
					and(
						eq(alerts.cattleId, cattleRow.cattleId),
						inArray(alerts.status, ["active", "acknowledged"])
					)
				)
				.orderBy(desc(alerts.severity));

			// アラート情報を構築
			const hasActiveAlerts = alertRows.length > 0;
			const alertCount = alertRows.length;

			// 最高重要度を決定
			let highestSeverity: "high" | "medium" | "low" | null = null;
			if (alertRows.length > 0) {
				const severities = alertRows.map((row) => row.severity);
				if (severities.includes("high")) {
					highestSeverity = "high";
				} else if (severities.includes("medium")) {
					highestSeverity = "medium";
				} else if (severities.includes("low")) {
					highestSeverity = "low";
				}
			}

			const alertInfo = {
				hasActiveAlerts,
				alertCount,
				highestSeverity
			};

			const cattleEntity = cattleDbMapper.toDomain(cattleRow, alertInfo);
			return ok(cattleEntity);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to find cattle by identification number",
				cause: error
			});
		}
	}

	async search(
		criteria: CattleSearchCriteria & {
			cursor?: { id: number; value: string | number };
			limit: number;
			sortBy: "id" | "name" | "days_old" | "days_open";
			sortOrder: "asc" | "desc";
			hasAlert?: boolean;
			minAge?: number;
			maxAge?: number;
			barn?: string;
			breed?: string;
		}
	): Promise<Result<Cattle[], CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();

			// 検索条件を配列で構築
			const conditions = [
				eq(cattle.ownerUserId, criteria.ownerUserId as unknown as number)
			];

			if (criteria.gender) {
				conditions.push(eq(cattle.gender, criteria.gender));
			}

			if (criteria.growthStage) {
				conditions.push(eq(cattle.growthStage, criteria.growthStage));
			}

			if (criteria.status) {
				conditions.push(eq(cattle.status, criteria.status));
			}

			if (criteria.barn) {
				conditions.push(eq(cattle.barn, criteria.barn));
			}

			if (criteria.breed) {
				conditions.push(eq(cattle.breed, criteria.breed));
			}

			// テキスト検索（名前、識別番号、耳標番号）
			if (criteria.search) {
				const searchLower = criteria.search.toLowerCase();
				const searchConditions: ReturnType<typeof sql>[] = [];

				if (cattle.name) {
					searchConditions.push(
						sql`LOWER(${cattle.name}) LIKE ${`%${searchLower}%`}`
					);
				}

				searchConditions.push(
					sql`CAST(${cattle.identificationNumber} AS TEXT) LIKE ${`%${searchLower}%`}`
				);

				if (cattle.earTagNumber) {
					searchConditions.push(
						sql`CAST(${cattle.earTagNumber} AS TEXT) LIKE ${`%${searchLower}%`}`
					);
				}

				if (searchConditions.length > 0) {
					const searchCondition = or(...searchConditions);
					if (searchCondition) {
						conditions.push(searchCondition);
					}
				}
			}

			// 従来のクエリビルダーを使用してクエリ実行
			let orderByClause: ReturnType<typeof asc> | ReturnType<typeof desc>;
			switch (criteria.sortBy) {
				case "id":
					orderByClause =
						criteria.sortOrder === "asc"
							? asc(cattle.cattleId)
							: desc(cattle.cattleId);
					break;
				case "name":
					orderByClause =
						criteria.sortOrder === "asc" ? asc(cattle.name) : desc(cattle.name);
					break;
				case "days_old":
					// 日齢でのソート（birthdayが古いほど日齢が高い）
					orderByClause =
						criteria.sortOrder === "asc"
							? desc(cattle.birthday)
							: asc(cattle.birthday);
					break;
				default:
					orderByClause =
						criteria.sortOrder === "asc"
							? asc(cattle.cattleId)
							: desc(cattle.cattleId);
			}

			// クエリ実行
			const cattleRows = await drizzleDb
				.select()
				.from(cattle)
				.where(and(...conditions))
				.orderBy(orderByClause)
				.limit(criteria.limit + 1);

			// 結果をドメインオブジェクトに変換
			const cattleEntities: Cattle[] = [];
			for (const row of cattleRows) {
				// アラート情報を別途取得
				const alertRows = await drizzleDb
					.select({
						severity: alerts.severity,
						status: alerts.status
					})
					.from(alerts)
					.where(
						and(
							eq(alerts.cattleId, row.cattleId),
							inArray(alerts.status, ["active", "acknowledged"])
						)
					)
					.orderBy(desc(alerts.severity));

				// アラート情報を構築
				const hasActiveAlerts = alertRows.length > 0;
				const alertCount = alertRows.length;

				// 最高重要度を決定
				let highestSeverity: "high" | "medium" | "low" | null = null;
				if (alertRows.length > 0) {
					const severities = alertRows.map((alertRow) => alertRow.severity);
					if (severities.includes("high")) {
						highestSeverity = "high";
					} else if (severities.includes("medium")) {
						highestSeverity = "medium";
					} else if (severities.includes("low")) {
						highestSeverity = "low";
					}
				}

				const alertInfo = {
					hasActiveAlerts,
					alertCount,
					highestSeverity
				};

				// ドメインオブジェクトに変換
				const cattleEntity = cattleDbMapper.toDomain(row, alertInfo);
				cattleEntities.push(cattleEntity);
			}

			// limit件に制限（+1件目は次のページ判定用）
			const result = cattleEntities.slice(0, criteria.limit);

			return ok(result);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to search cattle",
				cause: error
			});
		}
	}

	async searchCount(
		criteria: CattleSearchCriteria
	): Promise<Result<number, CattleError>> {
		try {
			// 一時的にダミーデータの件数を返す（実装完了まで）
			const dummyCattle: Cattle[] = [
				{
					cattleId: 1 as CattleId,
					ownerUserId: criteria.ownerUserId,
					identificationNumber: 1001 as IdentificationNumber,
					earTagNumber: "12345" as EarTagNumber,
					name: "花子" as CattleName,
					gender: "雌" as Gender,
					birthday: new Date("2020-01-15"),
					growthStage: "MULTI_PAROUS" as GrowthStage,
					breed: "ホルスタイン" as Breed,
					status: "HEALTHY" as Status,
					producerName: "田中牧場" as ProducerName,
					barn: "A棟" as Barn,
					breedingValue: "A2" as BreedingValue,
					notes: "優秀な繁殖成績" as Notes,
					weight: 650 as Weight,
					score: 85 as Score,
					createdAt: new Date("2020-01-15"),
					updatedAt: new Date(),
					version: 1,
					alerts: {
						hasActiveAlerts: false,
						alertCount: 0,
						highestSeverity: null
					}
				},
				{
					cattleId: 2 as CattleId,
					ownerUserId: criteria.ownerUserId,
					identificationNumber: 1002 as IdentificationNumber,
					earTagNumber: "12346" as EarTagNumber,
					name: "太郎" as CattleName,
					gender: "雄" as Gender,
					birthday: new Date("2019-06-20"),
					growthStage: "FATTENING" as GrowthStage,
					breed: "黒毛和牛" as Breed,
					status: "HEALTHY" as Status,
					producerName: "佐藤牧場" as ProducerName,
					barn: "B棟" as Barn,
					breedingValue: "B1" as BreedingValue,
					notes: "肥育中" as Notes,
					weight: 450 as Weight,
					score: 78 as Score,
					createdAt: new Date("2019-06-20"),
					updatedAt: new Date(),
					version: 1,
					alerts: {
						hasActiveAlerts: true,
						alertCount: 1,
						highestSeverity: "medium"
					}
				}
			];

			// 検索条件に基づいてフィルタリング
			let filteredCattle = dummyCattle;

			if (criteria.gender) {
				filteredCattle = filteredCattle.filter(
					(c) => c.gender === criteria.gender
				);
			}

			if (criteria.growthStage) {
				filteredCattle = filteredCattle.filter(
					(c) => c.growthStage === criteria.growthStage
				);
			}

			if (criteria.status) {
				filteredCattle = filteredCattle.filter(
					(c) => c.status === criteria.status
				);
			}

			if (criteria.hasAlert !== undefined) {
				filteredCattle = filteredCattle.filter((c) =>
					criteria.hasAlert
						? c.alerts.hasActiveAlerts
						: !c.alerts.hasActiveAlerts
				);
			}

			if (criteria.search) {
				const searchLower = criteria.search.toLowerCase();
				filteredCattle = filteredCattle.filter(
					(c) =>
						c.name?.toLowerCase().includes(searchLower) ||
						c.identificationNumber.toString().includes(searchLower) ||
						c.earTagNumber?.includes(searchLower)
				);
			}

			return ok(filteredCattle.length);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to count cattle",
				cause: error
			});
		}
	}

	async create(props: NewCattleProps): Promise<Result<Cattle, CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();
			const insertData = cattleDbMapper.toDbInsert(props);

			const result = await drizzleDb
				.insert(cattle)
				.values(insertData)
				.returning();

			if (!result[0]) {
				return err({
					type: "InfraError",
					message: "Failed to create cattle - no result returned"
				});
			}

			// 新しく作成された牛のアラート情報を取得
			const alertRows = await drizzleDb
				.select({
					severity: alerts.severity,
					status: alerts.status
				})
				.from(alerts)
				.where(
					and(
						eq(alerts.cattleId, result[0].cattleId),
						inArray(alerts.status, ["active", "acknowledged"])
					)
				)
				.orderBy(desc(alerts.severity));

			// アラート情報を構築
			const hasActiveAlerts = alertRows.length > 0;
			const alertCount = alertRows.length;

			// 最高重要度を決定
			let highestSeverity: "high" | "medium" | "low" | null = null;
			if (alertRows.length > 0) {
				const severities = alertRows.map((row) => row.severity);
				if (severities.includes("high")) {
					highestSeverity = "high";
				} else if (severities.includes("medium")) {
					highestSeverity = "medium";
				} else if (severities.includes("low")) {
					highestSeverity = "low";
				}
			}

			const alertInfo = {
				hasActiveAlerts,
				alertCount,
				highestSeverity
			};

			const cattleEntity = cattleDbMapper.toDomain(result[0], alertInfo);
			return ok(cattleEntity);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to create cattle",
				cause: error
			});
		}
	}

	async update(
		id: CattleId,
		updates: Partial<NewCattleProps>
	): Promise<Result<Cattle, CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();
			const updateData = cattleDbMapper.toDbUpdate(updates);

			const result = await drizzleDb
				.update(cattle)
				.set(updateData)
				.where(eq(cattle.cattleId, id))
				.returning();

			if (!result[0]) {
				return err({
					type: "NotFound",
					entity: "Cattle",
					id: id,
					message: "Cattle not found for update"
				});
			}

			// 更新された牛のアラート情報を取得
			const alertRows = await drizzleDb
				.select({
					severity: alerts.severity,
					status: alerts.status
				})
				.from(alerts)
				.where(
					and(
						eq(alerts.cattleId, id),
						inArray(alerts.status, ["active", "acknowledged"])
					)
				)
				.orderBy(desc(alerts.severity));

			// アラート情報を構築
			const hasActiveAlerts = alertRows.length > 0;
			const alertCount = alertRows.length;

			// 最高重要度を決定
			let highestSeverity: "high" | "medium" | "low" | null = null;
			if (alertRows.length > 0) {
				const severities = alertRows.map((row) => row.severity);
				if (severities.includes("high")) {
					highestSeverity = "high";
				} else if (severities.includes("medium")) {
					highestSeverity = "medium";
				} else if (severities.includes("low")) {
					highestSeverity = "low";
				}
			}

			const alertInfo = {
				hasActiveAlerts,
				alertCount,
				highestSeverity
			};

			const cattleEntity = cattleDbMapper.toDomain(result[0], alertInfo);
			return ok(cattleEntity);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to update cattle",
				cause: error
			});
		}
	}

	async delete(id: CattleId): Promise<Result<void, CattleError>> {
		try {
			const drizzleDb = this.db.getDrizzle();
			await drizzleDb.delete(cattle).where(eq(cattle.cattleId, id));

			return ok(undefined);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to delete cattle",
				cause: error
			});
		}
	}

	// TODO: Implement remaining methods
	async updateStatus(
		id: CattleId,
		newStatus: NonNullable<Cattle["status"]>,
		changedBy: UserId,
		reason?: string | null
	): Promise<Result<Cattle, CattleError>> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async getStatusHistory(
		cattleId: CattleId,
		limit?: number
	): Promise<
		Result<
			Array<{
				oldStatus: Cattle["status"] | null;
				newStatus: NonNullable<Cattle["status"]>;
				changedBy: UserId;
				reason: string | null;
				changedAt: Date;
			}>,
			CattleError
		>
	> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async countByStatus(
		ownerUserId: UserId
	): Promise<
		Result<Array<{ status: Cattle["status"]; count: number }>, CattleError>
	> {
		try {
			const drizzleDb = this.db.getDrizzle();
			const statusCounts = await drizzleDb
				.select({
					status: cattle.status,
					count: sql<number>`count(*)`
				})
				.from(cattle)
				.where(eq(cattle.ownerUserId, ownerUserId))
				.groupBy(cattle.status);

			return ok(statusCounts);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to count cattle by status",
				cause: error
			});
		}
	}

	async getAgeDistribution(
		ownerUserId: UserId
	): Promise<Result<Array<{ ageRange: string; count: number }>, CattleError>> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async getBreedDistribution(
		ownerUserId: UserId
	): Promise<Result<Array<{ breed: string; count: number }>, CattleError>> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async getCattleNeedingAttention(
		ownerUserId: UserId,
		currentDate: Date
	): Promise<
		Result<Array<{ cattle: Cattle; reasons: string[] }>, CattleError>
	> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async batchUpdate(
		updates: Array<{ id: CattleId; updates: Partial<NewCattleProps> }>
	): Promise<Result<Cattle[], CattleError>> {
		return err({ type: "InfraError", message: "Not implemented" });
	}

	async updateWithVersion(
		id: CattleId,
		updates: Partial<NewCattleProps>,
		expectedVersion: number
	): Promise<Result<Cattle, CattleError>> {
		return err({ type: "InfraError", message: "Not implemented" });
	}
}

/**
 * Cattle Repository Implementation
 *
 * 牛管理リポジトリのDrizzle ORM実装
 */

import { and, asc, desc, eq, exists, inArray, not, sql } from "drizzle-orm";
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
import type { CattleId, UserId } from "../../../shared/brand";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import { cattleDbMapper } from "../mappers/cattleDbMapper";

/**
 * アラート情報を取得するヘルパー関数
 */

async function getAlertInfoForCattle(
	db: D1DatabasePort,
	cattleId: number,
	ownerUserId: number
) {
	try {
		const rawDb = db.getRawD1();
		const alertRows = await rawDb
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
		console.error("Error fetching alert info:", error);
		return {
			hasActiveAlerts: false,
			alertCount: 0,
			highestSeverity: null
		};
	}
}

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
			const cattleRow = await drizzleDb
				.select()
				.from(cattle)
				.where(eq(cattle.cattleId, id))
				.get();

			if (!cattleRow) {
				return ok(null);
			}

			// アラート情報を取得
			const alertInfo = await getAlertInfoForCattle(
				this.db,
				cattleRow.cattleId,
				cattleRow.ownerUserId
			);

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
			const cattleRows = await drizzleDb
				.select()
				.from(cattle)
				.where(inArray(cattle.cattleId, ids));

			const cattleEntities = await Promise.all(
				cattleRows.map(async (row: typeof cattle.$inferSelect) => {
					const alertInfo = await getAlertInfoForCattle(
						this.db,
						row.cattleId,
						row.ownerUserId
					);
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

			const alertInfo = await getAlertInfoForCattle(
				this.db,
				cattleRow.cattleId,
				cattleRow.ownerUserId
			);

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
		// TODO: Implement search functionality
		return err({
			type: "InfraError",
			message: "Search functionality not yet implemented"
		});
	}

	async searchCount(
		criteria: CattleSearchCriteria
	): Promise<Result<number, CattleError>> {
		// TODO: Implement search count functionality
		return err({
			type: "InfraError",
			message: "Search count functionality not yet implemented"
		});
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

			const alertInfo = await getAlertInfoForCattle(
				this.db,
				result[0].cattleId,
				result[0].ownerUserId
			);

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

			const alertInfo = await getAlertInfoForCattle(
				this.db,
				result[0].cattleId,
				result[0].ownerUserId
			);

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
		return err({ type: "InfraError", message: "Not implemented" });
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

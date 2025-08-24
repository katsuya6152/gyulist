/**
 * Cattle Database Mapper
 *
 * ドメインエンティティとデータベースレコード間の変換を行うマッパー
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { cattle as CattleTable } from "../../../db/schema";
import type { Cattle, NewCattleProps } from "../../../domain/types/cattle";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Brand } from "../../../shared/brand";

/**
 * アラート情報の型定義
 */
type AlertInfo = {
	hasActiveAlerts: boolean;
	alertCount: number;
	highestSeverity: "high" | "medium" | "low" | null;
};

/**
 * 牛データベースマッパー
 */
export const cattleDbMapper = {
	/**
	 * データベースレコードからドメインエンティティへの変換
	 */
	toDomain(
		row: InferSelectModel<typeof CattleTable>,
		alertInfo: AlertInfo = {
			hasActiveAlerts: false,
			alertCount: 0,
			highestSeverity: null
		}
	): Cattle {
		return {
			cattleId: row.cattleId as unknown as CattleId,
			ownerUserId: row.ownerUserId as unknown as UserId,
			identificationNumber: row.identificationNumber as unknown as Brand<
				number,
				"IdentificationNumber"
			>,
			earTagNumber: (row.earTagNumber ?? null) as Cattle["earTagNumber"],
			name: (row.name ?? null) as Cattle["name"],
			gender: (row.gender ?? null) as Cattle["gender"],
			birthday: row.birthday ? new Date(row.birthday) : null,
			growthStage: (row.growthStage ?? null) as Cattle["growthStage"],
			breed: (row.breed ?? null) as Cattle["breed"],
			status: (row.status ?? null) as Cattle["status"],
			producerName: (row.producerName ?? null) as Cattle["producerName"],
			barn: (row.barn ?? null) as Cattle["barn"],
			breedingValue: (row.breedingValue ?? null) as Cattle["breedingValue"],
			notes: (row.notes ?? null) as Cattle["notes"],
			weight: (row.weight ?? null) as Cattle["weight"],
			score: (row.score ?? null) as Cattle["score"],
			createdAt: new Date(row.createdAt ?? new Date(0).toISOString()),
			updatedAt: new Date(row.updatedAt ?? new Date(0).toISOString()),
			version: 1, // Default version for existing records
			alerts: alertInfo
		};
	},

	/**
	 * 新規作成用のデータベース挿入データへの変換
	 */
	toDbInsert(props: NewCattleProps): InferInsertModel<typeof CattleTable> {
		const now = new Date().toISOString();
		return {
			ownerUserId: props.ownerUserId,
			identificationNumber: props.identificationNumber,
			earTagNumber: (props.earTagNumber as unknown as number) ?? null,
			name: props.name ?? null,
			gender: props.gender ?? null,
			birthday: props.birthday?.toISOString() ?? null,
			growthStage: props.growthStage ?? null,
			breed: props.breed ?? null,
			status: props.status ?? "HEALTHY",
			producerName: props.producerName ?? null,
			barn: props.barn ?? null,
			breedingValue: props.breedingValue ?? null,
			notes: props.notes ?? null,
			weight: props.weight ?? null,
			score: props.score ?? null,
			createdAt: now,
			updatedAt: now
		};
	},

	/**
	 * 更新用のデータベース更新データへの変換
	 */
	toDbUpdate(
		updates: Partial<NewCattleProps>
	): Partial<InferInsertModel<typeof CattleTable>> {
		const updateData: Partial<InferInsertModel<typeof CattleTable>> = {
			updatedAt: new Date().toISOString()
		};

		if (updates.identificationNumber !== undefined) {
			updateData.identificationNumber = updates.identificationNumber;
		}
		if (updates.earTagNumber !== undefined) {
			updateData.earTagNumber = updates.earTagNumber as unknown as number;
		}
		if (updates.name !== undefined) {
			updateData.name = updates.name;
		}
		if (updates.gender !== undefined) {
			updateData.gender = updates.gender;
		}
		if (updates.birthday !== undefined) {
			updateData.birthday = updates.birthday?.toISOString() ?? null;
		}
		if (updates.growthStage !== undefined) {
			updateData.growthStage = updates.growthStage;
		}
		if (updates.breed !== undefined) {
			updateData.breed = updates.breed;
		}
		if (updates.status !== undefined) {
			updateData.status = updates.status;
		}
		if (updates.producerName !== undefined) {
			updateData.producerName = updates.producerName;
		}
		if (updates.barn !== undefined) {
			updateData.barn = updates.barn;
		}
		if (updates.breedingValue !== undefined) {
			updateData.breedingValue = updates.breedingValue;
		}
		if (updates.notes !== undefined) {
			updateData.notes = updates.notes;
		}
		if (updates.weight !== undefined) {
			updateData.weight = updates.weight;
		}
		if (updates.score !== undefined) {
			updateData.score = updates.score;
		}

		return updateData;
	}
};

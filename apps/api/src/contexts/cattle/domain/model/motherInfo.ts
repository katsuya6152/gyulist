import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	MotherIdentificationNumber,
	MotherName,
	MotherScore
} from "./types";

/**
 * 母情報の値オブジェクト。
 */
export type MotherInfo = {
	/** 母牛のID */ readonly motherCattleId: CattleId;
	/** 母名 */ readonly motherName: MotherName | null;
	/** 母牛の個体識別番号 */ readonly motherIdentificationNumber: MotherIdentificationNumber | null;
	/** 母牛の評価スコア */ readonly motherScore: MotherScore | null;
};

/**
 * 母情報のファクトリ（バリデーション付き）。
 */
export function createMotherInfo(props: {
	motherCattleId: number;
	motherName?: string | null;
	motherIdentificationNumber?: number | null;
	motherScore?: number | null;
}): Result<MotherInfo, DomainError> {
	// Validation: motherCattleId must be positive
	if (!props.motherCattleId || props.motherCattleId <= 0) {
		return err({
			type: "ValidationError",
			message: "Mother cattle ID must be a positive number",
			field: "motherCattleId"
		});
	}

	// Validation: motherScore must be within valid range if provided
	if (props.motherScore !== null && props.motherScore !== undefined) {
		if (props.motherScore < 0 || props.motherScore > 100) {
			return err({
				type: "ValidationError",
				message: "Mother score must be between 0 and 100",
				field: "motherScore"
			});
		}
	}

	// Validation: motherName should not be empty string
	const motherName = props.motherName === "" ? null : props.motherName;

	// Convert undefined values to null for consistency
	const normalizedMotherName = motherName === undefined ? null : motherName;
	const motherIdentificationNumber =
		props.motherIdentificationNumber === undefined
			? null
			: props.motherIdentificationNumber;
	const motherScore =
		props.motherScore === undefined ? null : props.motherScore;

	return ok({
		motherCattleId: props.motherCattleId as CattleId,
		motherName: normalizedMotherName as MotherName | null,
		motherIdentificationNumber:
			motherIdentificationNumber as MotherIdentificationNumber | null,
		motherScore: motherScore as MotherScore | null
	});
}

/**
 * 母情報が一通り揃っているかを判定します。
 */
export function isMotherInfoComplete(motherInfo: MotherInfo): boolean {
	return !!(
		motherInfo.motherName &&
		motherInfo.motherIdentificationNumber &&
		motherInfo.motherScore !== null
	);
}

/**
 * 母情報の充足度（%）を返します。
 */
export function getMotherInfoCompleteness(motherInfo: MotherInfo): number {
	let completedFields = 1; // motherCattleId is always present
	const totalFields = 4;

	if (motherInfo.motherName) completedFields++;
	if (motherInfo.motherIdentificationNumber) completedFields++;
	if (motherInfo.motherScore !== null) completedFields++;

	return Math.round((completedFields / totalFields) * 100);
}

import type { Brand, CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";

// Brand types for mother information
export type MotherName = Brand<string, "MotherName">;
export type MotherIdentificationNumber = Brand<
	number,
	"MotherIdentificationNumber"
>;
export type MotherScore = Brand<number, "MotherScore">;

// Mother Information Value Object
export type MotherInfo = {
	readonly motherCattleId: CattleId;
	readonly motherName: MotherName | null;
	readonly motherIdentificationNumber: MotherIdentificationNumber | null;
	readonly motherScore: MotherScore | null;
};

// Factory function for creating mother info with validation
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

	return ok({
		motherCattleId: props.motherCattleId as CattleId,
		motherName: motherName as MotherName | null,
		motherIdentificationNumber:
			props.motherIdentificationNumber as MotherIdentificationNumber | null,
		motherScore: props.motherScore as MotherScore | null
	});
}

// Pure function to check if mother info is complete
export function isMotherInfoComplete(motherInfo: MotherInfo): boolean {
	return !!(
		motherInfo.motherName &&
		motherInfo.motherIdentificationNumber &&
		motherInfo.motherScore !== null
	);
}

// Pure function to get mother info completeness percentage
export function getMotherInfoCompleteness(motherInfo: MotherInfo): number {
	let completedFields = 1; // motherCattleId is always present
	const totalFields = 4;

	if (motherInfo.motherName) completedFields++;
	if (motherInfo.motherIdentificationNumber) completedFields++;
	if (motherInfo.motherScore !== null) completedFields++;

	return Math.round((completedFields / totalFields) * 100);
}

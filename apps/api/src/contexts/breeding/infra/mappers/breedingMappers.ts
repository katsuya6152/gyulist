import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
	bloodline as BloodlineTable,
	breedingStatus as BreedingStatusTable,
	breedingSummary as BreedingSummaryTable,
	motherInfo as MotherInfoTable
} from "../../../../db/schema";
import type { CattleId } from "../../../../shared/brand";
import type { Bloodline } from "../../../cattle/domain/model/bloodline";
import { createBloodline } from "../../../cattle/domain/model/bloodline";
import type { BreedingAggregate } from "../../../cattle/domain/model/breedingAggregate";
import { reconstructBreedingAggregate } from "../../../cattle/domain/model/breedingAggregate";
import type {
	BreedingEvent,
	BreedingStatus
} from "../../../cattle/domain/model/breedingStatus";
import { createInitialBreedingStatus } from "../../../cattle/domain/model/breedingStatus";
import type { BreedingSummary } from "../../../cattle/domain/model/breedingSummary";
import { createBreedingSummary } from "../../../cattle/domain/model/breedingSummary";
import type { MotherInfo } from "../../../cattle/domain/model/motherInfo";
import { createMotherInfo } from "../../../cattle/domain/model/motherInfo";

// Bloodline mappers
export function bloodlineFromDb(
	row: InferSelectModel<typeof BloodlineTable>
): Bloodline | null {
	const result = createBloodline({
		fatherName: row.fatherCattleName,
		motherFatherName: row.motherFatherCattleName,
		motherGrandFatherName: row.motherGrandFatherCattleName,
		motherGreatGrandFatherName: row.motherGreatGrandFatherCattleName
	});

	return result.ok ? result.value : null;
}

export function bloodlineToDb(
	cattleId: CattleId,
	bloodline: Bloodline
): InferInsertModel<typeof BloodlineTable> {
	return {
		cattleId: cattleId as unknown as number,
		fatherCattleName: bloodline.fatherName,
		motherFatherCattleName: bloodline.motherFatherName,
		motherGrandFatherCattleName: bloodline.motherGrandFatherName,
		motherGreatGrandFatherCattleName: bloodline.motherGreatGrandFatherName
	};
}

// Mother Info mappers
export function motherInfoFromDb(
	row: InferSelectModel<typeof MotherInfoTable>
): MotherInfo | null {
	const result = createMotherInfo({
		motherCattleId: row.motherCattleId,
		motherName: row.motherName,
		motherIdentificationNumber: row.motherIdentificationNumber
			? Number(row.motherIdentificationNumber)
			: null,
		motherScore: row.motherScore
	});

	return result.ok ? result.value : null;
}

export function motherInfoToDb(
	cattleId: CattleId,
	motherInfo: MotherInfo
): InferInsertModel<typeof MotherInfoTable> {
	return {
		cattleId: cattleId as unknown as number,
		motherCattleId: motherInfo.motherCattleId as unknown as number,
		motherName: motherInfo.motherName,
		motherIdentificationNumber:
			motherInfo.motherIdentificationNumber?.toString() ?? null,
		motherScore: motherInfo.motherScore as unknown as number | null
	};
}

// Breeding Status mappers
export function breedingStatusFromDb(
	row: InferSelectModel<typeof BreedingStatusTable>
): BreedingStatus | null {
	// Reconstruct breeding status from database fields
	// This is a simplified mapping - in a real implementation, you'd need more logic
	// to determine the exact state based on the database fields

	const parity = row.parity || 0;

	// Simple state inference based on available data
	if (row.pregnancyDays && row.pregnancyDays > 0) {
		return {
			type: "Pregnant",
			parity: parity as import(
				"../../../cattle/domain/model/breedingStatus"
			).Parity,
			pregnancyDays: row.pregnancyDays as import(
				"../../../cattle/domain/model/breedingStatus"
			).PregnancyDays,
			expectedCalvingDate: row.expectedCalvingDate
				? new Date(row.expectedCalvingDate)
				: new Date(),
			scheduledPregnancyCheckDate: row.scheduledPregnancyCheckDate
				? new Date(row.scheduledPregnancyCheckDate)
				: null,
			memo: row.breedingMemo as
				| import("../../../cattle/domain/model/breedingStatus").BreedingMemo
				| null
		};
	}

	if (row.daysAfterInsemination && row.daysAfterInsemination > 0) {
		return {
			type: "Inseminated",
			parity: parity as import(
				"../../../cattle/domain/model/breedingStatus"
			).Parity,
			daysAfterInsemination: row.daysAfterInsemination as import(
				"../../../cattle/domain/model/breedingStatus"
			).DaysAfterInsemination,
			inseminationCount: (row.inseminationCount || 1) as import(
				"../../../cattle/domain/model/breedingStatus"
			).InseminationCount,
			daysOpen: row.daysOpen as
				| import("../../../cattle/domain/model/breedingStatus").DaysOpen
				| null,
			memo: row.breedingMemo as
				| import("../../../cattle/domain/model/breedingStatus").BreedingMemo
				| null
		};
	}

	if (row.daysAfterCalving && row.daysAfterCalving > 0) {
		return {
			type: "PostCalving",
			parity: parity as import(
				"../../../cattle/domain/model/breedingStatus"
			).Parity,
			daysAfterCalving: row.daysAfterCalving as import(
				"../../../cattle/domain/model/breedingStatus"
			).DaysAfterCalving,
			isDifficultBirth: Boolean(row.isDifficultBirth),
			memo: row.breedingMemo as
				| import("../../../cattle/domain/model/breedingStatus").BreedingMemo
				| null
		};
	}

	// Default to NotBreeding
	const result = createInitialBreedingStatus({
		parity,
		memo: row.breedingMemo
	});

	return result.ok ? result.value : null;
}

export function breedingStatusToDb(
	cattleId: CattleId,
	status: BreedingStatus
): InferInsertModel<typeof BreedingStatusTable> {
	const base = {
		cattleId: cattleId as unknown as number,
		parity: status.parity as unknown as number,
		breedingMemo: status.memo
	};

	switch (status.type) {
		case "NotBreeding":
			return {
				...base,
				daysAfterCalving: status.daysAfterCalving as unknown as number | null,
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: null,
				isDifficultBirth: null
			};

		case "Inseminated":
			return {
				...base,
				daysAfterInsemination:
					status.daysAfterInsemination as unknown as number,
				inseminationCount: status.inseminationCount as unknown as number,
				daysOpen: status.daysOpen as unknown as number | null,
				daysAfterCalving: null,
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: null,
				pregnancyDays: null,
				isDifficultBirth: null
			};

		case "Pregnant":
			return {
				...base,
				pregnancyDays: status.pregnancyDays as unknown as number,
				expectedCalvingDate: status.expectedCalvingDate.toISOString(),
				scheduledPregnancyCheckDate:
					status.scheduledPregnancyCheckDate?.toISOString() ?? null,
				daysAfterCalving: null,
				daysOpen: null,
				daysAfterInsemination: null,
				inseminationCount: null,
				isDifficultBirth: null
			};

		case "PostCalving":
			return {
				...base,
				daysAfterCalving: status.daysAfterCalving as unknown as number,
				isDifficultBirth: status.isDifficultBirth,
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: null
			};

		default:
			return base as InferInsertModel<typeof BreedingStatusTable>;
	}
}

// Breeding Summary mappers
export function breedingSummaryFromDb(
	row: InferSelectModel<typeof BreedingSummaryTable>
): BreedingSummary | null {
	const result = createBreedingSummary({
		totalInseminationCount: row.totalInseminationCount || 0,
		averageDaysOpen: row.averageDaysOpen,
		averagePregnancyPeriod: row.averagePregnancyPeriod,
		averageCalvingInterval: row.averageCalvingInterval,
		difficultBirthCount: row.difficultBirthCount || 0,
		pregnancyHeadCount: row.pregnancyHeadCount || 0,
		pregnancySuccessRate: row.pregnancySuccessRate,
		lastUpdated: row.updatedAt ? new Date(row.updatedAt) : new Date()
	});

	return result.ok ? result.value : null;
}

export function breedingSummaryToDb(
	cattleId: CattleId,
	summary: BreedingSummary
): InferInsertModel<typeof BreedingSummaryTable> {
	return {
		cattleId: cattleId as unknown as number,
		totalInseminationCount: summary.totalInseminationCount as unknown as number,
		averageDaysOpen: summary.averageDaysOpen as unknown as number | null,
		averagePregnancyPeriod: summary.averagePregnancyPeriod as unknown as
			| number
			| null,
		averageCalvingInterval: summary.averageCalvingInterval as unknown as
			| number
			| null,
		difficultBirthCount: summary.difficultBirthCount as unknown as number,
		pregnancyHeadCount: summary.pregnancyHeadCount as unknown as number,
		pregnancySuccessRate: summary.pregnancySuccessRate as unknown as
			| number
			| null
	};
}

// Breeding Event serialization (for event store)
export function breedingEventToJson(event: BreedingEvent): string {
	return JSON.stringify({
		...event,
		timestamp: event.timestamp.toISOString()
	});
}

export function breedingEventFromJson(json: string): BreedingEvent | null {
	try {
		const parsed = JSON.parse(json);
		return {
			...parsed,
			timestamp: new Date(parsed.timestamp)
		};
	} catch {
		return null;
	}
}

// Breeding Aggregate reconstruction helpers
export function reconstructBreedingAggregateFromDb(data: {
	cattleId: CattleId;
	currentStatus: BreedingStatus;
	summary: BreedingSummary;
	history: BreedingEvent[];
	version: number;
	lastUpdated: Date;
}): BreedingAggregate {
	return reconstructBreedingAggregate(data);
}

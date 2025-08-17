import type { CattleId } from "../../shared/brand";

export interface CattleDetailsQueryPort {
	getBloodline(cattleId: CattleId): Promise<{
		bloodlineId: number;
		cattleId: number;
		fatherCattleName: string | null;
		motherFatherCattleName: string | null;
		motherGrandFatherCattleName: string | null;
		motherGreatGrandFatherCattleName: string | null;
	} | null>;

	getMotherInfo(cattleId: CattleId): Promise<{
		motherInfoId: number;
		cattleId: number;
		motherCattleId: number;
		motherName: string | null;
		motherIdentificationNumber: string | null;
		motherScore: number | null;
	} | null>;

	getBreedingStatus(cattleId: CattleId): Promise<{
		breedingStatusId: number;
		cattleId: number;
		parity: number | null;
		expectedCalvingDate: string | null;
		scheduledPregnancyCheckDate: string | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number | null;
		breedingMemo: string | null;
		isDifficultBirth: boolean | null;
		createdAt: string;
		updatedAt: string;
	} | null>;

	getBreedingSummary(cattleId: CattleId): Promise<{
		breedingSummaryId: number;
		cattleId: number;
		totalInseminationCount: number | null;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number | null;
		pregnancyHeadCount: number | null;
		pregnancySuccessRate: number | null;
		createdAt: string;
		updatedAt: string;
	} | null>;
}

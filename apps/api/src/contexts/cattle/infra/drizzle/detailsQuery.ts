import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import {
	bloodline,
	breedingStatus,
	breedingSummary,
	motherInfo
} from "../../../../db/schema";
import type { CattleId } from "../../../../shared/brand";
import type { CattleDetailsQueryPort } from "../../ports.details";

export function makeCattleDetailsQuery(
	db: AnyD1Database
): CattleDetailsQueryPort {
	const d = drizzle(db);
	return {
		async getBloodline(cattleId) {
			const rows = await d
				.select()
				.from(bloodline)
				.where(eq(bloodline.cattleId, cattleId as unknown as number))
				.limit(1);
			return rows[0] ?? null;
		},
		async getMotherInfo(cattleId) {
			const rows = await d
				.select()
				.from(motherInfo)
				.where(eq(motherInfo.cattleId, cattleId as unknown as number))
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
		async getBreedingStatus(cattleId: CattleId) {
			const rows = await d
				.select()
				.from(breedingStatus)
				.where(eq(breedingStatus.cattleId, cattleId as unknown as number))
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
		async getBreedingSummary(cattleId: CattleId) {
			const rows = await d
				.select()
				.from(breedingSummary)
				.where(eq(breedingSummary.cattleId, cattleId as unknown as number))
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
	} satisfies CattleDetailsQueryPort;
}

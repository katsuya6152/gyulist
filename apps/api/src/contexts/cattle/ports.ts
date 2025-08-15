import type { CattleId, UserId } from "../../shared/brand";
import type { Cattle } from "./domain/model/cattle";

export interface CattleRepoPort {
	findById(id: CattleId): Promise<Cattle | null>;
	search(q: {
		ownerUserId: UserId;
		cursor?: { id: number; value: string | number };
		limit: number;
		sortBy: "id" | "name" | "days_old";
		sortOrder: "asc" | "desc";
		search?: string;
		growthStage?: string[];
		gender?: string[];
		status?: string[];
	}): Promise<Cattle[]>;
	create(dto: Cattle): Promise<Cattle>;
	update(id: CattleId, partial: Partial<Cattle>): Promise<Cattle>;
	delete(id: CattleId): Promise<void>;
	countByStatus(
		ownerUserId: UserId
	): Promise<Array<{ status: Cattle["status"]; count: number }>>;
	appendStatusHistory(e: {
		cattleId: CattleId;
		oldStatus: Cattle["status"] | null;
		newStatus: NonNullable<Cattle["status"]>;
		changedBy: UserId;
		reason?: string | null;
	}): Promise<void>;

	// Breeding related upserts used by update flows
	upsertBreedingStatus(
		cattleId: CattleId,
		data: {
			parity?: number | null;
			expectedCalvingDate?: string | null;
			scheduledPregnancyCheckDate?: string | null;
			daysAfterCalving?: number | null;
			daysOpen?: number | null;
			pregnancyDays?: number | null;
			daysAfterInsemination?: number | null;
			inseminationCount?: number | null;
			breedingMemo?: string | null;
			isDifficultBirth?: boolean | null;
		}
	): Promise<void>;

	upsertBreedingSummary(
		cattleId: CattleId,
		data: {
			totalInseminationCount?: number | null;
			averageDaysOpen?: number | null;
			averagePregnancyPeriod?: number | null;
			averageCalvingInterval?: number | null;
			difficultBirthCount?: number | null;
			pregnancyHeadCount?: number | null;
			pregnancySuccessRate?: number | null;
		}
	): Promise<void>;
}

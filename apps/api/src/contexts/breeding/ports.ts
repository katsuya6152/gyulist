import type { CattleId } from "../../shared/brand";
import type { BreedingAggregate } from "../cattle/domain/model/breedingAggregate";
import type { BreedingEvent } from "../cattle/domain/model/breedingStatus";

// Breeding Repository Port
export interface BreedingRepoPort {
	// Aggregate operations
	findByCattleId(cattleId: CattleId): Promise<BreedingAggregate | null>;
	save(aggregate: BreedingAggregate): Promise<BreedingAggregate>;
	delete(cattleId: CattleId): Promise<void>;

	// Event history operations
	getBreedingHistory(
		cattleId: CattleId,
		startDate?: Date,
		endDate?: Date
	): Promise<BreedingEvent[]>;

	appendBreedingEvent(cattleId: CattleId, event: BreedingEvent): Promise<void>;

	// Query operations
	findCattleNeedingAttention(
		ownerUserId: import("../../shared/brand").UserId,
		currentDate: Date
	): Promise<CattleId[]>;

	getBreedingStatistics(
		ownerUserId: import("../../shared/brand").UserId,
		startDate: Date,
		endDate: Date
	): Promise<{
		totalInseminations: number;
		totalPregnancies: number;
		totalCalvings: number;
		averagePregnancyRate: number;
		difficultBirthRate: number;
	}>;
}

// Bloodline Repository Port
export interface BloodlineRepoPort {
	findByCattleId(
		cattleId: CattleId
	): Promise<import("../cattle/domain/model/bloodline").Bloodline | null>;
	save(
		cattleId: CattleId,
		bloodline: import("../cattle/domain/model/bloodline").Bloodline
	): Promise<void>;
	delete(cattleId: CattleId): Promise<void>;

	// Query operations
	searchByBloodline(
		ownerUserId: import("../../shared/brand").UserId,
		searchCriteria: {
			fatherName?: string;
			motherFatherName?: string;
			motherGrandFatherName?: string;
			motherGreatGrandFatherName?: string;
		}
	): Promise<CattleId[]>;
}

// Mother Information Repository Port
export interface MotherInfoRepoPort {
	findByCattleId(
		cattleId: CattleId
	): Promise<import("../cattle/domain/model/motherInfo").MotherInfo | null>;
	save(
		cattleId: CattleId,
		motherInfo: import("../cattle/domain/model/motherInfo").MotherInfo
	): Promise<void>;
	delete(cattleId: CattleId): Promise<void>;

	// Query operations
	findByMotherCattleId(motherCattleId: CattleId): Promise<CattleId[]>; // Find offspring
	getMotherInfoCompleteness(
		ownerUserId: import("../../shared/brand").UserId
	): Promise<
		Array<{
			cattleId: CattleId;
			completenessPercentage: number;
		}>
	>;
}

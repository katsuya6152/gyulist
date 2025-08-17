import type { CattleId, UserId } from "../../shared/brand";
import type { Cattle, NewCattleProps } from "./domain/model/cattle";

// Core Cattle Repository Port (focused on cattle entity only)
export interface CattleRepoPort {
	// Basic CRUD operations
	findById(id: CattleId): Promise<Cattle | null>;
	findByIds(ids: CattleId[]): Promise<Cattle[]>;
	findByIdentificationNumber(
		ownerUserId: UserId,
		identificationNumber: number
	): Promise<Cattle | null>;

	// Search and query operations
	search(q: {
		ownerUserId: UserId;
		cursor?: { id: number; value: string | number };
		limit: number;
		sortBy: "id" | "name" | "days_old" | "created_at" | "updated_at";
		sortOrder: "asc" | "desc";
		search?: string;
		growthStage?: string[];
		gender?: string[];
		status?: string[];
		minAge?: number;
		maxAge?: number;
		barn?: string;
		breed?: string;
	}): Promise<Cattle[]>;

	searchCount(q: {
		ownerUserId: UserId;
		search?: string;
		growthStage?: string[];
		gender?: string[];
		status?: string[];
		minAge?: number;
		maxAge?: number;
		barn?: string;
		breed?: string;
	}): Promise<number>;

	// Aggregate operations
	create(props: NewCattleProps): Promise<Cattle>;
	update(id: CattleId, updates: Partial<NewCattleProps>): Promise<Cattle>;
	delete(id: CattleId): Promise<void>;

	// Status and history tracking
	updateStatus(
		id: CattleId,
		newStatus: NonNullable<Cattle["status"]>,
		changedBy: UserId,
		reason?: string | null
	): Promise<Cattle>;

	getStatusHistory(
		cattleId: CattleId,
		limit?: number
	): Promise<
		Array<{
			oldStatus: Cattle["status"] | null;
			newStatus: NonNullable<Cattle["status"]>;
			changedBy: UserId;
			reason: string | null;
			changedAt: Date;
		}>
	>;

	// Statistics and reporting
	countByStatus(
		ownerUserId: UserId
	): Promise<Array<{ status: Cattle["status"]; count: number }>>;

	getAgeDistribution(
		ownerUserId: UserId
	): Promise<Array<{ ageRange: string; count: number }>>;

	getBreedDistribution(
		ownerUserId: UserId
	): Promise<Array<{ breed: string; count: number }>>;

	// Health and maintenance
	getCattleNeedingAttention(
		ownerUserId: UserId,
		currentDate: Date
	): Promise<
		Array<{
			cattle: Cattle;
			reasons: string[];
		}>
	>;

	// Batch operations
	batchUpdate(
		updates: Array<{
			id: CattleId;
			updates: Partial<NewCattleProps>;
		}>
	): Promise<Cattle[]>;

	// Optimistic concurrency control
	updateWithVersion(
		id: CattleId,
		updates: Partial<NewCattleProps>,
		expectedVersion: number
	): Promise<Cattle>;

	// Legacy methods still used by some routes (will be removed in future FDM refactoring)
	appendStatusHistory(e: {
		cattleId: CattleId;
		oldStatus?: import("./domain/model/cattle").Cattle["status"] | null;
		newStatus: NonNullable<import("./domain/model/cattle").Cattle["status"]>;
		changedBy: UserId;
		reason?: string | null;
	}): Promise<void>;
}

// Read-model port for cattle details (projection)
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

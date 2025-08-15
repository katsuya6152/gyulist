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

	upsertBreedingStatus(
		cattleId: CattleId,
		data: Record<string, unknown>
	): Promise<void>;
	upsertBreedingSummary(
		cattleId: CattleId,
		data: Record<string, unknown>
	): Promise<void>;
}

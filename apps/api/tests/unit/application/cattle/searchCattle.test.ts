import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchCattleUseCase } from "../../../../src/application/use-cases/cattle/searchCattle";
import type { CattleRepository } from "../../../../src/domain/ports/cattle";
import type {
	Barn,
	Breed,
	BreedingValue,
	Cattle,
	CattleName,
	EarTagNumber,
	Gender,
	GrowthStage,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Status,
	Weight
} from "../../../../src/domain/types/cattle";
import type { CattleId, UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("searchCattleUseCase", () => {
	let mockCattleRepo: {
		findById: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		searchCount: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		count: ReturnType<typeof vi.fn>;
		findByEarTagNumber: ReturnType<typeof vi.fn>;
		findByUserId: ReturnType<typeof vi.fn>;
		findByBreedingStatus: ReturnType<typeof vi.fn>;
		findByAgeRange: ReturnType<typeof vi.fn>;
		findByBreed: ReturnType<typeof vi.fn>;
		findByHealthStatus: ReturnType<typeof vi.fn>;
		findByLocation: ReturnType<typeof vi.fn>;
		findByDateRange: ReturnType<typeof vi.fn>;
		getCattleStats: ReturnType<typeof vi.fn>;
		batchUpdate: ReturnType<typeof vi.fn>;
		batchDelete: ReturnType<typeof vi.fn>;
		findByBloodline: ReturnType<typeof vi.fn>;
		findByMother: ReturnType<typeof vi.fn>;
		findByFather: ReturnType<typeof vi.fn>;
		findByGeneration: ReturnType<typeof vi.fn>;
		findByBreedingHistory: ReturnType<typeof vi.fn>;
		findByHealthHistory: ReturnType<typeof vi.fn>;
		findByEventHistory: ReturnType<typeof vi.fn>;
		findByKpiHistory: ReturnType<typeof vi.fn>;
		findByAlertHistory: ReturnType<typeof vi.fn>;
		findByRegistrationHistory: ReturnType<typeof vi.fn>;
		findByBreedingSummary: ReturnType<typeof vi.fn>;
		findByBreedingTrends: ReturnType<typeof vi.fn>;
		findByBreedingMetrics: ReturnType<typeof vi.fn>;
		findByBreedingKpi: ReturnType<typeof vi.fn>;
		findByBreedingKpiDelta: ReturnType<typeof vi.fn>;
		findByBreedingKpiTrends: ReturnType<typeof vi.fn>;
		findByBreedingKpiMetrics: ReturnType<typeof vi.fn>;
		findByBreedingKpiSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiHistory: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaHistory: ReturnType<typeof vi.fn>;
		findByBreedingKpiTrendsHistory: ReturnType<typeof vi.fn>;
		findByBreedingKpiMetricsHistory: ReturnType<typeof vi.fn>;
		findByBreedingKpiSummaryHistory: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaTrends: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaMetrics: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiTrendsMetrics: ReturnType<typeof vi.fn>;
		findByBreedingKpiTrendsSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiMetricsSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaTrendsMetrics: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaTrendsSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaMetricsSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiTrendsMetricsSummary: ReturnType<typeof vi.fn>;
		findByBreedingKpiDeltaTrendsMetricsSummary: ReturnType<typeof vi.fn>;
		findByIds: ReturnType<typeof vi.fn>;
		findByIdentificationNumber: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
		getStatusHistory: ReturnType<typeof vi.fn>;
		countByStatus: ReturnType<typeof vi.fn>;
		getAgeDistribution: ReturnType<typeof vi.fn>;
		getBreedDistribution: ReturnType<typeof vi.fn>;
		getCattleNeedingAttention: ReturnType<typeof vi.fn>;
		updateWithVersion: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockCattleRepo = {
			findById: vi.fn(),
			search: vi.fn(),
			searchCount: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
			findByEarTagNumber: vi.fn(),
			findByUserId: vi.fn(),
			findByBreedingStatus: vi.fn(),
			findByAgeRange: vi.fn(),
			findByBreed: vi.fn(),
			findByHealthStatus: vi.fn(),
			findByLocation: vi.fn(),
			findByDateRange: vi.fn(),
			getCattleStats: vi.fn(),
			batchUpdate: vi.fn(),
			batchDelete: vi.fn(),
			findByBloodline: vi.fn(),
			findByMother: vi.fn(),
			findByFather: vi.fn(),
			findByGeneration: vi.fn(),
			findByBreedingHistory: vi.fn(),
			findByHealthHistory: vi.fn(),
			findByEventHistory: vi.fn(),
			findByKpiHistory: vi.fn(),
			findByAlertHistory: vi.fn(),
			findByRegistrationHistory: vi.fn(),
			findByBreedingSummary: vi.fn(),
			findByBreedingTrends: vi.fn(),
			findByBreedingMetrics: vi.fn(),
			findByBreedingKpi: vi.fn(),
			findByBreedingKpiDelta: vi.fn(),
			findByBreedingKpiTrends: vi.fn(),
			findByBreedingKpiMetrics: vi.fn(),
			findByBreedingKpiSummary: vi.fn(),
			findByBreedingKpiHistory: vi.fn(),
			findByBreedingKpiDeltaHistory: vi.fn(),
			findByBreedingKpiTrendsHistory: vi.fn(),
			findByBreedingKpiMetricsHistory: vi.fn(),
			findByBreedingKpiSummaryHistory: vi.fn(),
			findByBreedingKpiDeltaTrends: vi.fn(),
			findByBreedingKpiDeltaMetrics: vi.fn(),
			findByBreedingKpiDeltaSummary: vi.fn(),
			findByBreedingKpiTrendsMetrics: vi.fn(),
			findByBreedingKpiTrendsSummary: vi.fn(),
			findByBreedingKpiMetricsSummary: vi.fn(),
			findByBreedingKpiDeltaTrendsMetrics: vi.fn(),
			findByBreedingKpiDeltaTrendsSummary: vi.fn(),
			findByBreedingKpiDeltaMetricsSummary: vi.fn(),
			findByBreedingKpiTrendsMetricsSummary: vi.fn(),
			findByBreedingKpiDeltaTrendsMetricsSummary: vi.fn(),
			findByIds: vi.fn(),
			findByIdentificationNumber: vi.fn(),
			updateStatus: vi.fn(),
			getStatusHistory: vi.fn(),
			countByStatus: vi.fn(),
			getAgeDistribution: vi.fn(),
			getBreedDistribution: vi.fn(),
			getCattleNeedingAttention: vi.fn(),
			updateWithVersion: vi.fn()
		};
	});

	it("should search cattle successfully", async () => {
		const userId = 1 as UserId;
		const mockCattle: Cattle = {
			cattleId: 1 as unknown as CattleId,
			identificationNumber: 123 as unknown as IdentificationNumber,
			earTagNumber: "12345" as unknown as EarTagNumber,
			name: "Test Cow" as unknown as CattleName,
			breed: "Holstein" as unknown as Breed,
			gender: "雌" as unknown as Gender,
			birthday: new Date("2020-01-01"),
			growthStage: "CALF" as unknown as GrowthStage,
			status: "HEALTHY" as unknown as Status,
			producerName: "Test Producer" as unknown as ProducerName,
			barn: "Barn A" as unknown as Barn,
			breedingValue: "high" as unknown as BreedingValue,
			notes: "Test notes" as unknown as Notes,
			weight: 500 as unknown as Weight,
			score: 85 as unknown as Score,
			ownerUserId: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
			version: 1,
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
		};

		mockCattleRepo.search.mockResolvedValue(ok([mockCattle]));
		mockCattleRepo.searchCount.mockResolvedValue(ok(1));

		const useCase = searchCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			criteria: { ownerUserId: userId },
			limit: 10,
			sortBy: "id",
			sortOrder: "asc"
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.results).toHaveLength(1);
			expect(result.value.totalCount).toBe(1);
			expect(result.value.hasNext).toBe(false);
			expect(result.value.nextCursor).toBeNull();
		}
	});

	it("should handle search error", async () => {
		const userId = 1 as UserId;

		mockCattleRepo.search.mockResolvedValue({
			ok: false,
			error: { type: "NotFound", entity: "Cattle", id: 1, message: "Not found" }
		});

		const useCase = searchCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			criteria: { ownerUserId: userId },
			limit: 10,
			sortBy: "id",
			sortOrder: "asc"
		});

		expect(result.ok).toBe(false);
	});

	it("should handle count error", async () => {
		const userId = 1 as UserId;
		const mockCattle: Cattle = {
			cattleId: 1 as unknown as CattleId,
			identificationNumber: 123 as unknown as IdentificationNumber,
			earTagNumber: "12345" as unknown as EarTagNumber,
			name: "Test Cow" as unknown as CattleName,
			breed: "Holstein" as unknown as Breed,
			gender: "雌" as unknown as Gender,
			birthday: new Date("2020-01-01"),
			growthStage: "CALF" as unknown as GrowthStage,
			status: "HEALTHY" as unknown as Status,
			producerName: "Test Producer" as unknown as ProducerName,
			barn: "Barn A" as unknown as Barn,
			breedingValue: "high" as unknown as BreedingValue,
			notes: "Test notes" as unknown as Notes,
			weight: 500 as unknown as Weight,
			score: 85 as unknown as Score,
			ownerUserId: userId,
			createdAt: new Date(),
			updatedAt: new Date(),
			version: 1,
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
		};

		mockCattleRepo.search.mockResolvedValue(ok([mockCattle]));
		mockCattleRepo.searchCount.mockResolvedValue({
			ok: false,
			error: { type: "NotFound", entity: "Cattle", id: 1, message: "Not found" }
		});

		const useCase = searchCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			criteria: { ownerUserId: userId },
			limit: 10,
			sortBy: "id",
			sortOrder: "asc"
		});

		expect(result.ok).toBe(false);
	});

	it("should handle repository error", async () => {
		const userId = 1 as UserId;

		mockCattleRepo.search.mockRejectedValue(new Error("Database error"));

		const useCase = searchCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			criteria: { ownerUserId: userId },
			limit: 10,
			sortBy: "id",
			sortOrder: "asc"
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to search cattle");
		}
	});
});

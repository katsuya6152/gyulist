import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCattleUseCase } from "../../../../src/application/use-cases/cattle/updateCattle";
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
	NewCattleProps,
	Notes,
	ProducerName,
	Score,
	Status,
	Weight
} from "../../../../src/domain/types/cattle";
import type { CattleId, UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("updateCattleUseCase", () => {
	let mockCattleRepo: {
		findById: ReturnType<typeof vi.fn>;
		findByIds: ReturnType<typeof vi.fn>;
		findByIdentificationNumber: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		searchCount: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
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
		getStatusHistory: ReturnType<typeof vi.fn>;
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
		countByStatus: ReturnType<typeof vi.fn>;
		getAgeDistribution: ReturnType<typeof vi.fn>;
		getBreedDistribution: ReturnType<typeof vi.fn>;
		getCattleNeedingAttention: ReturnType<typeof vi.fn>;
		updateWithVersion: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockCattleRepo = {
			findById: vi.fn(),
			findByIds: vi.fn(),
			findByIdentificationNumber: vi.fn(),
			search: vi.fn(),
			searchCount: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateStatus: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
			countByStatus: vi.fn(),
			findByEarTagNumber: vi.fn(),
			findByUserId: vi.fn(),
			findByBreedingStatus: vi.fn(),
			findByAgeRange: vi.fn(),
			findByBreed: vi.fn(),
			findByHealthStatus: vi.fn(),
			findByLocation: vi.fn(),
			findByDateRange: vi.fn(),
			getCattleStats: vi.fn(),
			getStatusHistory: vi.fn(),
			getAgeDistribution: vi.fn(),
			getBreedDistribution: vi.fn(),
			getCattleNeedingAttention: vi.fn(),
			batchUpdate: vi.fn(),
			batchDelete: vi.fn(),
			updateWithVersion: vi.fn(),
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
			findByBreedingKpiDeltaTrendsMetricsSummary: vi.fn()
		};
	});

	it("should update cattle successfully", async () => {
		const cattleId = 1 as CattleId;
		const userId = 1 as UserId;
		const updates: Partial<NewCattleProps> = {
			name: "Updated Cow Name",
			breed: "Jersey"
		};

		const existingCattle: Cattle = {
			cattleId: cattleId,
			identificationNumber: 123 as IdentificationNumber,
			earTagNumber: "12345" as EarTagNumber,
			name: "Test Cow" as CattleName,
			breed: "Holstein" as Breed,
			gender: "雌" as Gender,
			birthday: new Date("2020-01-01"),
			growthStage: "CALF" as GrowthStage,
			status: "HEALTHY" as Status,
			producerName: "Test Producer" as ProducerName,
			barn: "Barn A" as Barn,
			breedingValue: "high" as BreedingValue,
			notes: "Test notes" as Notes,
			weight: 500 as Weight,
			score: 85 as Score,
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

		const updatedCattle: Cattle = {
			...existingCattle,
			name: "Updated Cow Name" as CattleName,
			breed: "Jersey" as Breed
		};

		mockCattleRepo.findById.mockResolvedValue(ok(existingCattle));
		mockCattleRepo.update.mockResolvedValue(ok(updatedCattle));

		const useCase = updateCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			cattleId,
			ownerUserId: userId,
			updates
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.name).toBe("Updated Cow Name");
			expect(result.value.breed).toBe("Jersey");
		}
		expect(mockCattleRepo.findById).toHaveBeenCalledWith(cattleId);
		expect(mockCattleRepo.update).toHaveBeenCalledWith(cattleId, updates);
	});

	it("should return error when cattle not found", async () => {
		const cattleId = 999 as CattleId;
		const userId = 1 as UserId;
		const updates: Partial<NewCattleProps> = {
			name: "Updated Cow Name"
		};

		mockCattleRepo.findById.mockResolvedValue(ok(null));

		const useCase = updateCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			cattleId,
			ownerUserId: userId,
			updates
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("NotFound");
			expect(result.error.message).toBe("指定された牛が見つかりません");
		}
	});

	it("should return error when user lacks permission", async () => {
		const cattleId = 1 as CattleId;
		const userId = 1 as UserId;
		const differentUserId = 2 as UserId;
		const updates: Partial<NewCattleProps> = {
			name: "Updated Cow Name"
		};

		const existingCattle: Cattle = {
			cattleId: cattleId,
			identificationNumber: 123 as IdentificationNumber,
			earTagNumber: "12345" as EarTagNumber,
			name: "Test Cow" as CattleName,
			breed: "Holstein" as Breed,
			gender: "雌" as Gender,
			birthday: new Date("2020-01-01"),
			growthStage: "CALF" as GrowthStage,
			status: "HEALTHY" as Status,
			producerName: "Test Producer" as ProducerName,
			barn: "Barn A" as Barn,
			breedingValue: "high" as BreedingValue,
			notes: "Test notes" as Notes,
			weight: 500 as Weight,
			score: 85 as Score,
			ownerUserId: differentUserId, // 異なるユーザー
			createdAt: new Date(),
			updatedAt: new Date(),
			version: 1,
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
		};

		mockCattleRepo.findById.mockResolvedValue(ok(existingCattle));

		const useCase = updateCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			cattleId,
			ownerUserId: userId,
			updates
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("Forbidden");
			expect(result.error.message).toBe("この牛の更新権限がありません");
		}
	});

	it("should handle repository error", async () => {
		const cattleId = 1 as CattleId;
		const userId = 1 as UserId;
		const updates: Partial<NewCattleProps> = {
			name: "Updated Cow Name"
		};

		mockCattleRepo.findById.mockRejectedValue(new Error("Database error"));

		const useCase = updateCattleUseCase({
			cattleRepo: mockCattleRepo
		});

		const result = await useCase({
			cattleId,
			ownerUserId: userId,
			updates
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to update cattle");
		}
	});
});

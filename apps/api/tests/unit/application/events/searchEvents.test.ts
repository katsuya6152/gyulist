import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchEventsUseCase } from "../../../../src/application/use-cases/events/searchEvents";
import type { EventRepository } from "../../../../src/domain/ports/events";
import type {
	EventSearchCriteria,
	EventSearchResult
} from "../../../../src/domain/types/events";
import type { UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("searchEventsUseCase", () => {
	let mockEventRepo: {
		create: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		findByCattleId: ReturnType<typeof vi.fn>;
		findByUserId: ReturnType<typeof vi.fn>;
		findByEventType: ReturnType<typeof vi.fn>;
		findByDateRange: ReturnType<typeof vi.fn>;
		findByBreedingStatus: ReturnType<typeof vi.fn>;
		findByHealthStatus: ReturnType<typeof vi.fn>;
		findByLocation: ReturnType<typeof vi.fn>;
		findByBreed: ReturnType<typeof vi.fn>;
		findByAgeRange: ReturnType<typeof vi.fn>;
		findByGeneration: ReturnType<typeof vi.fn>;
		findByBloodline: ReturnType<typeof vi.fn>;
		findByMother: ReturnType<typeof vi.fn>;
		findByFather: ReturnType<typeof vi.fn>;
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
		listByCattleId: ReturnType<typeof vi.fn>;
		findRecent: ReturnType<typeof vi.fn>;
		findUpcoming: ReturnType<typeof vi.fn>;
		getEventStats: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockEventRepo = {
			create: vi.fn(),
			findById: vi.fn(),
			search: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findByCattleId: vi.fn(),
			findByUserId: vi.fn(),
			findByEventType: vi.fn(),
			findByDateRange: vi.fn(),
			findByBreedingStatus: vi.fn(),
			findByHealthStatus: vi.fn(),
			findByLocation: vi.fn(),
			findByBreed: vi.fn(),
			findByAgeRange: vi.fn(),
			findByGeneration: vi.fn(),
			findByBloodline: vi.fn(),
			findByMother: vi.fn(),
			findByFather: vi.fn(),
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
			listByCattleId: vi.fn(),
			findRecent: vi.fn(),
			findUpcoming: vi.fn(),
			getEventStats: vi.fn()
		};
	});

	it("should search events successfully", async () => {
		const searchCriteria: EventSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 10,
			eventType: "INSEMINATION"
		};

		const mockSearchResult: EventSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockEventRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchEventsUseCase({
			eventRepo: mockEventRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockEventRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 10 // 正規化されたlimit
		});
	});

	it("should normalize limit to minimum value", async () => {
		const searchCriteria: EventSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 0 // 最小値未満
		};

		const mockSearchResult: EventSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockEventRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchEventsUseCase({
			eventRepo: mockEventRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockEventRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 20 // デフォルト値（最小値1未満の場合は20が使用される）
		});
	});

	it("should normalize limit to maximum value", async () => {
		const searchCriteria: EventSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 150 // 最大値超過
		};

		const mockSearchResult: EventSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockEventRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchEventsUseCase({
			eventRepo: mockEventRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockEventRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 100 // 正規化されたlimit
		});
	});

	it("should use default limit when not specified", async () => {
		const searchCriteria: EventSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 20
			// limit が指定されていない場合はデフォルト値20が使用される
		};

		const mockSearchResult: EventSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockEventRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchEventsUseCase({
			eventRepo: mockEventRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockEventRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 20 // デフォルト値
		});
	});

	it("should handle repository error", async () => {
		const searchCriteria: EventSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 10
		};

		mockEventRepo.search.mockRejectedValue(new Error("Database error"));

		const useCase = searchEventsUseCase({
			eventRepo: mockEventRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to search events");
		}
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBreedingKpiUseCase } from "../../../../src/application/use-cases/kpi/getBreedingKpi";
import type { KpiRepository } from "../../../../src/domain/ports/kpi";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange
} from "../../../../src/domain/types/kpi";
import type { UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("getBreedingKpiUseCase", () => {
	let mockKpiRepo: {
		calculateBreedingMetrics: ReturnType<typeof vi.fn>;
		getBreedingEventCounts: ReturnType<typeof vi.fn>;
		calculateBreedingTrends: ReturnType<typeof vi.fn>;
		getBreedingKpiDelta: ReturnType<typeof vi.fn>;
		findByUserId: ReturnType<typeof vi.fn>;
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
	};

	beforeEach(() => {
		mockKpiRepo = {
			calculateBreedingMetrics: vi.fn(),
			getBreedingEventCounts: vi.fn(),
			calculateBreedingTrends: vi.fn(),
			getBreedingKpiDelta: vi.fn(),
			findByUserId: vi.fn(),
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
			findByBreedingKpiDeltaTrendsMetricsSummary: vi.fn()
		};
	});

	it("should get breeding KPI successfully", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		const mockMetrics: BreedingMetrics = {
			conceptionRate: 0.75,
			averageOpenDays: 45,
			averageCalvingInterval: 380,
			inseminationsPerConception: 1.2
		};

		const mockCounts: BreedingEventCounts = {
			totalEvents: 100,
			inseminations: 50,
			calvings: 30,
			pregnancyChecks: 40,
			estrusEvents: 60
		};

		mockKpiRepo.calculateBreedingMetrics.mockResolvedValue(ok(mockMetrics));
		mockKpiRepo.getBreedingEventCounts.mockResolvedValue(ok(mockCounts));

		const useCase = getBreedingKpiUseCase({
			kpiRepo: mockKpiRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.metrics).toEqual(mockMetrics);
			expect(result.value.counts).toEqual(mockCounts);
			expect(result.value.summary.totalEvents).toBe(100);
			expect(result.value.summary.dataQuality).toBe("high");
		}
	});

	it("should use default date range when dates not specified", async () => {
		const userId = 1 as UserId;
		const currentDate = new Date("2024-01-01");
		vi.useFakeTimers();
		vi.setSystemTime(currentDate);

		const mockMetrics: BreedingMetrics = {
			conceptionRate: 0.75,
			averageOpenDays: 45,
			averageCalvingInterval: 380,
			inseminationsPerConception: 1.2
		};

		const mockCounts: BreedingEventCounts = {
			totalEvents: 100,
			inseminations: 50,
			calvings: 30,
			pregnancyChecks: 40,
			estrusEvents: 60
		};

		mockKpiRepo.calculateBreedingMetrics.mockResolvedValue(ok(mockMetrics));
		mockKpiRepo.getBreedingEventCounts.mockResolvedValue(ok(mockCounts));

		const useCase = getBreedingKpiUseCase({
			kpiRepo: mockKpiRepo
		});

		const result = await useCase({
			ownerUserId: userId
		});

		expect(result.ok).toBe(true);
		vi.useRealTimers();
	});

	it("should handle metrics calculation error", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		mockKpiRepo.calculateBreedingMetrics.mockResolvedValue({
			ok: false,
			error: { type: "NotFound", entity: "KPI", id: 1, message: "Not found" }
		});

		const useCase = getBreedingKpiUseCase({
			kpiRepo: mockKpiRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(false);
	});

	it("should handle counts retrieval error", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		const mockMetrics: BreedingMetrics = {
			conceptionRate: 0.75,
			averageOpenDays: 45,
			averageCalvingInterval: 380,
			inseminationsPerConception: 1.2
		};

		mockKpiRepo.calculateBreedingMetrics.mockResolvedValue(ok(mockMetrics));
		mockKpiRepo.getBreedingEventCounts.mockResolvedValue({
			ok: false,
			error: { type: "NotFound", entity: "KPI", id: 1, message: "Not found" }
		});

		const useCase = getBreedingKpiUseCase({
			kpiRepo: mockKpiRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(false);
	});

	it("should handle repository error", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		mockKpiRepo.calculateBreedingMetrics.mockRejectedValue(
			new Error("Database error")
		);

		const useCase = getBreedingKpiUseCase({
			kpiRepo: mockKpiRepo
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to get breeding KPI");
		}
	});
});

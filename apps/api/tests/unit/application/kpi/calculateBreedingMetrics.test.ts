import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateBreedingMetricsUseCase } from "../../../../src/application/use-cases/kpi/calculateBreedingMetrics";
import type { KpiRepository } from "../../../../src/domain/ports/kpi";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange
} from "../../../../src/domain/types/kpi";
import type { UserId } from "../../../../src/shared/brand";
import type { ClockPort } from "../../../../src/shared/ports/clock";
import { ok } from "../../../../src/shared/result";

describe("calculateBreedingMetricsUseCase", () => {
	let mockKpiRepo: {
		calculateBreedingMetrics: ReturnType<typeof vi.fn>;
		getBreedingEventCounts: ReturnType<typeof vi.fn>;
		calculateBreedingTrends: ReturnType<typeof vi.fn>;
		analyzeBreedingTrends: ReturnType<typeof vi.fn>;
		getBreedingKpiDelta: ReturnType<typeof vi.fn>;
		findEventsForBreedingKpi: ReturnType<typeof vi.fn>;
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
	let mockClock: {
		now: ReturnType<typeof vi.fn>;
	};
	let currentTime: Date;

	beforeEach(() => {
		currentTime = new Date("2024-01-01T00:00:00Z");
		mockClock = {
			now: vi.fn().mockReturnValue(currentTime)
		};
		mockKpiRepo = {
			calculateBreedingMetrics: vi.fn(),
			getBreedingEventCounts: vi.fn(),
			calculateBreedingTrends: vi.fn(),
			analyzeBreedingTrends: vi.fn(),
			getBreedingKpiDelta: vi.fn(),
			findEventsForBreedingKpi: vi.fn(),
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

	it("should calculate breeding metrics successfully", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		const mockRawEvents = [
			{
				cattleId: 1,
				eventType: "INSEMINATION",
				eventDatetime: "2023-06-01T00:00:00Z",
				metadata: {}
			},
			{
				cattleId: 1,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: "2023-07-01T00:00:00Z",
				metadata: { result: "positive" }
			},
			{
				cattleId: 2,
				eventType: "CALVING",
				eventDatetime: "2023-12-01T00:00:00Z",
				metadata: {}
			}
		];

		mockKpiRepo.findEventsForBreedingKpi.mockResolvedValue(ok(mockRawEvents));

		const useCase = calculateBreedingMetricsUseCase({
			kpiRepo: mockKpiRepo,
			clock: mockClock
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.period).toBeDefined();
			expect(result.value.counts).toBeDefined();
			expect(result.value.metrics).toBeDefined();
			expect(result.value.insights).toBeDefined();
			expect(result.value.calculationDetails).toBeDefined();
		}
		expect(mockKpiRepo.findEventsForBreedingKpi).toHaveBeenCalledWith(
			userId,
			fromDate,
			toDate
		);
	});

	it("should use default date range when dates not specified", async () => {
		const userId = 1 as UserId;
		const currentDate = new Date("2024-01-01");
		vi.useFakeTimers();
		vi.setSystemTime(currentDate);

		const mockRawEvents = [
			{
				cattleId: 1,
				eventType: "INSEMINATION",
				eventDatetime: "2023-06-01T00:00:00Z",
				metadata: {}
			}
		];

		mockKpiRepo.findEventsForBreedingKpi.mockResolvedValue(ok(mockRawEvents));

		const useCase = calculateBreedingMetricsUseCase({
			kpiRepo: mockKpiRepo,
			clock: mockClock
		});

		const result = await useCase({
			ownerUserId: userId
		});

		expect(result.ok).toBe(true);
		vi.useRealTimers();
	});

	it("should handle insufficient data error", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		mockKpiRepo.findEventsForBreedingKpi.mockResolvedValue(ok([]));

		const useCase = calculateBreedingMetricsUseCase({
			kpiRepo: mockKpiRepo,
			clock: mockClock
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("DataInsufficientError");
			expect(result.error.message).toBe(
				"No breeding events found in the specified period"
			);
		}
	});

	it("should handle repository error", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		mockKpiRepo.findEventsForBreedingKpi.mockRejectedValue(
			new Error("Database error")
		);

		const useCase = calculateBreedingMetricsUseCase({
			kpiRepo: mockKpiRepo,
			clock: mockClock
		});

		const result = await useCase({
			ownerUserId: userId,
			fromDate,
			toDate
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to calculate breeding metrics");
		}
	});
});

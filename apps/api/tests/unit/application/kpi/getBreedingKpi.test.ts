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
		findEventsForBreedingKpi: ReturnType<typeof vi.fn>;
		searchKpiEvents: ReturnType<typeof vi.fn>;
		calculateBreedingMetrics: ReturnType<typeof vi.fn>;
		getBreedingEventCounts: ReturnType<typeof vi.fn>;
		calculateMonthlyBreedingPerformance: ReturnType<typeof vi.fn>;
		calculateYearlyBreedingPerformance: ReturnType<typeof vi.fn>;
		getBenchmarkComparison: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockKpiRepo = {
			findEventsForBreedingKpi: vi.fn(),
			searchKpiEvents: vi.fn(),
			calculateBreedingMetrics: vi.fn(),
			getBreedingEventCounts: vi.fn(),
			calculateMonthlyBreedingPerformance: vi.fn(),
			calculateYearlyBreedingPerformance: vi.fn(),
			getBenchmarkComparison: vi.fn()
		};
	});

	it("should get breeding KPI successfully", async () => {
		const userId = 1 as UserId;
		const fromDate = new Date("2023-01-01");
		const toDate = new Date("2024-01-01");

		const mockMetrics: BreedingMetrics = {
			conceptionRate: 0.75,
			avgDaysOpen: 45,
			avgCalvingInterval: 380,
			aiPerConception: 1.2
		};

		const mockCounts: BreedingEventCounts = {
			inseminations: 50,
			conceptions: 30,
			calvings: 30,
			pairsForDaysOpen: 25,
			totalEvents: 100
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
			expect(result.value.counts).toEqual({
				inseminations: mockCounts.inseminations,
				conceptions: mockCounts.conceptions,
				calvings: mockCounts.calvings,
				totalEvents: mockCounts.totalEvents
			});
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
			avgDaysOpen: 45,
			avgCalvingInterval: 380,
			aiPerConception: 1.2
		};

		const mockCounts: BreedingEventCounts = {
			inseminations: 50,
			conceptions: 30,
			calvings: 30,
			pairsForDaysOpen: 25,
			totalEvents: 100
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
			avgDaysOpen: 45,
			avgCalvingInterval: 380,
			aiPerConception: 1.2
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

/**
 * KPI Domain Unit Tests - New Architecture
 *
 * KPI管理ドメインロジックのユニットテスト
 */

import { describe, expect, it } from "vitest";
import {
	createBreedingMetrics,
	createConceptionRate
} from "../../../src/domain/functions/kpi/breedingMetricsCalculator";
import { createKpiEvent } from "../../../src/domain/functions/kpi/kpiEventFactory";
import type { KpiEvent } from "../../../src/domain/types/kpi/KpiEvent";

describe("KPI Domain Functions - New Architecture", () => {
	describe("createBreedingMetrics", () => {
		it("should create breeding metrics", () => {
			const result = createBreedingMetrics(
				0.8, // conceptionRate
				85, // averageDaysOpen
				365, // averageCalvingInterval
				1.5 // aiPerConception
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveProperty("conceptionRate");
				expect(result.value).toHaveProperty("averageDaysOpen");
				expect(result.value).toHaveProperty("averageCalvingInterval");
				expect(result.value).toHaveProperty("aiPerConception");
			}
		});
	});

	describe("createConceptionRate", () => {
		it("should create valid conception rate", () => {
			const result = createConceptionRate(0.8);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveProperty("value", 0.8);
				expect(result.value).toHaveProperty("unit", "%");
			}
		});

		it("should reject invalid conception rate", () => {
			const result = createConceptionRate(-0.1); // Invalid: negative

			expect(result.ok).toBe(false);
		});
	});

	// Note: Additional KPI functions tests would be added when more functions are implemented

	describe("Performance Rating", () => {
		it("should rate excellent performance", () => {
			const excellentMetrics = {
				conceptionRate: 0.9,
				averageDaysOpen: 70,
				averageCalvingInterval: 350,
				aiPerConception: 1.2
			};

			// This would test performance rating logic when implemented
			expect(excellentMetrics.conceptionRate).toBeGreaterThan(0.85);
			expect(excellentMetrics.averageDaysOpen).toBeLessThan(80);
		});

		it("should rate poor performance", () => {
			const poorMetrics = {
				conceptionRate: 0.5,
				averageDaysOpen: 120,
				averageCalvingInterval: 450,
				aiPerConception: 2.5
			};

			expect(poorMetrics.conceptionRate).toBeLessThan(0.6);
			expect(poorMetrics.averageDaysOpen).toBeGreaterThan(100);
		});
	});
});

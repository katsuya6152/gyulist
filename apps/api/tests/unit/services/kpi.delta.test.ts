import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBreedingKpiDelta } from "../../../src/services/kpiDeltaService";
import * as trends from "../../../src/services/kpiTrendsService";

vi.mock("../../../src/services/kpiTrendsService");
const mockTrends = vi.mocked(trends);

function db(): AnyD1Database {
	return {} as unknown as AnyD1Database;
}

describe("kpiDeltaService.getBreedingKpiDelta", () => {
	const d = db();
	const owner = 1;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns last month's delta for given month using trends(2)", async () => {
		mockTrends.getBreedingKpiTrends.mockResolvedValue({
			series: [
				{
					month: "2025-07",
					metrics: {
						conceptionRate: 60,
						avgDaysOpen: 110,
						avgCalvingInterval: 395,
						aiPerConception: 1.6
					},
					counts: {} as Record<string, number>
				},
				{
					month: "2025-08",
					metrics: {
						conceptionRate: 62,
						avgDaysOpen: 108,
						avgCalvingInterval: 393,
						aiPerConception: 1.5
					},
					counts: {} as Record<string, number>
				}
			],
			deltas: [
				{
					month: "2025-07",
					metrics: {
						conceptionRate: null,
						avgDaysOpen: null,
						avgCalvingInterval: null,
						aiPerConception: null
					}
				},
				{
					month: "2025-08",
					metrics: {
						conceptionRate: 2,
						avgDaysOpen: -2,
						avgCalvingInterval: -2,
						aiPerConception: -0.1
					}
				}
			]
		});

		const res = await getBreedingKpiDelta(d, owner, { month: "2025-08" });
		expect(mockTrends.getBreedingKpiTrends).toHaveBeenCalledWith(d, owner, {
			toMonth: "2025-08",
			months: 2
		});
		expect(res.month).toBe("2025-08");
		expect(res.delta).toEqual({
			conceptionRate: 2,
			avgDaysOpen: -2,
			avgCalvingInterval: -2,
			aiPerConception: -0.1
		});
	});

	it("handles empty trends by returning nulls", async () => {
		mockTrends.getBreedingKpiTrends.mockResolvedValue({
			series: [],
			deltas: []
		});
		const res = await getBreedingKpiDelta(d, owner, {});
		expect(res.delta).toEqual({
			conceptionRate: null,
			avgDaysOpen: null,
			avgCalvingInterval: null,
			aiPerConception: null
		});
	});
});

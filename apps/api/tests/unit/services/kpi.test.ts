import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as repo from "../../../src/repositories/kpiRepository";
import { getBreedingKpi } from "../../../src/services/kpiService";

vi.mock("../../../src/repositories/kpiRepository");
const mockRepo = vi.mocked(repo);

function createDb(): AnyD1Database {
	return {} as unknown as AnyD1Database;
}

describe("kpiService.getBreedingKpi", () => {
	const db = createDb();
	const owner = 1;
	const from = "2024-01-01T00:00:00Z";
	const to = "2024-12-31T23:59:59Z";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("computes metrics for simple timeline", async () => {
		// Cow1: Calving 2024-03-01, AI 2024-11-15 (conception for 2025-08-xx, outside to) -> not counted conception
		// Cow1: Calving 2024-12-01, previous AI 2024-03-10 (266d) -> conception counted, daysOpen from prev calving (2024-03-01) to AI (2024-03-10)=9d
		// Cow2: Calving 2024-06-01 and 2024-12-10 -> calving interval counted (192d)
		// Total AIs in period: 2 (2024-03-10, 2024-11-15)
		mockRepo.findEventsForBreedingKpi.mockResolvedValue([
			{
				cattleId: 1,
				eventType: "CALVING",
				eventDatetime: "2024-03-01T00:00:00Z",
			},
			{
				cattleId: 1,
				eventType: "INSEMINATION",
				eventDatetime: "2024-03-10T00:00:00Z",
			},
			{
				cattleId: 1,
				eventType: "INSEMINATION",
				eventDatetime: "2024-11-15T00:00:00Z",
			},
			{
				cattleId: 1,
				eventType: "CALVING",
				eventDatetime: "2024-12-01T00:00:00Z",
			},

			{
				cattleId: 2,
				eventType: "CALVING",
				eventDatetime: "2024-06-01T00:00:00Z",
			},
			{
				cattleId: 2,
				eventType: "CALVING",
				eventDatetime: "2024-12-10T00:00:00Z",
			},
		]);

		const { metrics, counts } = await getBreedingKpi(db, owner, from, to);

		expect(counts.inseminations).toBe(2);
		expect(counts.calvings).toBe(4);
		expect(counts.pairsForDaysOpen).toBe(1);

		// conceptionRate: 1 conception (2024-12-01) / 2 AI = 50%
		expect(metrics.conceptionRate).toBe(50);
		// avgDaysOpen: 9
		expect(metrics.avgDaysOpen).toBe(9);
		// avgCalvingInterval: cow1(275d) & cow2(192d) average = 233.5
		expect(metrics.avgCalvingInterval).toBe(233.5);
		// aiPerConception: for that conception, trials since prev calving up to chosen AI = 1
		expect(metrics.aiPerConception).toBe(1);
	});

	it("handles no data gracefully", async () => {
		mockRepo.findEventsForBreedingKpi.mockResolvedValue([]);
		const { metrics, counts } = await getBreedingKpi(db, owner, from, to);
		expect(metrics.conceptionRate).toBeNull();
		expect(metrics.avgDaysOpen).toBeNull();
		expect(metrics.avgCalvingInterval).toBeNull();
		expect(metrics.aiPerConception).toBeNull();
		expect(counts).toEqual({
			inseminations: 0,
			conceptions: 0,
			calvings: 0,
			pairsForDaysOpen: 0,
		});
	});
});

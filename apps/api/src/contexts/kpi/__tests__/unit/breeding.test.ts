import { describe, expect, it } from "vitest";
import { type Repo, getBreedingKpi } from "../../domain/services/breeding";

describe("KPI domain - breeding", () => {
	it("computes metrics and counts", async () => {
		const now = new Date();
		const calv1 = new Date(
			now.getTime() - 300 * 24 * 60 * 60 * 1000
		).toISOString();
		const calv2 = new Date(
			now.getTime() - 10 * 24 * 60 * 60 * 1000
		).toISOString();
		const ai = new Date(
			now.getTime() - 280 * 24 * 60 * 60 * 1000
		).toISOString();
		const repo: Repo = {
			findEventsForBreedingKpi: async () => [
				{ cattleId: 1, eventType: "CALVING", eventDatetime: calv1 },
				{ cattleId: 1, eventType: "INSEMINATION", eventDatetime: ai },
				{ cattleId: 1, eventType: "CALVING", eventDatetime: calv2 }
			],
			getBreedingKpiTrends: async () => ({ series: [], deltas: [] })
		};
		const res = await getBreedingKpi(repo)(1);
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.value.metrics.conceptionRate).not.toBeNull();
	});
});

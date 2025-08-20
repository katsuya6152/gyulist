import { describe, expect, it } from "vitest";
import type {
	KpiRepoPort,
	RawEvent,
	TrendDelta,
	TrendPoint
} from "../../ports";

describe("KpiRepoPort", () => {
	// モック実装
	const mockRepo: KpiRepoPort = {
		async findEventsForBreedingKpi(
			ownerUserId: number,
			fromIso?: string,
			toIso?: string
		): Promise<RawEvent[]> {
			return [
				{
					cattleId: 1,
					eventType: "INSEMINATION",
					eventDatetime: "2025-08-01T10:00:00Z"
				},
				{
					cattleId: 1,
					eventType: "CALVING",
					eventDatetime: "2025-08-15T14:00:00Z"
				},
				{
					cattleId: 2,
					eventType: "INSEMINATION",
					eventDatetime: "2025-08-05T11:00:00Z"
				},
				{
					cattleId: 1,
					eventType: "PREGNANCY_CHECK",
					eventDatetime: "2025-08-20T14:00:00Z"
				}
			];
		},

		async getBreedingKpiTrends(
			ownerUserId: number,
			params: {
				toMonth?: string;
				months?: number;
				fromMonth?: string;
			}
		): Promise<{ series: TrendPoint[]; deltas: TrendDelta[] }> {
			const mockSeries: TrendPoint[] = [
				{
					month: "2025-08",
					metrics: {
						conceptionRate: 75.0,
						avgDaysOpen: 45.5,
						avgCalvingInterval: 395.2,
						aiPerConception: 1.8
					},
					counts: {
						INSEMINATION: 12,
						CALVING: 8,
						PREGNANCY_CHECK: 15
					}
				},
				{
					month: "2025-07",
					metrics: {
						conceptionRate: 70.0,
						avgDaysOpen: 48.2,
						avgCalvingInterval: 398.1,
						aiPerConception: 2.1
					},
					counts: {
						INSEMINATION: 10,
						CALVING: 7,
						PREGNANCY_CHECK: 12
					}
				}
			];

			const mockDeltas: TrendDelta[] = [
				{
					month: "2025-08",
					metrics: {
						conceptionRate: 5.0,
						avgDaysOpen: -2.7,
						avgCalvingInterval: -2.9,
						aiPerConception: -0.3
					}
				}
			];

			return {
				series: mockSeries,
				deltas: mockDeltas
			};
		}
	};

	it("should find events for breeding KPI", async () => {
		const events = await mockRepo.findEventsForBreedingKpi(1);
		expect(events).toHaveLength(4);
		expect(events[0].eventType).toBe("INSEMINATION");
		expect(events[1].eventType).toBe("CALVING");
		expect(events[2].eventType).toBe("INSEMINATION");
		expect(events[3].eventType).toBe("PREGNANCY_CHECK");
	});

	it("should find events for breeding KPI with date range", async () => {
		const events = await mockRepo.findEventsForBreedingKpi(
			1,
			"2025-08-01T00:00:00Z",
			"2025-08-31T23:59:59Z"
		);
		expect(events).toHaveLength(4);
	});

	it("should get breeding KPI trends", async () => {
		const trends = await mockRepo.getBreedingKpiTrends(1, { months: 2 });
		expect(trends.series).toHaveLength(2);
		expect(trends.deltas).toHaveLength(1);
	});

	it("should get breeding KPI trends with specific month range", async () => {
		const trends = await mockRepo.getBreedingKpiTrends(1, {
			fromMonth: "2025-07",
			toMonth: "2025-08"
		});
		expect(trends.series).toHaveLength(2);
		expect(trends.series[0].month).toBe("2025-08");
		expect(trends.series[1].month).toBe("2025-07");
	});

	it("should have correct trend point structure", async () => {
		const trends = await mockRepo.getBreedingKpiTrends(1, { months: 1 });
		const trendPoint = trends.series[0];

		expect(trendPoint.month).toBe("2025-08");
		expect(trendPoint.metrics.conceptionRate).toBe(75.0);
		expect(trendPoint.metrics.avgDaysOpen).toBe(45.5);
		expect(trendPoint.metrics.avgCalvingInterval).toBe(395.2);
		expect(trendPoint.metrics.aiPerConception).toBe(1.8);
		expect(trendPoint.counts.INSEMINATION).toBe(12);
		expect(trendPoint.counts.CALVING).toBe(8);
	});

	it("should have correct trend delta structure", async () => {
		const trends = await mockRepo.getBreedingKpiTrends(1, { months: 1 });
		const trendDelta = trends.deltas[0];

		expect(trendDelta.month).toBe("2025-08");
		expect(trendDelta.metrics.conceptionRate).toBe(5.0);
		expect(trendDelta.metrics.avgDaysOpen).toBe(-2.7);
		expect(trendDelta.metrics.avgCalvingInterval).toBe(-2.9);
		expect(trendDelta.metrics.aiPerConception).toBe(-0.3);
	});

	it("should handle events with different types", async () => {
		const events = await mockRepo.findEventsForBreedingKpi(1);
		const eventTypes = events.map((e) => e.eventType);

		expect(eventTypes).toContain("INSEMINATION");
		expect(eventTypes).toContain("CALVING");
		expect(eventTypes).toContain("PREGNANCY_CHECK");
	});

	it("should return events with correct structure", async () => {
		const events = await mockRepo.findEventsForBreedingKpi(1);
		const event = events[0];

		expect(event).toHaveProperty("cattleId");
		expect(event).toHaveProperty("eventType");
		expect(event).toHaveProperty("eventDatetime");
		expect(typeof event.cattleId).toBe("number");
		expect(typeof event.eventType).toBe("string");
		expect(typeof event.eventDatetime).toBe("string");
	});
});

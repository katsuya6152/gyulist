import { describe, expect, it } from "vitest";
import type { CattleId } from "../../../../shared/brand";
import {
	calculateKpiEventStats,
	compareKpiEvents,
	createKpiEvent,
	filterKpiEventsByType,
	groupKpiEventsByCattle,
	isKpiEventInPeriod,
	updateKpiEvent
} from "../../domain/model/kpiEvent";
import type {
	KpiEvent,
	KpiEventMetadata,
	NewKpiEventProps
} from "../../domain/model/kpiEvent";
import type { BreedingEventType } from "../../domain/model/types";

describe("KpiEvent Domain Model", () => {
	const mockCattleId = 1 as CattleId;
	const mockEventId = "event-123";
	const mockCurrentTime = new Date("2025-01-01T10:00:00Z");

	describe("createKpiEvent", () => {
		it("should create KPI event with valid data", () => {
			const props: NewKpiEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2025-01-01T09:00:00Z"),
				metadata: {
					notes: "Test insemination",
					technician: "Dr. Smith"
				}
			};

			const event = createKpiEvent(props, mockEventId, mockCurrentTime);

			expect(event.eventId).toBe(mockEventId);
			expect(event.cattleId).toBe(mockCattleId);
			expect(event.eventType).toBe("INSEMINATION");
			expect(event.eventDatetime).toEqual(new Date("2025-01-01T09:00:00Z"));
			expect(event.metadata).toEqual({
				notes: "Test insemination",
				technician: "Dr. Smith"
			});
			expect(event.createdAt).toBe(mockCurrentTime);
			expect(event.updatedAt).toBe(mockCurrentTime);
		});

		it("should create KPI event with minimal data", () => {
			const props: NewKpiEventProps = {
				cattleId: mockCattleId,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2025-01-01T09:00:00Z")
			};

			const event = createKpiEvent(props, mockEventId, mockCurrentTime);

			expect(event.eventId).toBe(mockEventId);
			expect(event.cattleId).toBe(mockCattleId);
			expect(event.eventType).toBe("PREGNANCY_CHECK");
			expect(event.metadata).toEqual({});
		});

		it("should throw error when cattleId is missing", () => {
			const props = {
				eventType: "INSEMINATION" as BreedingEventType,
				eventDatetime: new Date("2025-01-01T09:00:00Z")
			} as NewKpiEventProps;

			expect(() => createKpiEvent(props, mockEventId, mockCurrentTime)).toThrow(
				"Cattle ID is required"
			);
		});

		it("should throw error when eventType is missing", () => {
			const props = {
				cattleId: mockCattleId,
				eventDatetime: new Date("2025-01-01T09:00:00Z")
			} as NewKpiEventProps;

			expect(() => createKpiEvent(props, mockEventId, mockCurrentTime)).toThrow(
				"Event type is required"
			);
		});

		it("should throw error when eventDatetime is missing", () => {
			const props = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION" as BreedingEventType
			} as NewKpiEventProps;

			expect(() => createKpiEvent(props, mockEventId, mockCurrentTime)).toThrow(
				"Event datetime is required"
			);
		});

		it("should throw error when eventDatetime is in the future", () => {
			const futureDate = new Date(mockCurrentTime.getTime() + 86400000); // +1 day
			const props: NewKpiEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: futureDate
			};

			expect(() => createKpiEvent(props, mockEventId, mockCurrentTime)).toThrow(
				"Event datetime cannot be in the future"
			);
		});

		it("should throw error when eventDatetime is more than 30 years ago", () => {
			const oldDate = new Date("1990-01-01T09:00:00Z");
			const props: NewKpiEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: oldDate
			};

			expect(() => createKpiEvent(props, mockEventId, mockCurrentTime)).toThrow(
				"Event datetime cannot be more than 30 years ago"
			);
		});

		it("should accept eventDatetime exactly 30 years ago", () => {
			const thirtyYearsAgo = new Date(mockCurrentTime);
			thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
			const props: NewKpiEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: thirtyYearsAgo
			};

			const event = createKpiEvent(props, mockEventId, mockCurrentTime);

			expect(event.eventDatetime).toEqual(thirtyYearsAgo);
		});
	});

	describe("updateKpiEvent", () => {
		const baseEvent: KpiEvent = {
			eventId: mockEventId,
			cattleId: mockCattleId,
			eventType: "INSEMINATION",
			eventDatetime: new Date("2025-01-01T09:00:00Z"),
			metadata: { notes: "Original notes" },
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime
		};

		it("should update event with new data", () => {
			const updates = {
				eventType: "ConfirmPregnancy" as BreedingEventType,
				metadata: { notes: "Updated notes", result: "Success" }
			};
			const newTime = new Date("2025-01-02T10:00:00Z");

			const updatedEvent = updateKpiEvent(baseEvent, updates, newTime);

			expect(updatedEvent.eventType).toBe("ConfirmPregnancy");
			expect(updatedEvent.metadata).toEqual({
				notes: "Updated notes",
				result: "Success"
			});
			expect(updatedEvent.updatedAt).toBe(newTime);
			expect(updatedEvent.createdAt).toBe(mockCurrentTime); // Should not change
		});

		it("should update only specified fields", () => {
			const updates = {
				eventType: "Calve" as BreedingEventType
			};
			const newTime = new Date("2025-01-02T10:00:00Z");

			const updatedEvent = updateKpiEvent(baseEvent, updates, newTime);

			expect(updatedEvent.eventType).toBe("Calve");
			expect(updatedEvent.metadata).toEqual({ notes: "Original notes" }); // Should not change
			expect(updatedEvent.eventDatetime).toEqual(
				new Date("2025-01-01T09:00:00Z")
			); // Should not change
		});

		it("should validate updated eventDatetime", () => {
			const futureDate = new Date(mockCurrentTime.getTime() + 86400000); // +1 day
			const updates = {
				eventDatetime: futureDate
			};

			expect(() => updateKpiEvent(baseEvent, updates, mockCurrentTime)).toThrow(
				"Event datetime cannot be in the future"
			);
		});
	});

	describe("compareKpiEvents", () => {
		it("should return negative when first event is earlier", () => {
			const event1: KpiEvent = {
				eventId: "event-1",
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2025-01-01T09:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const event2: KpiEvent = {
				eventId: "event-2",
				cattleId: mockCattleId,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2025-01-01T10:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const result = compareKpiEvents(event1, event2);

			expect(result).toBeLessThan(0);
		});

		it("should return positive when first event is later", () => {
			const event1: KpiEvent = {
				eventId: "event-1",
				cattleId: mockCattleId,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2025-01-01T10:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const event2: KpiEvent = {
				eventId: "event-2",
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2025-01-01T09:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const result = compareKpiEvents(event1, event2);

			expect(result).toBeGreaterThan(0);
		});

		it("should return zero when events have same datetime", () => {
			const sameTime = new Date("2025-01-01T09:00:00Z");
			const event1: KpiEvent = {
				eventId: "event-1",
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: sameTime,
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const event2: KpiEvent = {
				eventId: "event-2",
				cattleId: mockCattleId,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: sameTime,
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			const result = compareKpiEvents(event1, event2);

			expect(result).toBe(0);
		});
	});

	describe("isKpiEventInPeriod", () => {
		const event: KpiEvent = {
			eventId: mockEventId,
			cattleId: mockCattleId,
			eventType: "INSEMINATION",
			eventDatetime: new Date("2025-01-15T09:00:00Z"),
			metadata: {},
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime
		};

		it("should return true when event is within period", () => {
			const from = new Date("2025-01-01T00:00:00Z");
			const to = new Date("2025-01-31T23:59:59Z");

			const result = isKpiEventInPeriod(event, from, to);

			expect(result).toBe(true);
		});

		it("should return true when event is at period start", () => {
			const from = new Date("2025-01-15T09:00:00Z");
			const to = new Date("2025-01-31T23:59:59Z");

			const result = isKpiEventInPeriod(event, from, to);

			expect(result).toBe(true);
		});

		it("should return true when event is at period end", () => {
			const from = new Date("2025-01-01T00:00:00Z");
			const to = new Date("2025-01-15T09:00:00Z");

			const result = isKpiEventInPeriod(event, from, to);

			expect(result).toBe(true);
		});

		it("should return false when event is before period", () => {
			const from = new Date("2025-01-16T00:00:00Z");
			const to = new Date("2025-01-31T23:59:59Z");

			const result = isKpiEventInPeriod(event, from, to);

			expect(result).toBe(false);
		});

		it("should return false when event is after period", () => {
			const from = new Date("2025-01-01T00:00:00Z");
			const to = new Date("2025-01-14T23:59:59Z");

			const result = isKpiEventInPeriod(event, from, to);

			expect(result).toBe(false);
		});
	});

	describe("filterKpiEventsByType", () => {
		it("should filter events by Inseminate type", () => {
			const events = [
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "INSEMINATION",
						eventDatetime: new Date("2025-01-01T08:00:00Z")
					},
					"event1",
					mockCurrentTime
				),
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "PREGNANCY_CHECK",
						eventDatetime: new Date("2025-01-01T07:00:00Z")
					},
					"event2",
					mockCurrentTime
				),
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "INSEMINATION",
						eventDatetime: new Date("2025-01-01T06:00:00Z")
					},
					"event3",
					mockCurrentTime
				)
			];

			const filtered = filterKpiEventsByType(events, "INSEMINATION");

			expect(filtered).toHaveLength(2);
			expect(filtered[0].eventType).toBe("INSEMINATION");
			expect(filtered[1].eventType).toBe("INSEMINATION");
		});

		it("should filter events by ConfirmPregnancy type", () => {
			const events = [
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "INSEMINATION",
						eventDatetime: new Date("2025-01-01T08:00:00Z")
					},
					"event1",
					mockCurrentTime
				),
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "PREGNANCY_CHECK",
						eventDatetime: new Date("2025-01-01T07:00:00Z")
					},
					"event2",
					mockCurrentTime
				)
			];

			const filtered = filterKpiEventsByType(events, "PREGNANCY_CHECK");

			expect(filtered).toHaveLength(1);
			expect(filtered[0].eventType).toBe("PREGNANCY_CHECK");
		});

		it("should return empty array when no events match type", () => {
			const testEvents = [
				createKpiEvent(
					{
						cattleId: mockCattleId,
						eventType: "INSEMINATION",
						eventDatetime: new Date("2025-01-01T09:00:00Z")
					},
					"event1",
					mockCurrentTime
				)
			];
			const filtered = filterKpiEventsByType(testEvents, "CALVING");

			expect(filtered).toHaveLength(0);
		});

		it("should return empty array for empty input", () => {
			const filtered = filterKpiEventsByType([], "INSEMINATION");

			expect(filtered).toHaveLength(0);
		});
	});

	describe("groupKpiEventsByCattle", () => {
		const cattleId1 = 1 as CattleId;
		const cattleId2 = 2 as CattleId;

		const events: KpiEvent[] = [
			{
				eventId: "event-1",
				cattleId: cattleId1,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2025-01-01T10:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			},
			{
				eventId: "event-2",
				cattleId: cattleId1,
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2025-01-01T09:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			},
			{
				eventId: "event-3",
				cattleId: cattleId2,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2025-01-01T08:00:00Z"),
				metadata: {},
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			}
		];

		it("should group events by cattle ID", () => {
			const grouped = groupKpiEventsByCattle(events);

			expect(grouped.size).toBe(2);
			expect(grouped.get(cattleId1)).toHaveLength(2);
			expect(grouped.get(cattleId2)).toHaveLength(1);
		});

		it("should sort events by datetime within each group", () => {
			const grouped = groupKpiEventsByCattle(events);

			const cattle1Events = grouped.get(cattleId1);
			expect(cattle1Events).toBeDefined();
			if (cattle1Events) {
				expect(cattle1Events[0].eventDatetime).toEqual(
					new Date("2025-01-01T09:00:00Z")
				);
				expect(cattle1Events[1].eventDatetime).toEqual(
					new Date("2025-01-01T10:00:00Z")
				);
			}
		});

		it("should return empty map for empty input", () => {
			const grouped = groupKpiEventsByCattle([]);

			expect(grouped.size).toBe(0);
		});
	});

	describe("calculateKpiEventStats", () => {
		it("should calculate stats for multiple events", () => {
			const events: KpiEvent[] = [
				{
					eventId: "event-1",
					cattleId: mockCattleId,
					eventType: "INSEMINATION",
					eventDatetime: new Date("2025-01-01T09:00:00Z"),
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				},
				{
					eventId: "event-2",
					cattleId: mockCattleId,
					eventType: "PREGNANCY_CHECK",
					eventDatetime: new Date("2025-01-01T10:00:00Z"),
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				},
				{
					eventId: "event-3",
					cattleId: mockCattleId,
					eventType: "INSEMINATION",
					eventDatetime: new Date("2025-01-01T11:00:00Z"),
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				}
			];

			const stats = calculateKpiEventStats(events);

			expect(stats.totalEvents).toBe(3);
			expect(stats.eventsByType.INSEMINATION).toBe(2);
			expect(stats.eventsByType.PREGNANCY_CHECK).toBe(1);
			expect(stats.dateRange).toEqual({
				from: new Date("2025-01-01T09:00:00Z"),
				to: new Date("2025-01-01T11:00:00Z")
			});
		});

		it("should handle single event", () => {
			const events: KpiEvent[] = [
				{
					eventId: "event-1",
					cattleId: mockCattleId,
					eventType: "INSEMINATION",
					eventDatetime: new Date("2025-01-01T09:00:00Z"),
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				}
			];

			const stats = calculateKpiEventStats(events);

			expect(stats.totalEvents).toBe(1);
			expect(stats.eventsByType.INSEMINATION).toBe(1);
			expect(stats.dateRange).toEqual({
				from: new Date("2025-01-01T09:00:00Z"),
				to: new Date("2025-01-01T09:00:00Z")
			});
		});

		it("should handle empty events array", () => {
			const stats = calculateKpiEventStats([]);

			expect(stats.totalEvents).toBe(0);
			expect(stats.eventsByType).toEqual({});
			expect(stats.dateRange).toBeNull();
		});

		it("should handle events with same datetime", () => {
			const sameTime = new Date("2025-01-01T09:00:00Z");
			const events: KpiEvent[] = [
				{
					eventId: "event-1",
					cattleId: mockCattleId,
					eventType: "INSEMINATION",
					eventDatetime: sameTime,
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				},
				{
					eventId: "event-2",
					cattleId: mockCattleId,
					eventType: "PREGNANCY_CHECK",
					eventDatetime: sameTime,
					metadata: {},
					createdAt: mockCurrentTime,
					updatedAt: mockCurrentTime
				}
			];

			const stats = calculateKpiEventStats(events);

			expect(stats.totalEvents).toBe(2);
			expect(stats.dateRange).toEqual({
				from: sameTime,
				to: sameTime
			});
		});
	});
});

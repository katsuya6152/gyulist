/**
 * Events Domain Unit Tests - New Architecture
 *
 * イベント管理ドメインロジックのユニットテスト
 */

import { describe, expect, it } from "vitest";
import {
	EventRules,
	createEvent,
	updateEvent
} from "../../../src/domain/functions/events/eventFactory";
import {
	validateNewEventProps,
	validateUpdateEventProps
} from "../../../src/domain/functions/events/eventValidation";
import type {
	Event,
	NewEventProps,
	UpdateEventProps
} from "../../../src/domain/types/events";
import type { EventType } from "../../../src/domain/types/events/EventTypes";
import type { CattleId, EventId } from "../../../src/shared/brand";

describe("Events Domain Functions - New Architecture", () => {
	const mockCurrentTime = new Date("2024-01-01T00:00:00Z");
	const mockCattleId = 1 as CattleId;

	describe("createEvent", () => {
		it("should create event with valid data", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: "人工授精を実施"
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const event = result.value;
				expect(event.cattleId).toBe(mockCattleId);
				expect(event.eventType).toBe("INSEMINATION");
				expect(event.eventDatetime).toEqual(new Date("2024-01-15T10:00:00Z"));
				expect(event.notes).toBe("人工授精を実施");
				expect(event.createdAt).toBe(mockCurrentTime);
				expect(event.updatedAt).toBe(mockCurrentTime);
			}
		});

		it("should normalize notes input", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: "  人工授精を実施  "
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.notes).toBe("人工授精を実施");
			}
		});

		it("should handle null notes", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: null
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.notes).toBe(null);
			}
		});

		it("should reject invalid event type", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INVALID_TYPE" as EventType,
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: "テストメモ"
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventType");
			}
		});

		it("should allow future event datetime within 2 years", () => {
			const futureDate = new Date(mockCurrentTime);
			futureDate.setFullYear(futureDate.getFullYear() + 1); // 1年後

			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: futureDate,
				notes: "テストメモ"
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(true);
		});

		it("should reject far future event datetime", () => {
			const farFutureDate = new Date(mockCurrentTime);
			farFutureDate.setFullYear(farFutureDate.getFullYear() + 3); // 3年後

			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: farFutureDate,
				notes: "テストメモ"
			};

			const result = createEvent(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventDatetime");
			}
		});
	});

	describe("updateEvent", () => {
		const baseEvent: Event = {
			eventId: 1 as EventId,
			cattleId: mockCattleId,
			eventType: "INSEMINATION",
			eventDatetime: new Date("2024-01-15T10:00:00Z"),
			notes: "人工授精を実施",
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime
		};

		it("should update event with valid data", () => {
			const updates: UpdateEventProps = {
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2024-01-20T14:00:00Z"),
				notes: "妊娠検査を実施"
			};

			const result = updateEvent(baseEvent, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedEvent = result.value;
				expect(updatedEvent.eventType).toBe("PREGNANCY_CHECK");
				expect(updatedEvent.eventDatetime).toEqual(
					new Date("2024-01-20T14:00:00Z")
				);
				expect(updatedEvent.notes).toBe("妊娠検査を実施");
				expect(updatedEvent.updatedAt).toBe(mockCurrentTime);
			}
		});

		it("should handle partial updates", () => {
			const updates: UpdateEventProps = {
				notes: "更新されたメモ"
			};

			const result = updateEvent(baseEvent, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedEvent = result.value;
				expect(updatedEvent.eventType).toBe("INSEMINATION"); // 変更されていない
				expect(updatedEvent.eventDatetime).toEqual(
					new Date("2024-01-15T10:00:00Z")
				); // 変更されていない
				expect(updatedEvent.notes).toBe("更新されたメモ");
				expect(updatedEvent.updatedAt).toBe(mockCurrentTime);
			}
		});

		it("should normalize notes in updates", () => {
			const updates: UpdateEventProps = {
				notes: "  更新されたメモ  "
			};

			const result = updateEvent(baseEvent, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.notes).toBe("更新されたメモ");
			}
		});

		it("should reject invalid event type in updates", () => {
			const updates: UpdateEventProps = {
				eventType: "INVALID_TYPE" as EventType
			};

			const result = updateEvent(baseEvent, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventType");
			}
		});

		it("should reject far future event datetime in updates", () => {
			const farFutureDate = new Date(mockCurrentTime);
			farFutureDate.setFullYear(farFutureDate.getFullYear() + 3); // 3年後

			const updates: UpdateEventProps = {
				eventDatetime: farFutureDate
			};

			const result = updateEvent(baseEvent, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventDatetime");
			}
		});
	});

	describe("EventRules", () => {
		it("should identify past events", () => {
			const pastEvent: Event = {
				eventId: 1 as EventId,
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2023-12-01T10:00:00Z"),
				notes: "過去のイベント",
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			expect(EventRules.isPastEvent(pastEvent, mockCurrentTime)).toBe(true);
		});

		it("should identify current events", () => {
			const currentEvent: Event = {
				eventId: 1 as EventId,
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: mockCurrentTime,
				notes: "現在のイベント",
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			expect(EventRules.isPastEvent(currentEvent, mockCurrentTime)).toBe(false);
		});

		it("should identify breeding events", () => {
			const breedingEvent: Event = {
				eventId: 1 as EventId,
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: mockCurrentTime,
				notes: "繁殖イベント",
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			expect(EventRules.isBreedingEvent(breedingEvent)).toBe(true);
		});

		it("should identify health events", () => {
			const healthEvent: Event = {
				eventId: 1 as EventId,
				cattleId: mockCattleId,
				eventType: "VACCINATION",
				eventDatetime: mockCurrentTime,
				notes: "健康イベント",
				createdAt: mockCurrentTime,
				updatedAt: mockCurrentTime
			};

			expect(EventRules.isHealthEvent(healthEvent)).toBe(true);
		});
	});

	describe("validateNewEventProps", () => {
		it("should validate valid event props", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: "テストメモ"
			};

			const result = validateNewEventProps(props, mockCurrentTime);

			expect(result.ok).toBe(true);
		});

		it("should reject invalid event type", () => {
			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INVALID_TYPE" as EventType,
				eventDatetime: new Date("2024-01-15T10:00:00Z"),
				notes: "テストメモ"
			};

			const result = validateNewEventProps(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventType");
			}
		});

		it("should reject far future event datetime", () => {
			const farFutureDate = new Date(mockCurrentTime);
			farFutureDate.setFullYear(farFutureDate.getFullYear() + 3); // 3年後

			const props: NewEventProps = {
				cattleId: mockCattleId,
				eventType: "INSEMINATION",
				eventDatetime: farFutureDate,
				notes: "テストメモ"
			};

			const result = validateNewEventProps(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventDatetime");
			}
		});
	});

	describe("validateUpdateEventProps", () => {
		it("should validate valid update props", () => {
			const updates: UpdateEventProps = {
				eventType: "PREGNANCY_CHECK",
				eventDatetime: new Date("2024-01-20T14:00:00Z"),
				notes: "更新されたメモ"
			};

			const result = validateUpdateEventProps(updates, mockCurrentTime);

			expect(result.ok).toBe(true);
		});

		it("should reject invalid event type in updates", () => {
			const updates: UpdateEventProps = {
				eventType: "INVALID_TYPE" as EventType
			};

			const result = validateUpdateEventProps(updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventType");
			}
		});

		it("should reject far future event datetime in updates", () => {
			const farFutureDate = new Date(mockCurrentTime);
			farFutureDate.setFullYear(farFutureDate.getFullYear() + 3); // 3年後

			const updates: UpdateEventProps = {
				eventDatetime: farFutureDate
			};

			const result = validateUpdateEventProps(updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("eventDatetime");
			}
		});

		it("should allow empty updates", () => {
			const updates: UpdateEventProps = {};

			const result = validateUpdateEventProps(updates, mockCurrentTime);

			expect(result.ok).toBe(true);
		});
	});
});

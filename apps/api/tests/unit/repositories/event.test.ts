import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import * as eventRepository from "../../../src/repositories/eventRepository";

describe("EventRepository", () => {
	describe("exports", () => {
		it("should export findEventsByCattleId function", () => {
			expect(eventRepository.findEventsByCattleId).toBeDefined();
			expect(typeof eventRepository.findEventsByCattleId).toBe("function");
		});

		it("should export searchEvents function", () => {
			expect(eventRepository.searchEvents).toBeDefined();
			expect(typeof eventRepository.searchEvents).toBe("function");
		});

		it("should export findEventById function", () => {
			expect(eventRepository.findEventById).toBeDefined();
			expect(typeof eventRepository.findEventById).toBe("function");
		});

		it("should export createEvent function", () => {
			expect(eventRepository.createEvent).toBeDefined();
			expect(typeof eventRepository.createEvent).toBe("function");
		});

		it("should export updateEvent function", () => {
			expect(eventRepository.updateEvent).toBeDefined();
			expect(typeof eventRepository.updateEvent).toBe("function");
		});

		it("should export deleteEvent function", () => {
			expect(eventRepository.deleteEvent).toBeDefined();
			expect(typeof eventRepository.deleteEvent).toBe("function");
		});
	});

	describe("function signatures", () => {
		it("should have correct parameter length for findEventsByCattleId", () => {
			expect(eventRepository.findEventsByCattleId.length).toBe(3);
		});

		it("should have correct parameter length for searchEvents", () => {
			expect(eventRepository.searchEvents.length).toBe(3);
		});

		it("should have correct parameter length for findEventById", () => {
			expect(eventRepository.findEventById.length).toBe(3);
		});

		it("should have correct parameter length for createEvent", () => {
			expect(eventRepository.createEvent.length).toBe(2);
		});

		it("should have correct parameter length for updateEvent", () => {
			expect(eventRepository.updateEvent.length).toBe(3);
		});

		it("should have correct parameter length for deleteEvent", () => {
			expect(eventRepository.deleteEvent.length).toBe(2);
		});
	});

	describe("function types", () => {
		it("should return promises from async functions", () => {
			const mockDb = {} as AnyD1Database;

			// これらの関数は全てPromiseを返すはず
			const result1 = eventRepository.findEventsByCattleId(mockDb, 1, 1);
			const result2 = eventRepository.searchEvents(mockDb, 1, { limit: 10 });
			const result3 = eventRepository.findEventById(mockDb, 1, 1);
			const result4 = eventRepository.createEvent(mockDb, {
				cattleId: 1,
				eventType: "VACCINATION",
				eventDatetime: "2024-01-01T00:00:00Z",
			});
			const result5 = eventRepository.updateEvent(mockDb, 1, {
				eventType: "VACCINATION",
			});
			const result6 = eventRepository.deleteEvent(mockDb, 1);

			expect(result1).toBeInstanceOf(Promise);
			expect(result2).toBeInstanceOf(Promise);
			expect(result3).toBeInstanceOf(Promise);
			expect(result4).toBeInstanceOf(Promise);
			expect(result5).toBeInstanceOf(Promise);
			expect(result6).toBeInstanceOf(Promise);

			// Promiseを適切にキャッチしてテストが完了するようにする
			return Promise.allSettled([
				result1,
				result2,
				result3,
				result4,
				result5,
				result6,
			]);
		});
	});
});

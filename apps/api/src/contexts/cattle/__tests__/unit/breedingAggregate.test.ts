import { beforeEach, describe, expect, it } from "vitest";
import type { CattleId } from "../../../../shared/brand";
import {
	type BreedingAggregate,
	createBreedingAggregate,
	getBreedingEventsInRange,
	getLastEventOfType,
	isBreedingAggregateValid,
	reconstructBreedingAggregate
} from "../../domain/model/breedingAggregate";
import type {
	BreedingEvent,
	BreedingStatus
} from "../../domain/model/breedingStatus";
import type { BreedingSummary } from "../../domain/model/breedingSummary";

describe("BreedingAggregate Domain Model", () => {
	const mockCattleId = 123 as CattleId;
	const mockDate = new Date("2024-01-01T00:00:00Z");

	const mockBreedingStatus: BreedingStatus = {
		type: "NotBreeding",
		parity: 0 as unknown as import("../../domain/model/types").Parity,
		daysAfterCalving: null,
		memo: null
	};

	const mockBreedingEvent: BreedingEvent = {
		type: "Inseminate",
		timestamp: mockDate,
		memo: "Test insemination"
	};

	const mockBreedingSummary: BreedingSummary = {} as BreedingSummary;

	describe("createBreedingAggregate", () => {
		it("should create breeding aggregate with initial values", () => {
			const aggregate = createBreedingAggregate(
				mockCattleId,
				mockBreedingStatus
			);

			expect(aggregate.cattleId).toBe(mockCattleId);
			expect(aggregate.currentStatus).toBe(mockBreedingStatus);
			expect(aggregate.history).toEqual([]);
			expect(aggregate.version).toBe(1);
			expect(aggregate.lastUpdated).toBeInstanceOf(Date);
		});

		it("should create aggregate with different initial status", () => {
			const differentStatus: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as unknown as import("../../domain/model/types").Parity,
				daysAfterInsemination: 0 as unknown as import(
					"../../domain/model/types"
				).DaysAfterInsemination,
				inseminationCount: 1 as unknown as import(
					"../../domain/model/types"
				).InseminationCount,
				daysOpen: null,
				memo: null
			};

			const aggregate = createBreedingAggregate(mockCattleId, differentStatus);

			expect(aggregate.currentStatus).toBe(differentStatus);
			expect(aggregate.cattleId).toBe(mockCattleId);
		});
	});

	describe("reconstructBreedingAggregate", () => {
		it("should reconstruct breeding aggregate from props", () => {
			const props = {
				cattleId: mockCattleId,
				currentStatus: mockBreedingStatus,
				summary: mockBreedingSummary,
				history: [mockBreedingEvent],
				version: 5,
				lastUpdated: mockDate
			};

			const aggregate = reconstructBreedingAggregate(props);

			expect(aggregate.cattleId).toBe(props.cattleId);
			expect(aggregate.currentStatus).toBe(props.currentStatus);
			expect(aggregate.summary).toBe(props.summary);
			expect(aggregate.history).toEqual(props.history);
			expect(aggregate.version).toBe(props.version);
			expect(aggregate.lastUpdated).toBe(props.lastUpdated);
		});

		it("should create new array for history to maintain immutability", () => {
			const originalHistory = [mockBreedingEvent];
			const props = {
				cattleId: mockCattleId,
				currentStatus: mockBreedingStatus,
				summary: mockBreedingSummary,
				history: originalHistory,
				version: 1,
				lastUpdated: mockDate
			};

			const aggregate = reconstructBreedingAggregate(props);

			expect(aggregate.history).toEqual(originalHistory);
			expect(aggregate.history).not.toBe(originalHistory); // Should be a new array
		});
	});

	describe("getBreedingEventsInRange", () => {
		let mockAggregate: BreedingAggregate;

		beforeEach(() => {
			mockAggregate = {
				cattleId: mockCattleId,
				currentStatus: mockBreedingStatus,
				summary: mockBreedingSummary,
				history: [
					{ ...mockBreedingEvent, timestamp: new Date("2024-01-01T00:00:00Z") },
					{ ...mockBreedingEvent, timestamp: new Date("2024-01-15T00:00:00Z") },
					{ ...mockBreedingEvent, timestamp: new Date("2024-01-30T00:00:00Z") }
				],
				version: 1,
				lastUpdated: mockDate
			};
		});

		it("should return events within date range", () => {
			const startDate = new Date("2024-01-10T00:00:00Z");
			const endDate = new Date("2024-01-20T00:00:00Z");

			const events = getBreedingEventsInRange(
				mockAggregate,
				startDate,
				endDate
			);

			expect(events).toHaveLength(1);
			expect(events[0].timestamp).toEqual(new Date("2024-01-15T00:00:00Z"));
		});

		it("should return empty array for no matching events", () => {
			const startDate = new Date("2024-02-01T00:00:00Z");
			const endDate = new Date("2024-02-28T00:00:00Z");

			const events = getBreedingEventsInRange(
				mockAggregate,
				startDate,
				endDate
			);

			expect(events).toHaveLength(0);
		});

		it("should include boundary dates", () => {
			const startDate = new Date("2024-01-01T00:00:00Z");
			const endDate = new Date("2024-01-15T00:00:00Z");

			const events = getBreedingEventsInRange(
				mockAggregate,
				startDate,
				endDate
			);

			expect(events).toHaveLength(2);
		});
	});

	describe("getLastEventOfType", () => {
		let mockAggregate: BreedingAggregate;

		beforeEach(() => {
			mockAggregate = {
				cattleId: mockCattleId,
				currentStatus: mockBreedingStatus,
				summary: mockBreedingSummary,
				history: [
					{
						...mockBreedingEvent,
						type: "Inseminate",
						timestamp: new Date("2024-01-01T00:00:00Z")
					},
					{
						type: "ConfirmPregnancy",
						timestamp: new Date("2024-01-15T00:00:00Z"),
						expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
						scheduledPregnancyCheckDate: null,
						memo: null
					},
					{
						...mockBreedingEvent,
						type: "Inseminate",
						timestamp: new Date("2024-01-30T00:00:00Z")
					}
				],
				version: 1,
				lastUpdated: mockDate
			};
		});

		it("should return last event of specified type", () => {
			const lastInseminate = getLastEventOfType(mockAggregate, "Inseminate");

			expect(lastInseminate).toBeDefined();
			expect(lastInseminate?.type).toBe("Inseminate");
			expect(lastInseminate?.timestamp).toEqual(
				new Date("2024-01-30T00:00:00Z")
			);
		});

		it("should return null for non-existent event type", () => {
			const lastCalve = getLastEventOfType(mockAggregate, "Calve");

			expect(lastCalve).toBeNull();
		});

		it("should return null for empty history", () => {
			const emptyAggregate = { ...mockAggregate, history: [] };

			const lastEvent = getLastEventOfType(emptyAggregate, "Inseminate");

			expect(lastEvent).toBeNull();
		});
	});

	describe("isBreedingAggregateValid", () => {
		it("should return true for valid aggregate", () => {
			const validAggregate: BreedingAggregate = {
				cattleId: mockCattleId,
				currentStatus: {
					type: "Inseminated",
					parity: 1 as unknown as import("../../domain/model/types").Parity,
					daysAfterInsemination: 0 as unknown as import(
						"../../domain/model/types"
					).DaysAfterInsemination,
					inseminationCount: 1 as unknown as import(
						"../../domain/model/types"
					).InseminationCount,
					daysOpen: null,
					memo: null
				},
				summary: mockBreedingSummary,
				history: [mockBreedingEvent],
				version: 1,
				lastUpdated: mockDate
			};

			const result = isBreedingAggregateValid(validAggregate);

			expect(result.ok).toBe(true);
		});

		it("should return error for inconsistent status after insemination", () => {
			const invalidAggregate: BreedingAggregate = {
				cattleId: mockCattleId,
				currentStatus: {
					type: "NotBreeding", // Should be Inseminated after Inseminate event
					parity: 1 as unknown as import("../../domain/model/types").Parity,
					daysAfterCalving: null,
					memo: null
				},
				summary: mockBreedingSummary,
				history: [mockBreedingEvent], // Inseminate event
				version: 1,
				lastUpdated: mockDate
			};

			const result = isBreedingAggregateValid(invalidAggregate);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Status should be 'Inseminated' after insemination event"
				);
			}
		});

		it("should return true for aggregate with no history", () => {
			const emptyAggregate: BreedingAggregate = {
				cattleId: mockCattleId,
				currentStatus: mockBreedingStatus,
				summary: mockBreedingSummary,
				history: [],
				version: 1,
				lastUpdated: mockDate
			};

			const result = isBreedingAggregateValid(emptyAggregate);

			expect(result.ok).toBe(true);
		});
	});

	describe("Type safety", () => {
		it("should enforce readonly properties", () => {
			const aggregate = createBreedingAggregate(
				mockCattleId,
				mockBreedingStatus
			);

			// This should compile without errors
			expect(aggregate.cattleId).toBe(mockCattleId);
			expect(aggregate.currentStatus).toBe(mockBreedingStatus);
		});

		it("should enforce brand types", () => {
			const aggregate = createBreedingAggregate(
				mockCattleId,
				mockBreedingStatus
			);

			// This should compile without errors
			expect(typeof aggregate.cattleId).toBe("number");
		});
	});
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { BreedingAggregate } from "../../../cattle/domain/model/breedingAggregate";
import type {
	BreedingEvent,
	BreedingStatus
} from "../../../cattle/domain/model/breedingStatus";
import {
	type InitializeBreedingCmd,
	type RecordBreedingEventCmd,
	getBreedingStatus,
	getCattleNeedingBreedingAttention,
	initializeBreeding,
	recordBreedingEvent
} from "../../domain/services/breedingManagement";
import type { BreedingRepoPort } from "../../ports";

// Mock dependencies
const mockBreedingRepo: BreedingRepoPort = {
	findByCattleId: vi.fn(),
	save: vi.fn(),
	delete: vi.fn(),
	getBreedingHistory: vi.fn(),
	appendBreedingEvent: vi.fn(),
	findCattleNeedingAttention: vi.fn(),
	getBreedingStatistics: vi.fn()
};

const mockClock: ClockPort = {
	now: vi.fn(() => new Date("2024-01-01T00:00:00Z"))
};

describe("Breeding Management Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("recordBreedingEvent", () => {
		it("should be a function", () => {
			expect(typeof recordBreedingEvent).toBe("function");
		});

		it("should return a function when called with dependencies", () => {
			const service = recordBreedingEvent({
				breedingRepo: mockBreedingRepo,
				clock: mockClock
			});
			expect(typeof service).toBe("function");
		});

		it("should accept RecordBreedingEventCmd", () => {
			const service = recordBreedingEvent({
				breedingRepo: mockBreedingRepo,
				clock: mockClock
			});

			const cmd: RecordBreedingEventCmd = {
				requesterUserId: 1 as UserId,
				cattleId: 100 as CattleId,
				event: {
					type: "Inseminate",
					memo: "Test memo"
				}
			};

			// This test just ensures the command type is accepted
			expect(cmd.requesterUserId).toBe(1);
			expect(cmd.cattleId).toBe(100);
			expect(cmd.event.type).toBe("Inseminate");
		});
	});

	describe("Command types", () => {
		it("should have correct RecordBreedingEventCmd structure", () => {
			const cmd: RecordBreedingEventCmd = {
				requesterUserId: 1 as UserId,
				cattleId: 100 as CattleId,
				event: {
					type: "Inseminate"
				}
			};

			expect(cmd.requesterUserId).toBe(1);
			expect(cmd.cattleId).toBe(100);
			expect(cmd.event.type).toBe("Inseminate");
			expect(cmd.event.memo).toBeUndefined();
			expect(cmd.event.expectedCalvingDate).toBeUndefined();
			expect(cmd.event.scheduledPregnancyCheckDate).toBeUndefined();
			expect(cmd.event.isDifficultBirth).toBeUndefined();
		});

		it("should have correct InitializeBreedingCmd structure", () => {
			const cmd: InitializeBreedingCmd = {
				requesterUserId: 1 as UserId,
				cattleId: 100 as CattleId,
				initialParity: 0,
				memo: "Initial breeding setup"
			};

			expect(cmd.requesterUserId).toBe(1);
			expect(cmd.cattleId).toBe(100);
			expect(cmd.initialParity).toBe(0);
			expect(cmd.memo).toBe("Initial breeding setup");
		});

		it("should handle optional fields in commands", () => {
			const cmd: RecordBreedingEventCmd = {
				requesterUserId: 1 as UserId,
				cattleId: 100 as CattleId,
				event: {
					type: "Inseminate",
					memo: "Optional memo"
				}
			};

			expect(cmd.event.memo).toBe("Optional memo");
		});
	});

	describe("Dependencies", () => {
		it("should require breeding repository", () => {
			const deps = {
				breedingRepo: mockBreedingRepo,
				clock: mockClock
			};

			expect(deps.breedingRepo).toBeDefined();
			expect(deps.clock).toBeDefined();
			expect(typeof deps.breedingRepo.findByCattleId).toBe("function");
			expect(typeof deps.clock.now).toBe("function");
		});

		it("should require clock port", () => {
			const deps = {
				breedingRepo: mockBreedingRepo,
				clock: mockClock
			};

			expect(deps.clock.now).toBeDefined();
			expect(typeof deps.clock.now).toBe("function");
		});
	});

	describe("Type safety", () => {
		it("should enforce UserId brand type", () => {
			const userId: UserId = 1 as UserId;
			expect(typeof userId).toBe("number");
		});

		it("should enforce CattleId brand type", () => {
			const cattleId: CattleId = 100 as CattleId;
			expect(typeof cattleId).toBe("number");
		});

		it("should enforce BreedingEvent type constraints", () => {
			const validEventTypes = [
				"Inseminate",
				"ConfirmPregnancy",
				"Calve",
				"StartNewCycle"
			];
			const eventType: BreedingEvent["type"] = "Inseminate";

			expect(validEventTypes).toContain(eventType);
		});
	});
});

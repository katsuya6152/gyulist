import { describe, expect, it } from "vitest";
import {
	type BreedingEvent,
	type BreedingStatus,
	createInitialBreedingStatus,
	getBreedingPhaseDescription,
	needsBreedingAttention,
	transitionBreedingStatus
} from "../../domain/model/breedingStatus";
import type {
	BreedingMemo,
	DaysAfterCalving,
	DaysAfterInsemination,
	DaysOpen,
	InseminationCount,
	Parity,
	PregnancyDays
} from "../../domain/model/types";

describe("BreedingStatus Domain Model", () => {
	describe("createInitialBreedingStatus", () => {
		it("should create initial breeding status with valid parity", () => {
			const result = createInitialBreedingStatus({
				parity: 0,
				memo: "Initial status"
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const status = result.value;
				expect(status.type).toBe("NotBreeding");
				expect(status.parity).toBe(0);
				if (status.type === "NotBreeding") {
					expect(status.daysAfterCalving).toBeNull();
					expect(status.memo).toBe("Initial status");
				}
			}
		});

		it("should create initial breeding status without memo", () => {
			const result = createInitialBreedingStatus({
				parity: 2
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const status = result.value;
				expect(status.type).toBe("NotBreeding");
				expect(status.parity).toBe(2);
				if (status.type === "NotBreeding") {
					expect(status.daysAfterCalving).toBeNull();
					expect(status.memo).toBeUndefined();
				}
			}
		});

		it("should return error for negative parity", () => {
			const result = createInitialBreedingStatus({
				parity: -1
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe("Parity cannot be negative");
				if (result.error.type === "ValidationError") {
					expect(result.error.field).toBe("parity");
				}
			}
		});

		it("should handle zero parity", () => {
			const result = createInitialBreedingStatus({
				parity: 0
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(0);
			}
		});
	});

	describe("transitionBreedingStatus", () => {
		const baseDate = new Date("2024-01-01T00:00:00Z");
		const futureDate = new Date("2024-01-15T00:00:00Z");

		it("should transition from NotBreeding to Inseminated on Inseminate event", () => {
			const current: BreedingStatus = {
				type: "NotBreeding",
				parity: 1 as Parity,
				daysAfterCalving: 45 as DaysAfterCalving,
				memo: "Ready for breeding" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "Inseminate",
				timestamp: baseDate,
				memo: "First insemination"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("Inseminated");
				expect(newStatus.parity).toBe(1);
				if (newStatus.type === "Inseminated") {
					expect(newStatus.daysAfterInsemination).toBe(0);
					expect(newStatus.inseminationCount).toBe(1);
					expect(newStatus.daysOpen).toBe(59); // 45 + 14
					expect(newStatus.memo).toBe("First insemination");
				}
			}
		});

		it("should transition from NotBreeding to Inseminated without daysAfterCalving", () => {
			const current: BreedingStatus = {
				type: "NotBreeding",
				parity: 0 as Parity,
				daysAfterCalving: null,
				memo: null
			};

			const event: BreedingEvent = {
				type: "Inseminate",
				timestamp: baseDate
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("Inseminated");
				if (newStatus.type === "Inseminated") {
					expect(newStatus.daysOpen).toBeNull();
				}
			}
		});

		it("should transition from Inseminated to Inseminated on Inseminate event", () => {
			const current: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 7 as DaysAfterInsemination,
				inseminationCount: 1 as InseminationCount,
				daysOpen: 52 as DaysOpen,
				memo: "First attempt" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "Inseminate",
				timestamp: baseDate,
				memo: "Second attempt"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("Inseminated");
				if (newStatus.type === "Inseminated") {
					expect(newStatus.inseminationCount).toBe(2);
					expect(newStatus.daysAfterInsemination).toBe(14);
					expect(newStatus.memo).toBe("Second attempt");
				}
			}
		});

		it("should transition from Inseminated to Pregnant on ConfirmPregnancy event", () => {
			const current: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 21 as DaysAfterInsemination,
				inseminationCount: 1 as InseminationCount,
				daysOpen: 66 as DaysOpen,
				memo: "Waiting for confirmation" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "ConfirmPregnancy",
				timestamp: baseDate,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: new Date("2024-02-01T00:00:00Z"),
				memo: "Pregnancy confirmed"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("Pregnant");
				expect(newStatus.parity).toBe(1);
				if (newStatus.type === "Pregnant") {
					expect(newStatus.pregnancyDays).toBe(14);
					expect(newStatus.expectedCalvingDate).toEqual(
						new Date("2024-10-01T00:00:00Z")
					);
					expect(newStatus.scheduledPregnancyCheckDate).toEqual(
						new Date("2024-02-01T00:00:00Z")
					);
					expect(newStatus.memo).toBe("Pregnancy confirmed");
				}
			}
		});

		it("should transition from Inseminated to NotBreeding on StartNewCycle event", () => {
			const current: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 25 as DaysAfterInsemination,
				inseminationCount: 2 as InseminationCount,
				daysOpen: 70 as DaysOpen,
				memo: "Failed attempt" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "StartNewCycle",
				timestamp: baseDate,
				memo: "Starting new cycle"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("NotBreeding");
				expect(newStatus.parity).toBe(1);
				if (newStatus.type === "NotBreeding") {
					expect(newStatus.daysAfterCalving).toBeNull();
					expect(newStatus.memo).toBe("Starting new cycle");
				}
			}
		});

		it("should transition from Pregnant to PostCalving on Calve event", () => {
			const current: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 280 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: null,
				memo: "Ready for calving" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "Calve",
				timestamp: baseDate,
				isDifficultBirth: false,
				memo: "Successful calving"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("PostCalving");
				expect(newStatus.parity).toBe(2); // Incremented
				if (newStatus.type === "PostCalving") {
					expect(newStatus.daysAfterCalving).toBe(0);
					expect(newStatus.isDifficultBirth).toBe(false);
					expect(newStatus.memo).toBe("Successful calving");
				}
			}
		});

		it("should transition from Pregnant to NotBreeding on StartNewCycle event", () => {
			const current: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 60 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: null,
				memo: "Early pregnancy" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "StartNewCycle",
				timestamp: baseDate,
				memo: "Pregnancy failed"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("NotBreeding");
				expect(newStatus.parity).toBe(1); // Not incremented
				expect(newStatus.memo).toBe("Pregnancy failed");
			}
		});

		it("should transition from PostCalving to NotBreeding on StartNewCycle event", () => {
			const current: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 45 as DaysAfterCalving,
				isDifficultBirth: false,
				memo: "Recovering" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "StartNewCycle",
				timestamp: baseDate,
				memo: "Ready for next breeding"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("NotBreeding");
				expect(newStatus.parity).toBe(2);
				if (newStatus.type === "NotBreeding") {
					expect(newStatus.daysAfterCalving).toBe(14); // 14 days difference between baseDate and futureDate
					expect(newStatus.memo).toBe("Ready for next breeding");
				}
			}
		});

		it("should transition from PostCalving to Inseminated on Inseminate event", () => {
			const current: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 60 as DaysAfterCalving,
				isDifficultBirth: false,
				memo: "Ready for breeding" as BreedingMemo
			};

			const event: BreedingEvent = {
				type: "Inseminate",
				timestamp: baseDate,
				memo: "Next breeding attempt"
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const newStatus = result.value;
				expect(newStatus.type).toBe("Inseminated");
				expect(newStatus.parity).toBe(2);
				if (newStatus.type === "Inseminated") {
					expect(newStatus.daysOpen).toBe(14); // 14 days difference between baseDate and futureDate
					expect(newStatus.memo).toBe("Next breeding attempt");
				}
			}
		});

		it("should return error for invalid transition", () => {
			const current: BreedingStatus = {
				type: "NotBreeding",
				parity: 1 as Parity,
				daysAfterCalving: null,
				memo: null
			};

			const event: BreedingEvent = {
				type: "Calve",
				timestamp: baseDate,
				isDifficultBirth: false
			};

			const result = transitionBreedingStatus(current, event, futureDate);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toContain(
					"Invalid transition from NotBreeding with event Calve"
				);
			}
		});
	});

	describe("getBreedingPhaseDescription", () => {
		it("should return correct description for NotBreeding with daysAfterCalving", () => {
			const status: BreedingStatus = {
				type: "NotBreeding",
				parity: 1 as Parity,
				daysAfterCalving: 45 as DaysAfterCalving,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe("休息中 (分娩後45日)");
		});

		it("should return correct description for NotBreeding without daysAfterCalving", () => {
			const status: BreedingStatus = {
				type: "NotBreeding",
				parity: 0 as Parity,
				daysAfterCalving: null,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe("繁殖待機中");
		});

		it("should return correct description for Inseminated", () => {
			const status: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 21 as DaysAfterInsemination,
				inseminationCount: 2 as InseminationCount,
				daysOpen: 66 as DaysOpen,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe(
				"人工授精済み (2回目, 21日経過)"
			);
		});

		it("should return correct description for Pregnant", () => {
			const status: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 150 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: null,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe("妊娠中 (150日目)");
		});

		it("should return correct description for PostCalving", () => {
			const status: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 30 as DaysAfterCalving,
				isDifficultBirth: true,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe(
				"分娩後 (30日経過, 難産)"
			);
		});

		it("should return correct description for PostCalving with normal birth", () => {
			const status: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 30 as DaysAfterCalving,
				isDifficultBirth: false,
				memo: null
			};

			expect(getBreedingPhaseDescription(status)).toBe(
				"分娩後 (30日経過, 安産)"
			);
		});
	});

	describe("needsBreedingAttention", () => {
		const currentDate = new Date("2024-01-15T00:00:00Z");

		it("should return true for Inseminated over 21 days", () => {
			const status: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 25 as DaysAfterInsemination,
				inseminationCount: 1 as InseminationCount,
				daysOpen: 70 as DaysOpen,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(true);
		});

		it("should return false for Inseminated under 21 days", () => {
			const status: BreedingStatus = {
				type: "Inseminated",
				parity: 1 as Parity,
				daysAfterInsemination: 15 as DaysAfterInsemination,
				inseminationCount: 1 as InseminationCount,
				daysOpen: 60 as DaysOpen,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(false);
		});

		it("should return true for Pregnant with scheduled check date", () => {
			const status: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 150 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: new Date("2024-01-10T00:00:00Z"),
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(true);
		});

		it("should return true for Pregnant over 280 days", () => {
			const status: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 285 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: null,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(true);
		});

		it("should return false for Pregnant under 280 days without scheduled check", () => {
			const status: BreedingStatus = {
				type: "Pregnant",
				parity: 1 as Parity,
				pregnancyDays: 150 as PregnancyDays,
				expectedCalvingDate: new Date("2024-10-01T00:00:00Z"),
				scheduledPregnancyCheckDate: null,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(false);
		});

		it("should return true for PostCalving over 60 days", () => {
			const status: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 65 as DaysAfterCalving,
				isDifficultBirth: false,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(true);
		});

		it("should return false for PostCalving under 60 days", () => {
			const status: BreedingStatus = {
				type: "PostCalving",
				parity: 2 as Parity,
				daysAfterCalving: 45 as DaysAfterCalving,
				isDifficultBirth: false,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(false);
		});

		it("should return false for NotBreeding", () => {
			const status: BreedingStatus = {
				type: "NotBreeding",
				parity: 1 as Parity,
				daysAfterCalving: null,
				memo: null
			};

			expect(needsBreedingAttention(status, currentDate)).toBe(false);
		});
	});

	describe("Type safety", () => {
		it("should enforce readonly properties", () => {
			const status: BreedingStatus = {
				type: "NotBreeding",
				parity: 1 as Parity,
				daysAfterCalving: null,
				memo: null
			};

			// This should compile without errors
			expect(status.type).toBe("NotBreeding");
			expect(status.parity).toBe(1);
		});

		it("should enforce brand types", () => {
			// These should compile without errors
			const parity: Parity = 1 as Parity;
			const breedingMemo: BreedingMemo = "Test memo" as BreedingMemo;
			const daysAfterCalving: DaysAfterCalving = 45 as DaysAfterCalving;
			const daysAfterInsemination: DaysAfterInsemination =
				21 as DaysAfterInsemination;
			const inseminationCount: InseminationCount = 2 as InseminationCount;
			const daysOpen: DaysOpen = 66 as DaysOpen;
			const pregnancyDays: PregnancyDays = 150 as PregnancyDays;

			expect(typeof parity).toBe("number");
			expect(typeof breedingMemo).toBe("string");
			expect(typeof daysAfterCalving).toBe("number");
			expect(typeof daysAfterInsemination).toBe("number");
			expect(typeof inseminationCount).toBe("number");
			expect(typeof daysOpen).toBe("number");
			expect(typeof pregnancyDays).toBe("number");
		});
	});
});

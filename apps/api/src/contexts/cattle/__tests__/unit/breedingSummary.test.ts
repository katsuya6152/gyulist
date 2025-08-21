import { describe, expect, it } from "vitest";
import type { BreedingEvent } from "../../domain/model/breedingStatus";
import {
	createBreedingSummary,
	createInitialBreedingSummary,
	getBreedingPerformanceRating,
	needsBreedingSummaryUpdate,
	updateBreedingSummary
} from "../../domain/model/breedingSummary";
import type {
	AverageCalvingInterval,
	AverageDaysOpen,
	AveragePregnancyPeriod,
	PregnancySuccessRate
} from "../../domain/model/types";

describe("BreedingSummary Domain Model", () => {
	describe("createInitialBreedingSummary", () => {
		it("should create initial breeding summary with default values", () => {
			const summary = createInitialBreedingSummary();

			expect(summary.totalInseminationCount).toBe(0);
			expect(summary.averageDaysOpen).toBeNull();
			expect(summary.averagePregnancyPeriod).toBeNull();
			expect(summary.averageCalvingInterval).toBeNull();
			expect(summary.difficultBirthCount).toBe(0);
			expect(summary.pregnancyHeadCount).toBe(0);
			expect(summary.pregnancySuccessRate).toBeNull();
			expect(summary.lastUpdated).toBeInstanceOf(Date);
		});
	});

	describe("createBreedingSummary", () => {
		it("should create breeding summary with valid data", () => {
			const props = {
				totalInseminationCount: 10,
				averageDaysOpen: 120 as AverageDaysOpen,
				averagePregnancyPeriod: 280 as AveragePregnancyPeriod,
				averageCalvingInterval: 400 as AverageCalvingInterval,
				difficultBirthCount: 2,
				pregnancyHeadCount: 8,
				pregnancySuccessRate: 80 as PregnancySuccessRate,
				lastUpdated: new Date("2025-01-01")
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.totalInseminationCount).toBe(10);
				expect(result.value.averageDaysOpen).toBe(120);
				expect(result.value.averagePregnancyPeriod).toBe(280);
				expect(result.value.averageCalvingInterval).toBe(400);
				expect(result.value.difficultBirthCount).toBe(2);
				expect(result.value.pregnancyHeadCount).toBe(8);
				expect(result.value.pregnancySuccessRate).toBe(80);
				expect(result.value.lastUpdated).toEqual(new Date("2025-01-01"));
			}
		});

		it("should create breeding summary with minimal data", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.totalInseminationCount).toBe(0);
				expect(result.value.averageDaysOpen).toBeNull();
				expect(result.value.averagePregnancyPeriod).toBeNull();
				expect(result.value.averageCalvingInterval).toBeNull();
				expect(result.value.difficultBirthCount).toBe(0);
				expect(result.value.pregnancyHeadCount).toBe(0);
				expect(result.value.pregnancySuccessRate).toBeNull();
				expect(result.value.lastUpdated).toBeInstanceOf(Date);
			}
		});

		it("should reject negative totalInseminationCount", () => {
			const props = {
				totalInseminationCount: -1,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Total insemination count cannot be negative"
				);
				expect(result.error.field).toBe("totalInseminationCount");
			}
		});

		it("should reject negative difficultBirthCount", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: -1,
				pregnancyHeadCount: 0
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Difficult birth count cannot be negative"
				);
				expect(result.error.field).toBe("difficultBirthCount");
			}
		});

		it("should reject negative pregnancyHeadCount", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: -1
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Pregnancy head count cannot be negative"
				);
				expect(result.error.field).toBe("pregnancyHeadCount");
			}
		});

		it("should reject pregnancySuccessRate below 0", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: -1 as PregnancySuccessRate
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Pregnancy success rate must be between 0 and 100"
				);
				expect(result.error.field).toBe("pregnancySuccessRate");
			}
		});

		it("should reject pregnancySuccessRate above 100", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 101 as PregnancySuccessRate
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Pregnancy success rate must be between 0 and 100"
				);
				expect(result.error.field).toBe("pregnancySuccessRate");
			}
		});

		it("should accept pregnancySuccessRate of 0", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 0 as PregnancySuccessRate
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.pregnancySuccessRate).toBe(0);
			}
		});

		it("should accept pregnancySuccessRate of 100", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 100 as PregnancySuccessRate
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.pregnancySuccessRate).toBe(100);
			}
		});

		it("should reject non-positive averageDaysOpen", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				averageDaysOpen: 0 as AverageDaysOpen
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe("averageDaysOpen must be positive");
				expect(result.error.field).toBe("averageDaysOpen");
			}
		});

		it("should reject non-positive averagePregnancyPeriod", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				averagePregnancyPeriod: -1 as AveragePregnancyPeriod
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"averagePregnancyPeriod must be positive"
				);
				expect(result.error.field).toBe("averagePregnancyPeriod");
			}
		});

		it("should reject non-positive averageCalvingInterval", () => {
			const props = {
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				averageCalvingInterval: 0 as AverageCalvingInterval
			};

			const result = createBreedingSummary(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"averageCalvingInterval must be positive"
				);
				expect(result.error.field).toBe("averageCalvingInterval");
			}
		});
	});

	describe("updateBreedingSummary", () => {
		const baseSummary = createInitialBreedingSummary();

		it("should update summary with Inseminate event", () => {
			const event: BreedingEvent = {
				type: "Inseminate",
				timestamp: new Date("2025-01-01"),
				memo: "Test insemination"
			};

			const updatedSummary = updateBreedingSummary(baseSummary, event, [event]);

			expect(updatedSummary.totalInseminationCount).toBe(1);
			expect(updatedSummary.lastUpdated).toBeInstanceOf(Date);
		});

		it("should update summary with ConfirmPregnancy event", () => {
			const event: BreedingEvent = {
				type: "ConfirmPregnancy",
				timestamp: new Date("2025-01-01"),
				expectedCalvingDate: new Date("2025-10-15"),
				memo: "Test pregnancy confirmation"
			};

			const updatedSummary = updateBreedingSummary(baseSummary, event, [event]);

			expect(updatedSummary.pregnancyHeadCount).toBe(1);
			expect(updatedSummary.lastUpdated).toBeInstanceOf(Date);
		});

		it("should update summary with Calve event (normal birth)", () => {
			const event: BreedingEvent = {
				type: "Calve",
				timestamp: new Date("2025-01-01"),
				isDifficultBirth: false,
				memo: "Test calving"
			};

			const updatedSummary = updateBreedingSummary(baseSummary, event, [event]);

			expect(updatedSummary.difficultBirthCount).toBe(0);
			expect(updatedSummary.lastUpdated).toBeInstanceOf(Date);
		});

		it("should update summary with Calve event (difficult birth)", () => {
			const event: BreedingEvent = {
				type: "Calve",
				timestamp: new Date("2025-01-01"),
				isDifficultBirth: true,
				memo: "Test difficult calving"
			};

			const updatedSummary = updateBreedingSummary(baseSummary, event, [event]);

			expect(updatedSummary.difficultBirthCount).toBe(1);
			expect(updatedSummary.lastUpdated).toBeInstanceOf(Date);
		});

		it("should recalculate metrics based on full history", () => {
			const inseminateEvent: BreedingEvent = {
				type: "Inseminate",
				timestamp: new Date("2025-01-01"),
				memo: "First insemination"
			};

			const pregnancyEvent: BreedingEvent = {
				type: "ConfirmPregnancy",
				timestamp: new Date("2025-01-15"),
				expectedCalvingDate: new Date("2025-10-15"),
				memo: "Pregnancy confirmed"
			};

			const calveEvent: BreedingEvent = {
				type: "Calve",
				timestamp: new Date("2025-10-15"),
				isDifficultBirth: false,
				memo: "Calving"
			};

			const history = [inseminateEvent, pregnancyEvent, calveEvent];
			const updatedSummary = updateBreedingSummary(
				baseSummary,
				calveEvent,
				history
			);

			expect(updatedSummary.totalInseminationCount).toBe(1);
			expect(updatedSummary.pregnancyHeadCount).toBe(1);
			expect(updatedSummary.difficultBirthCount).toBe(0);
			expect(updatedSummary.pregnancySuccessRate).toBe(100);
			expect(updatedSummary.averagePregnancyPeriod).toBe(287); // ~287 days
		});
	});

	describe("getBreedingPerformanceRating", () => {
		it("should return Unknown when pregnancySuccessRate is null", () => {
			const summary = createInitialBreedingSummary();
			const rating = getBreedingPerformanceRating(summary);

			expect(rating).toBe("Unknown");
		});

		it("should return Excellent for success rate >= 90", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 90 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Excellent");
			}
		});

		it("should return Excellent for success rate 100", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 100 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Excellent");
			}
		});

		it("should return Good for success rate >= 75 and < 90", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 75 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Good");
			}
		});

		it("should return Good for success rate 89", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 89 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Good");
			}
		});

		it("should return Average for success rate >= 60 and < 75", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 60 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Average");
			}
		});

		it("should return Average for success rate 74", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 74 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Average");
			}
		});

		it("should return Poor for success rate < 60", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 59 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Poor");
			}
		});

		it("should return Poor for success rate 0", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				pregnancySuccessRate: 0 as PregnancySuccessRate
			});

			if (summary.ok) {
				const rating = getBreedingPerformanceRating(summary.value);
				expect(rating).toBe("Poor");
			}
		});
	});

	describe("needsBreedingSummaryUpdate", () => {
		it("should return false when summary is less than 30 days old", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				lastUpdated: new Date("2025-01-01")
			});

			if (summary.ok) {
				const currentDate = new Date("2025-01-15"); // 14 days later
				const needsUpdate = needsBreedingSummaryUpdate(
					summary.value,
					currentDate
				);

				expect(needsUpdate).toBe(false);
			}
		});

		it("should return true when summary is more than 30 days old", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				lastUpdated: new Date("2025-01-01")
			});

			if (summary.ok) {
				const currentDate = new Date("2025-02-15"); // 45 days later
				const needsUpdate = needsBreedingSummaryUpdate(
					summary.value,
					currentDate
				);

				expect(needsUpdate).toBe(true);
			}
		});

		it("should return true when summary is exactly 31 days old", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				lastUpdated: new Date("2025-01-01")
			});

			if (summary.ok) {
				const currentDate = new Date("2025-02-01"); // 31 days later
				const needsUpdate = needsBreedingSummaryUpdate(
					summary.value,
					currentDate
				);

				expect(needsUpdate).toBe(true);
			}
		});

		it("should return false when summary is exactly 30 days old", () => {
			const summary = createBreedingSummary({
				totalInseminationCount: 0,
				difficultBirthCount: 0,
				pregnancyHeadCount: 0,
				lastUpdated: new Date("2025-01-01")
			});

			if (summary.ok) {
				const currentDate = new Date("2025-01-31"); // 30 days later
				const needsUpdate = needsBreedingSummaryUpdate(
					summary.value,
					currentDate
				);

				expect(needsUpdate).toBe(false);
			}
		});
	});
});

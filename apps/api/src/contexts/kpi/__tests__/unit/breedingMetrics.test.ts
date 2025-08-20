import { describe, expect, it } from "vitest";
import {
	type AIPerConception,
	type AverageCalvingInterval,
	type AverageDaysOpen,
	type BreedingMetrics,
	type ConceptionRate,
	breedingMetricsToJson,
	compareBreedingMetrics,
	createAIPerConception,
	createAverageCalvingInterval,
	createAverageDaysOpen,
	createBreedingMetrics,
	createConceptionRate,
	isValidAIPerConception,
	isValidAverageCalvingInterval,
	isValidAverageDaysOpen,
	isValidConceptionRate,
	summarizeBreedingMetrics,
	validateBreedingMetrics
} from "../../domain/model/breedingMetrics";

describe("BreedingMetrics Domain Model", () => {
	describe("ConceptionRate", () => {
		it("should create valid conception rate", () => {
			const result = createConceptionRate(75.5);

			expect(result.value).toBe(75.5);
			expect(result.unit).toBe("%");
			expect(result.displayValue).toBe("75.5%");
		});

		it("should round conception rate to 1 decimal place", () => {
			const result = createConceptionRate(75.67);

			expect(result.value).toBe(75.7);
			expect(result.displayValue).toBe("75.7%");
		});

		it("should handle zero conception rate", () => {
			const result = createConceptionRate(0);

			expect(result.value).toBe(0);
			expect(result.displayValue).toBe("0%");
		});

		it("should handle 100% conception rate", () => {
			const result = createConceptionRate(100);

			expect(result.value).toBe(100);
			expect(result.displayValue).toBe("100%");
		});

		it("should throw error for negative value", () => {
			expect(() => createConceptionRate(-5)).toThrow(
				"Conception rate must be a valid positive number"
			);
		});

		it("should throw error for value over 100", () => {
			expect(() => createConceptionRate(105)).toThrow(
				"Conception rate cannot exceed 100%"
			);
		});

		it("should throw error for invalid value", () => {
			expect(() => createConceptionRate(Number.NaN)).toThrow(
				"Conception rate must be a valid positive number"
			);
		});

		it("should validate valid conception rates", () => {
			expect(isValidConceptionRate(0)).toBe(true);
			expect(isValidConceptionRate(50)).toBe(true);
			expect(isValidConceptionRate(100)).toBe(true);
			expect(isValidConceptionRate(75.5)).toBe(true);
		});

		it("should reject invalid conception rates", () => {
			expect(isValidConceptionRate(-5)).toBe(false);
			expect(isValidConceptionRate(105)).toBe(false);
			expect(isValidConceptionRate(Number.NaN)).toBe(false);
			expect(isValidConceptionRate(Number.POSITIVE_INFINITY)).toBe(false);
		});
	});

	describe("AverageDaysOpen", () => {
		it("should create valid average days open", () => {
			const result = createAverageDaysOpen(45.7);

			expect(result.value).toBe(46); // Rounded
			expect(result.unit).toBe("日");
			expect(result.displayValue).toBe("46日");
		});

		it("should round average days open to integer", () => {
			const result = createAverageDaysOpen(45.2);

			expect(result.value).toBe(45);
			expect(result.displayValue).toBe("45日");
		});

		it("should handle zero days open", () => {
			const result = createAverageDaysOpen(0);

			expect(result.value).toBe(0);
			expect(result.displayValue).toBe("0日");
		});

		it("should throw error for negative value", () => {
			expect(() => createAverageDaysOpen(-5)).toThrow(
				"Average days open must be a valid positive number"
			);
		});

		it("should throw error for invalid value", () => {
			expect(() => createAverageDaysOpen(Number.NaN)).toThrow(
				"Average days open must be a valid positive number"
			);
		});

		it("should validate valid average days open", () => {
			expect(isValidAverageDaysOpen(0)).toBe(true);
			expect(isValidAverageDaysOpen(45)).toBe(true);
			expect(isValidAverageDaysOpen(120)).toBe(true);
		});

		it("should reject invalid average days open", () => {
			expect(isValidAverageDaysOpen(-5)).toBe(false);
			expect(isValidAverageDaysOpen(Number.NaN)).toBe(false);
			expect(isValidAverageDaysOpen(Number.POSITIVE_INFINITY)).toBe(false);
		});
	});

	describe("AverageCalvingInterval", () => {
		it("should create valid average calving interval", () => {
			const result = createAverageCalvingInterval(365.8);

			expect(result.value).toBe(366); // Rounded
			expect(result.unit).toBe("日");
			expect(result.displayValue).toBe("366日");
		});

		it("should round average calving interval to integer", () => {
			const result = createAverageCalvingInterval(365.4);

			expect(result.value).toBe(365);
			expect(result.displayValue).toBe("365日");
		});

		it("should handle zero calving interval", () => {
			const result = createAverageCalvingInterval(0);

			expect(result.value).toBe(0);
			expect(result.displayValue).toBe("0日");
		});

		it("should throw error for negative value", () => {
			expect(() => createAverageCalvingInterval(-30)).toThrow(
				"Average calving interval must be a valid positive number"
			);
		});

		it("should throw error for invalid value", () => {
			expect(() => createAverageCalvingInterval(Number.NaN)).toThrow(
				"Average calving interval must be a valid positive number"
			);
		});

		it("should validate valid average calving interval", () => {
			expect(isValidAverageCalvingInterval(0)).toBe(true);
			expect(isValidAverageCalvingInterval(365)).toBe(true);
			expect(isValidAverageCalvingInterval(400)).toBe(true);
		});

		it("should reject invalid average calving interval", () => {
			expect(isValidAverageCalvingInterval(-30)).toBe(false);
			expect(isValidAverageCalvingInterval(Number.NaN)).toBe(false);
			expect(isValidAverageCalvingInterval(Number.POSITIVE_INFINITY)).toBe(
				false
			);
		});
	});

	describe("AIPerConception", () => {
		it("should create valid AI per conception", () => {
			const result = createAIPerConception(2.3);

			expect(result.value).toBe(2.3);
			expect(result.unit).toBe("回");
			expect(result.displayValue).toBe("2.3回");
		});

		it("should round AI per conception to 1 decimal place", () => {
			const result = createAIPerConception(2.67);

			expect(result.value).toBe(2.7);
			expect(result.displayValue).toBe("2.7回");
		});

		it("should handle minimum value of 1", () => {
			const result = createAIPerConception(1);

			expect(result.value).toBe(1);
			expect(result.displayValue).toBe("1回");
		});

		it("should throw error for value less than 1", () => {
			expect(() => createAIPerConception(0.5)).toThrow(
				"AI per conception must be at least 1"
			);
			expect(() => createAIPerConception(0)).toThrow(
				"AI per conception must be at least 1"
			);
		});

		it("should throw error for negative value", () => {
			expect(() => createAIPerConception(-1)).toThrow(
				"AI per conception must be a valid positive number"
			);
		});

		it("should throw error for invalid value", () => {
			expect(() => createAIPerConception(Number.NaN)).toThrow(
				"AI per conception must be a valid positive number"
			);
		});

		it("should validate valid AI per conception", () => {
			expect(isValidAIPerConception(1)).toBe(true);
			expect(isValidAIPerConception(2.5)).toBe(true);
			expect(isValidAIPerConception(5)).toBe(true);
		});

		it("should reject invalid AI per conception", () => {
			expect(isValidAIPerConception(0.5)).toBe(false);
			expect(isValidAIPerConception(0)).toBe(false);
			expect(isValidAIPerConception(-1)).toBe(false);
			expect(isValidAIPerConception(Number.NaN)).toBe(false);
		});
	});

	describe("BreedingMetrics", () => {
		it("should create breeding metrics with all values", () => {
			const result = createBreedingMetrics(75.5, 45, 365, 2.3);

			expect(result.conceptionRate?.value).toBe(75.5);
			expect(result.averageDaysOpen?.value).toBe(45);
			expect(result.averageCalvingInterval?.value).toBe(365);
			expect(result.aiPerConception?.value).toBe(2.3);
		});

		it("should create breeding metrics with partial values", () => {
			const result = createBreedingMetrics(75.5, null, 365, null);

			expect(result.conceptionRate?.value).toBe(75.5);
			expect(result.averageDaysOpen).toBeNull();
			expect(result.averageCalvingInterval?.value).toBe(365);
			expect(result.aiPerConception).toBeNull();
		});

		it("should create breeding metrics with no values", () => {
			const result = createBreedingMetrics(null, null, null, null);

			expect(result.conceptionRate).toBeNull();
			expect(result.averageDaysOpen).toBeNull();
			expect(result.averageCalvingInterval).toBeNull();
			expect(result.aiPerConception).toBeNull();
		});

		it("should validate valid breeding metrics", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 75.5, unit: "%", displayValue: "75.5%" },
				averageDaysOpen: { value: 45, unit: "日", displayValue: "45日" },
				averageCalvingInterval: {
					value: 365,
					unit: "日",
					displayValue: "365日"
				},
				aiPerConception: { value: 2.3, unit: "回", displayValue: "2.3回" }
			};

			expect(validateBreedingMetrics(metrics)).toBe(true);
		});

		it("should validate breeding metrics with null values", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: null,
				averageDaysOpen: null,
				averageCalvingInterval: null,
				aiPerConception: null
			};

			expect(validateBreedingMetrics(metrics)).toBe(true);
		});

		it("should reject invalid breeding metrics", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 105, unit: "%", displayValue: "105%" }, // Invalid
				averageDaysOpen: { value: 45, unit: "日", displayValue: "45日" },
				averageCalvingInterval: {
					value: 365,
					unit: "日",
					displayValue: "365日"
				},
				aiPerConception: { value: 2.3, unit: "回", displayValue: "2.3回" }
			};

			expect(validateBreedingMetrics(metrics)).toBe(false);
		});
	});

	describe("compareBreedingMetrics", () => {
		const currentMetrics: BreedingMetrics = {
			conceptionRate: { value: 80, unit: "%", displayValue: "80%" },
			averageDaysOpen: { value: 40, unit: "日", displayValue: "40日" },
			averageCalvingInterval: { value: 360, unit: "日", displayValue: "360日" },
			aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
		};

		const previousMetrics: BreedingMetrics = {
			conceptionRate: { value: 75, unit: "%", displayValue: "75%" },
			averageDaysOpen: { value: 50, unit: "日", displayValue: "50日" },
			averageCalvingInterval: { value: 370, unit: "日", displayValue: "370日" },
			aiPerConception: { value: 2.5, unit: "回", displayValue: "2.5回" }
		};

		it("should compare improving metrics", () => {
			const result = compareBreedingMetrics(currentMetrics, previousMetrics);

			expect(result.conceptionRate).toBe("improving"); // 80 > 75 (6.67% change > 5%)
			expect(result.averageDaysOpen).toBe("improving"); // 40 < 50 (20% change > 5%)
			expect(result.averageCalvingInterval).toBe("stable"); // 360 vs 370 (2.7% change < 5%)
			expect(result.aiPerConception).toBe("improving"); // 2.0 < 2.5 (20% change > 5%)
		});

		it("should compare declining metrics", () => {
			const result = compareBreedingMetrics(previousMetrics, currentMetrics);

			expect(result.conceptionRate).toBe("declining"); // 75 < 80
			expect(result.averageDaysOpen).toBe("declining"); // 50 > 40 (higher is worse)
			expect(result.averageCalvingInterval).toBe("stable"); // 370 > 360 (2.7% change < 5%)
			expect(result.aiPerConception).toBe("declining"); // 2.5 > 2.0 (higher is worse)
		});

		it("should identify stable metrics", () => {
			const stableMetrics: BreedingMetrics = {
				conceptionRate: { value: 75.1, unit: "%", displayValue: "75.1%" },
				averageDaysOpen: { value: 50, unit: "日", displayValue: "50日" },
				averageCalvingInterval: {
					value: 365,
					unit: "日",
					displayValue: "365日"
				},
				aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
			};

			const result = compareBreedingMetrics(stableMetrics, previousMetrics);

			expect(result.conceptionRate).toBe("stable"); // 75.1 vs 75 (0.13% change < 5%)
			expect(result.averageDaysOpen).toBe("stable"); // 50 vs 50 (no change)
			expect(result.averageCalvingInterval).toBe("stable"); // 365 vs 370 (1.35% change < 5%)
			expect(result.aiPerConception).toBe("improving"); // 2.0 vs 2.5 (20% change > 5%)
		});

		it("should handle null values as unknown", () => {
			const partialMetrics: BreedingMetrics = {
				conceptionRate: null,
				averageDaysOpen: { value: 40, unit: "日", displayValue: "40日" },
				averageCalvingInterval: null,
				aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
			};

			const result = compareBreedingMetrics(partialMetrics, previousMetrics);

			expect(result.conceptionRate).toBe("unknown");
			expect(result.averageDaysOpen).toBe("improving");
			expect(result.averageCalvingInterval).toBe("unknown");
			expect(result.aiPerConception).toBe("improving"); // 2.0 < 2.5 (20% change > 5%)
		});
	});

	describe("summarizeBreedingMetrics", () => {
		it("should summarize complete breeding metrics", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 80, unit: "%", displayValue: "80%" },
				averageDaysOpen: { value: 40, unit: "日", displayValue: "40日" },
				averageCalvingInterval: {
					value: 360,
					unit: "日",
					displayValue: "360日"
				},
				aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
			};

			const summary = summarizeBreedingMetrics(metrics);

			expect(summary).toBe(
				"受胎率: 80%, 平均空胎日数: 40日, 平均分娩間隔: 360日, 受胎あたりAI回数: 2.0回"
			);
		});

		it("should summarize partial breeding metrics", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 80, unit: "%", displayValue: "80%" },
				averageDaysOpen: null,
				averageCalvingInterval: {
					value: 360,
					unit: "日",
					displayValue: "360日"
				},
				aiPerConception: null
			};

			const summary = summarizeBreedingMetrics(metrics);

			expect(summary).toBe("受胎率: 80%, 平均分娩間隔: 360日");
		});

		it("should handle empty breeding metrics", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: null,
				averageDaysOpen: null,
				averageCalvingInterval: null,
				aiPerConception: null
			};

			const summary = summarizeBreedingMetrics(metrics);

			expect(summary).toBe("指標データなし");
		});
	});

	describe("breedingMetricsToJson", () => {
		it("should convert breeding metrics to JSON format", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 80, unit: "%", displayValue: "80%" },
				averageDaysOpen: { value: 40, unit: "日", displayValue: "40日" },
				averageCalvingInterval: {
					value: 360,
					unit: "日",
					displayValue: "360日"
				},
				aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
			};

			const json = breedingMetricsToJson(metrics);

			expect(json).toEqual({
				conceptionRate: 80,
				avgDaysOpen: 40,
				avgCalvingInterval: 360,
				aiPerConception: 2.0
			});
		});

		it("should convert partial breeding metrics to JSON format", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: { value: 80, unit: "%", displayValue: "80%" },
				averageDaysOpen: null,
				averageCalvingInterval: {
					value: 360,
					unit: "日",
					displayValue: "360日"
				},
				aiPerConception: null
			};

			const json = breedingMetricsToJson(metrics);

			expect(json).toEqual({
				conceptionRate: 80,
				avgDaysOpen: null,
				avgCalvingInterval: 360,
				aiPerConception: null
			});
		});

		it("should convert empty breeding metrics to JSON format", () => {
			const metrics: BreedingMetrics = {
				conceptionRate: null,
				averageDaysOpen: null,
				averageCalvingInterval: null,
				aiPerConception: null
			};

			const json = breedingMetricsToJson(metrics);

			expect(json).toEqual({
				conceptionRate: null,
				avgDaysOpen: null,
				avgCalvingInterval: null,
				aiPerConception: null
			});
		});
	});

	describe("Type safety", () => {
		it("should enforce readonly properties", () => {
			const conceptionRate: ConceptionRate = {
				value: 75.5,
				unit: "%",
				displayValue: "75.5%"
			};

			// This should compile without errors
			expect(conceptionRate.value).toBe(75.5);
			expect(conceptionRate.unit).toBe("%");
			expect(conceptionRate.displayValue).toBe("75.5%");
		});

		it("should enforce brand types", () => {
			// These should compile without errors
			const conceptionRate: ConceptionRate = {
				value: 75.5,
				unit: "%",
				displayValue: "75.5%"
			};

			const averageDaysOpen: AverageDaysOpen = {
				value: 45,
				unit: "日",
				displayValue: "45日"
			};

			const averageCalvingInterval: AverageCalvingInterval = {
				value: 365,
				unit: "日",
				displayValue: "365日"
			};

			const aiPerConception: AIPerConception = {
				value: 2.3,
				unit: "回",
				displayValue: "2.3回"
			};

			expect(typeof conceptionRate.value).toBe("number");
			expect(typeof averageDaysOpen.value).toBe("number");
			expect(typeof averageCalvingInterval.value).toBe("number");
			expect(typeof aiPerConception.value).toBe("number");
		});
	});
});

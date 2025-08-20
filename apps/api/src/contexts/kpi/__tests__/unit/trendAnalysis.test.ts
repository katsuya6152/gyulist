import { describe, expect, it } from "vitest";
import type { BreedingMetrics } from "../../domain/model/breedingMetrics";
import {
	createTrendAnalysis,
	createTrendDelta,
	createTrendPoint,
	trendAnalysisToJson
} from "../../domain/model/trendAnalysis";
import type {
	TrendAnalysis,
	TrendDelta,
	TrendPoint
} from "../../domain/model/trendAnalysis";
import type { MonthPeriod } from "../../domain/model/types";

describe("TrendAnalysis Domain Model", () => {
	const mockPeriod: MonthPeriod = { year: 2025, month: 1 };
	const mockMetrics: BreedingMetrics = {
		conceptionRate: { value: 75, unit: "%", displayValue: "75%" },
		averageDaysOpen: { value: 120, unit: "日", displayValue: "120日" },
		averageCalvingInterval: { value: 400, unit: "日", displayValue: "400日" },
		aiPerConception: { value: 1.5, unit: "回", displayValue: "1.5回" }
	};
	const mockCounts = {
		inseminations: 10,
		conceptions: 8,
		calvings: 6,
		pairsForDaysOpen: 5,
		totalEvents: 24
	};

	describe("createTrendPoint", () => {
		it("should create trend point with valid data", () => {
			const trendPoint = createTrendPoint(mockPeriod, mockMetrics, mockCounts);

			expect(trendPoint.period).toEqual(mockPeriod);
			expect(trendPoint.metrics).toBe(mockMetrics);
			expect(trendPoint.counts).toBe(mockCounts);
			expect(trendPoint.periodString).toBe("2025-01");
		});

		it("should format period string correctly", () => {
			const period1: MonthPeriod = { year: 2025, month: 1 };
			const period2: MonthPeriod = { year: 2025, month: 12 };
			const period3: MonthPeriod = { year: 2024, month: 3 };

			const point1 = createTrendPoint(period1, mockMetrics, mockCounts);
			const point2 = createTrendPoint(period2, mockMetrics, mockCounts);
			const point3 = createTrendPoint(period3, mockMetrics, mockCounts);

			expect(point1.periodString).toBe("2025-01");
			expect(point2.periodString).toBe("2025-12");
			expect(point3.periodString).toBe("2024-03");
		});
	});

	describe("createTrendDelta", () => {
		it("should create trend delta with previous metrics", () => {
			const previousMetrics: BreedingMetrics = {
				conceptionRate: { value: 60, unit: "%", displayValue: "60%" },
				averageDaysOpen: { value: 140, unit: "日", displayValue: "140日" },
				averageCalvingInterval: {
					value: 440,
					unit: "日",
					displayValue: "440日"
				},
				aiPerConception: { value: 2.0, unit: "回", displayValue: "2.0回" }
			};

			const delta = createTrendDelta(mockPeriod, mockMetrics, previousMetrics);

			expect(delta.period).toEqual(mockPeriod);
			expect(delta.metrics).toBe(mockMetrics);
			expect(delta.periodString).toBe("2025-01");
			expect(delta.changes.conceptionRate).toBe("improving");
			expect(delta.changes.averageDaysOpen).toBe("improving");
			expect(delta.changes.averageCalvingInterval).toBe("improving");
			expect(delta.changes.aiPerConception).toBe("improving");
		});

		it("should create trend delta with no previous metrics", () => {
			const delta = createTrendDelta(mockPeriod, mockMetrics, null);

			expect(delta.period).toEqual(mockPeriod);
			expect(delta.metrics).toBe(mockMetrics);
			expect(delta.periodString).toBe("2025-01");
			expect(delta.changes.conceptionRate).toBe("unknown");
			expect(delta.changes.averageDaysOpen).toBe("unknown");
			expect(delta.changes.averageCalvingInterval).toBe("unknown");
			expect(delta.changes.aiPerConception).toBe("unknown");
		});

		it("should detect declining trends", () => {
			const previousMetrics: BreedingMetrics = {
				conceptionRate: { value: 85, unit: "%", displayValue: "85%" },
				averageDaysOpen: { value: 100, unit: "日", displayValue: "100日" },
				averageCalvingInterval: {
					value: 360,
					unit: "日",
					displayValue: "360日"
				},
				aiPerConception: { value: 1.2, unit: "回", displayValue: "1.2回" }
			};

			const delta = createTrendDelta(mockPeriod, mockMetrics, previousMetrics);

			expect(delta.changes.conceptionRate).toBe("declining");
			expect(delta.changes.averageDaysOpen).toBe("declining");
			expect(delta.changes.averageCalvingInterval).toBe("declining");
			expect(delta.changes.aiPerConception).toBe("declining");
		});

		it("should detect stable trends", () => {
			const previousMetrics: BreedingMetrics = {
				conceptionRate: { value: 75, unit: "%", displayValue: "75%" },
				averageDaysOpen: { value: 120, unit: "日", displayValue: "120日" },
				averageCalvingInterval: {
					value: 400,
					unit: "日",
					displayValue: "400日"
				},
				aiPerConception: { value: 1.5, unit: "回", displayValue: "1.5回" }
			};

			const delta = createTrendDelta(mockPeriod, mockMetrics, previousMetrics);

			expect(delta.changes.conceptionRate).toBe("stable");
			expect(delta.changes.averageDaysOpen).toBe("stable");
			expect(delta.changes.averageCalvingInterval).toBe("stable");
			expect(delta.changes.aiPerConception).toBe("stable");
		});
	});

	describe("createTrendAnalysis", () => {
		const mockSeries: TrendPoint[] = [
			createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts),
			createTrendPoint({ year: 2025, month: 2 }, mockMetrics, mockCounts)
		];

		const mockDeltas: TrendDelta[] = [
			createTrendDelta({ year: 2025, month: 1 }, mockMetrics, null),
			createTrendDelta({ year: 2025, month: 2 }, mockMetrics, mockMetrics)
		];

		it("should create trend analysis with valid data", () => {
			const analysis = createTrendAnalysis(mockSeries, mockDeltas);

			expect(analysis.series).toBe(mockSeries);
			expect(analysis.deltas).toBe(mockDeltas);
			expect(analysis.overallTrend).toBeDefined();
			expect(analysis.periodRange).toBeDefined();
			expect(analysis.summary).toBeDefined();
		});

		it("should handle empty series", () => {
			const analysis = createTrendAnalysis([], []);

			expect(analysis.series).toEqual([]);
			expect(analysis.deltas).toEqual([]);
			expect(analysis.overallTrend.direction).toBe("stable");
			expect(analysis.overallTrend.confidence).toBe("low");
			expect(analysis.periodRange).toBeNull();
			expect(analysis.summary).toContain("データ不足");
		});

		it("should calculate overall trend correctly", () => {
			// Create series with improving trends
			const improvingMetrics: BreedingMetrics = {
				conceptionRate: { value: 85, unit: "%", displayValue: "85%" },
				averageDaysOpen: { value: 110, unit: "日", displayValue: "110日" },
				averageCalvingInterval: {
					value: 380,
					unit: "日",
					displayValue: "380日"
				},
				aiPerConception: { value: 1.3, unit: "回", displayValue: "1.3回" }
			};

			const improvingSeries: TrendPoint[] = [
				createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts),
				createTrendPoint({ year: 2025, month: 2 }, improvingMetrics, mockCounts)
			];

			const improvingDeltas: TrendDelta[] = [
				createTrendDelta({ year: 2025, month: 1 }, mockMetrics, null),
				createTrendDelta(
					{ year: 2025, month: 2 },
					improvingMetrics,
					mockMetrics
				)
			];

			const analysis = createTrendAnalysis(improvingSeries, improvingDeltas);

			expect(analysis.overallTrend.direction).toBe("improving");
		});

		it("should calculate period range correctly", () => {
			const series: TrendPoint[] = [
				createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts),
				createTrendPoint({ year: 2025, month: 3 }, mockMetrics, mockCounts),
				createTrendPoint({ year: 2025, month: 2 }, mockMetrics, mockCounts)
			];

			const analysis = createTrendAnalysis(series, []);

			expect(analysis.periodRange).toBeDefined();
			if (analysis.periodRange) {
				expect(analysis.periodRange.from.getFullYear()).toBe(2025);
				expect(analysis.periodRange.from.getMonth()).toBe(0); // January
				expect(analysis.periodRange.to.getFullYear()).toBe(2025);
				expect(analysis.periodRange.to.getMonth()).toBe(2); // March
			}
		});
	});

	describe("trendAnalysisToJson", () => {
		const mockSeries: TrendPoint[] = [
			createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts),
			createTrendPoint({ year: 2025, month: 2 }, mockMetrics, mockCounts)
		];

		const mockDeltas: TrendDelta[] = [
			createTrendDelta({ year: 2025, month: 1 }, mockMetrics, null),
			createTrendDelta({ year: 2025, month: 2 }, mockMetrics, mockMetrics)
		];

		const mockAnalysis: TrendAnalysis = {
			series: mockSeries,
			deltas: mockDeltas,
			overallTrend: {
				direction: "improving",
				confidence: "high",
				keyInsights: ["受胎率が改善傾向にあります"],
				recommendations: ["現在の管理方法を継続してください"]
			},
			periodRange: {
				from: new Date("2025-01-01"),
				to: new Date("2025-02-28")
			},
			summary:
				"2ヶ月間の分析結果: 全体的に改善傾向。信頼度: high。受胎率が改善傾向にあります"
		};

		it("should convert trend analysis to JSON format", () => {
			const json = trendAnalysisToJson(mockAnalysis);

			expect(json.series).toHaveLength(2);
			expect(json.deltas).toHaveLength(2);
			expect(json.series[0].month).toBe("2025-01");
			expect(json.series[0].metrics.conceptionRate).toBe(75);
			expect(json.series[0].metrics.avgDaysOpen).toBe(120);
			expect(json.series[0].metrics.avgCalvingInterval).toBe(400);
			expect(json.series[0].metrics.aiPerConception).toBe(1.5);
			expect(json.series[0].counts).toEqual(mockCounts);
		});

		it("should handle null metric values", () => {
			const nullMetrics: BreedingMetrics = {
				conceptionRate: null,
				averageDaysOpen: null,
				averageCalvingInterval: null,
				aiPerConception: null
			};

			const seriesWithNulls: TrendPoint[] = [
				createTrendPoint({ year: 2025, month: 1 }, nullMetrics, mockCounts)
			];

			const analysisWithNulls: TrendAnalysis = {
				...mockAnalysis,
				series: seriesWithNulls
			};

			const json = trendAnalysisToJson(analysisWithNulls);

			expect(json.series[0].metrics.conceptionRate).toBeNull();
			expect(json.series[0].metrics.avgDaysOpen).toBeNull();
			expect(json.series[0].metrics.avgCalvingInterval).toBeNull();
			expect(json.series[0].metrics.aiPerConception).toBeNull();
		});

		it("should preserve counts structure", () => {
			const json = trendAnalysisToJson(mockAnalysis);

			expect(json.series[0].counts.inseminations).toBe(10);
			expect(json.series[0].counts.conceptions).toBe(8);
			expect(json.series[0].counts.calvings).toBe(6);
			expect(json.series[0].counts.pairsForDaysOpen).toBe(5);
			expect(json.series[0].counts.totalEvents).toBe(24);
		});

		it("should handle empty series and deltas", () => {
			const emptyAnalysis: TrendAnalysis = {
				series: [],
				deltas: [],
				overallTrend: {
					direction: "stable",
					confidence: "low",
					keyInsights: ["データ不足のためトレンドを分析できません"],
					recommendations: ["より多くのデータを収集してください"]
				},
				periodRange: null,
				summary: "データ不足のためトレンド分析ができません"
			};

			const json = trendAnalysisToJson(emptyAnalysis);

			expect(json.series).toEqual([]);
			expect(json.deltas).toEqual([]);
		});
	});

	describe("Edge cases and error handling", () => {
		it("should handle single month period", () => {
			const singleSeries: TrendPoint[] = [
				createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts)
			];

			const analysis = createTrendAnalysis(singleSeries, []);

			expect(analysis.periodRange).toBeDefined();
			if (analysis.periodRange) {
				expect(analysis.periodRange.from.getMonth()).toBe(0); // January
				expect(analysis.periodRange.to.getMonth()).toBe(0); // January
			}
		});

		it("should handle mixed trend directions", () => {
			// Create deltas with mixed trends
			const mixedDeltas: TrendDelta[] = [
				{
					period: { year: 2025, month: 1 },
					metrics: mockMetrics,
					periodString: "2025-01",
					changes: {
						conceptionRate: "improving",
						averageDaysOpen: "declining",
						averageCalvingInterval: "improving",
						aiPerConception: "declining"
					}
				}
			];

			const testSeries: TrendPoint[] = [
				createTrendPoint({ year: 2025, month: 1 }, mockMetrics, mockCounts)
			];

			const analysis = createTrendAnalysis(testSeries, mixedDeltas);

			expect(analysis.overallTrend.direction).toBe("mixed");
		});

		it("should calculate confidence levels correctly", () => {
			// Test high confidence (12+ data points)
			const highConfidenceSeries: TrendPoint[] = Array.from(
				{ length: 12 },
				(_, i) =>
					createTrendPoint(
						{ year: 2025, month: i + 1 },
						mockMetrics,
						mockCounts
					)
			);

			const analysis1 = createTrendAnalysis(highConfidenceSeries, []);
			expect(analysis1.overallTrend.confidence).toBe("high");

			// Test medium confidence (3-5 data points)
			const mediumConfidenceSeries: TrendPoint[] = Array.from(
				{ length: 4 },
				(_, i) =>
					createTrendPoint(
						{ year: 2025, month: i + 1 },
						mockMetrics,
						mockCounts
					)
			);

			const analysis2 = createTrendAnalysis(mediumConfidenceSeries, []);
			expect(analysis2.overallTrend.confidence).toBe("medium");

			// Test low confidence (<3 data points)
			const lowConfidenceSeries: TrendPoint[] = Array.from(
				{ length: 2 },
				(_, i) =>
					createTrendPoint(
						{ year: 2025, month: i + 1 },
						mockMetrics,
						mockCounts
					)
			);

			const analysis3 = createTrendAnalysis(lowConfidenceSeries, []);
			expect(analysis3.overallTrend.confidence).toBe("low");
		});
	});
});

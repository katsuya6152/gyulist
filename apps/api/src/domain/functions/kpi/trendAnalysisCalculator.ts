/**
 * Trend Analysis Calculator
 *
 * トレンド分析の計算を行うドメイン関数群
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { KpiError } from "../../errors/kpi/KpiErrors";
import type {
	BreedingMetrics,
	ConfidenceLevel,
	DateRange,
	MetricChanges,
	MonthPeriod,
	OverallTrend,
	OverallTrendDirection,
	TrendAnalysis,
	TrendCounts,
	TrendDelta,
	TrendDirection,
	TrendPoint
} from "../../types/kpi";
import { formatMonthPeriod } from "../../types/kpi";

/**
 * トレンドポイントの作成
 *
 * @param period - 期間
 * @param metrics - 繁殖指標
 * @param counts - イベント数
 * @returns トレンドポイント
 */
export function createTrendPoint(
	period: MonthPeriod,
	metrics: BreedingMetrics,
	counts: TrendCounts
): TrendPoint {
	return {
		period,
		metrics,
		counts,
		periodString: formatMonthPeriod(period)
	};
}

/**
 * トレンドデルタの作成
 *
 * @param period - 期間
 * @param metrics - 現在の指標
 * @param previousMetrics - 前回の指標
 * @returns トレンドデルタ
 */
export function createTrendDelta(
	period: MonthPeriod,
	metrics: BreedingMetrics,
	previousMetrics: BreedingMetrics | null
): TrendDelta {
	const changes = previousMetrics
		? compareBreedingMetrics(metrics, previousMetrics)
		: {
				conceptionRate: "stable" as const,
				averageDaysOpen: "stable" as const,
				averageCalvingInterval: "stable" as const,
				aiPerConception: "stable" as const
			};

	return {
		period,
		metrics,
		periodString: formatMonthPeriod(period),
		changes
	};
}

/**
 * トレンド分析の作成
 *
 * @param series - 時系列データ
 * @param deltas - 変化データ
 * @returns トレンド分析結果
 */
export function createTrendAnalysis(
	series: TrendPoint[],
	deltas: TrendDelta[]
): Result<TrendAnalysis, KpiError> {
	if (series.length === 0) {
		return err({
			type: "DataInsufficientError",
			message: "No data points available for trend analysis",
			requiredData: ["series"]
		});
	}

	const overallTrend = calculateOverallTrend(series, deltas);
	const periodRange = calculatePeriodRange(series);
	const summary = generateTrendSummary(series, deltas, overallTrend);

	return ok({
		series,
		deltas,
		overallTrend,
		periodRange,
		summary
	});
}

/**
 * 繁殖指標の比較
 *
 * @param current - 現在の指標
 * @param previous - 前回の指標
 * @returns 指標の変化
 */
export function compareBreedingMetrics(
	current: BreedingMetrics,
	previous: BreedingMetrics
): MetricChanges {
	return {
		conceptionRate: compareMetricValues(
			current.conceptionRate?.value ?? null,
			previous.conceptionRate?.value ?? null,
			"higher"
		),
		averageDaysOpen: compareMetricValues(
			current.averageDaysOpen?.value ?? null,
			previous.averageDaysOpen?.value ?? null,
			"lower"
		),
		averageCalvingInterval: compareMetricValues(
			current.averageCalvingInterval?.value ?? null,
			previous.averageCalvingInterval?.value ?? null,
			"lower"
		),
		aiPerConception: compareMetricValues(
			current.aiPerConception?.value ?? null,
			previous.aiPerConception?.value ?? null,
			"lower"
		)
	};
}

/**
 * 指標値の比較
 *
 * @param current - 現在の指標値
 * @param previous - 前回の指標値
 * @param betterDirection - 改善度を判定する方向
 * @returns 改善度
 */
function compareMetricValues(
	current: number | null,
	previous: number | null,
	betterDirection: "higher" | "lower"
): TrendDirection {
	if (current === null || previous === null) {
		return "stable";
	}

	const change = current - previous;
	const changePercent = Math.abs(change / previous) * 100;

	// 5%未満の変化は安定とみなす
	if (changePercent < 5) {
		return "stable";
	}

	if (betterDirection === "higher") {
		return change > 0 ? "improving" : "declining";
	}

	return change < 0 ? "improving" : "declining";
}

/**
 * 全体的なトレンドの計算
 *
 * @param series - 時系列データ
 * @param deltas - 変化データ
 * @returns 全体的なトレンド
 */
function calculateOverallTrend(
	series: TrendPoint[],
	deltas: TrendDelta[]
): OverallTrend {
	if (series.length === 0) {
		return {
			direction: "stable",
			confidence: "low",
			keyInsights: ["データ不足のためトレンドを分析できません"],
			recommendations: ["より多くのデータを収集してください"]
		};
	}

	// 各指標の改善傾向を分析
	const improvingMetrics: string[] = [];
	const decliningMetrics: string[] = [];
	const stableMetrics: string[] = [];

	for (const delta of deltas) {
		if (delta.changes.conceptionRate === "improving") {
			improvingMetrics.push("受胎率");
		} else if (delta.changes.conceptionRate === "declining") {
			decliningMetrics.push("受胎率");
		} else {
			stableMetrics.push("受胎率");
		}

		if (delta.changes.averageDaysOpen === "improving") {
			improvingMetrics.push("平均空胎日数");
		} else if (delta.changes.averageDaysOpen === "declining") {
			decliningMetrics.push("平均空胎日数");
		} else {
			stableMetrics.push("平均空胎日数");
		}

		if (delta.changes.averageCalvingInterval === "improving") {
			improvingMetrics.push("平均分娩間隔");
		} else if (delta.changes.averageCalvingInterval === "declining") {
			decliningMetrics.push("平均分娩間隔");
		} else {
			stableMetrics.push("平均分娩間隔");
		}

		if (delta.changes.aiPerConception === "improving") {
			improvingMetrics.push("受胎あたりAI回数");
		} else if (delta.changes.aiPerConception === "declining") {
			decliningMetrics.push("受胎あたりAI回数");
		} else {
			stableMetrics.push("受胎あたりAI回数");
		}
	}

	// トレンドの方向性を決定
	let direction: OverallTrendDirection = "mixed";
	if (improvingMetrics.length > decliningMetrics.length) {
		direction = "improving";
	} else if (decliningMetrics.length > improvingMetrics.length) {
		direction = "declining";
	} else if (stableMetrics.length > 0) {
		direction = "stable";
	}

	// 信頼度を計算
	const confidence = calculateConfidence(series.length, deltas.length);

	// 主要な洞察を生成
	const keyInsights = generateKeyInsights(
		improvingMetrics,
		decliningMetrics,
		stableMetrics
	);

	// 推奨事項を生成
	const recommendations = generateRecommendations(
		direction,
		improvingMetrics,
		decliningMetrics
	);

	return {
		direction,
		confidence,
		keyInsights,
		recommendations
	};
}

/**
 * 信頼度の計算
 */
function calculateConfidence(
	seriesCount: number,
	deltasCount: number
): ConfidenceLevel {
	const totalDataPoints = seriesCount + deltasCount;
	if (totalDataPoints >= 12) {
		return "high";
	}
	if (totalDataPoints >= 6) {
		return "medium";
	}
	return "low";
}

/**
 * 主要な洞察の生成
 */
function generateKeyInsights(
	improvingMetrics: string[],
	decliningMetrics: string[],
	stableMetrics: string[]
): string[] {
	const insights: string[] = [];

	if (improvingMetrics.length > 0) {
		insights.push(`${improvingMetrics.join("、")}が改善傾向にあります`);
	}

	if (decliningMetrics.length > 0) {
		insights.push(`${decliningMetrics.join("、")}が悪化傾向にあります`);
	}

	if (stableMetrics.length > 0) {
		insights.push(`${stableMetrics.join("、")}が安定しています`);
	}

	if (insights.length === 0) {
		insights.push("トレンドの変化が検出されませんでした");
	}

	return insights;
}

/**
 * 推奨事項の生成
 */
function generateRecommendations(
	direction: OverallTrendDirection,
	improvingMetrics: string[],
	decliningMetrics: string[]
): string[] {
	const recommendations: string[] = [];

	if (direction === "improving") {
		recommendations.push("現在の管理方法を継続してください");
		if (improvingMetrics.length > 0) {
			recommendations.push(
				`${improvingMetrics.join("、")}の改善要因を分析し、他にも適用できないか検討してください`
			);
		}
	} else if (direction === "declining") {
		recommendations.push("管理方法の見直しが必要です");
		if (decliningMetrics.length > 0) {
			recommendations.push(
				`${decliningMetrics.join("、")}の悪化要因を特定し、対策を講じてください`
			);
		}
	} else if (direction === "stable") {
		recommendations.push("現在の管理レベルを維持してください");
		recommendations.push(
			"さらなる改善のための新たなアプローチを検討してください"
		);
	} else if (direction === "mixed") {
		recommendations.push("指標ごとの個別分析が必要です");
		recommendations.push(
			"改善している指標と悪化している指標の要因を詳しく調査してください"
		);
	}

	return recommendations;
}

/**
 * 期間範囲の計算
 */
function calculatePeriodRange(series: TrendPoint[]): DateRange | null {
	if (series.length === 0) {
		return null;
	}

	const periods = series.map((point) => point.period);
	const sortedPeriods = periods.sort((a, b) => {
		if (a.year !== b.year) {
			return a.year - b.year;
		}
		return a.month - b.month;
	});

	const firstPeriod = sortedPeriods[0];
	const lastPeriod = sortedPeriods[sortedPeriods.length - 1];

	const from = new Date(firstPeriod.year, firstPeriod.month - 1, 1);
	const to = new Date(lastPeriod.year, lastPeriod.month, 0); // 月末

	return { from, to };
}

/**
 * トレンドサマリーの生成
 */
function generateTrendSummary(
	series: TrendPoint[],
	deltas: TrendDelta[],
	overallTrend: OverallTrend
): string {
	if (series.length === 0) {
		return "データ不足のためトレンド分析ができません";
	}

	const periodCount = series.length;
	const trendDirection =
		overallTrend.direction === "improving"
			? "改善"
			: overallTrend.direction === "declining"
				? "悪化"
				: overallTrend.direction === "stable"
					? "安定"
					: "混合";

	return `${periodCount}ヶ月間の分析結果: 全体的に${trendDirection}傾向。信頼度: ${overallTrend.confidence}。${overallTrend.keyInsights[0] || "データを分析中"}`;
}

/**
 * トレンド分析のJSON変換
 * APIレスポンス用の形式に変換
 */
export function trendAnalysisToJson(analysis: TrendAnalysis): {
	series: Array<{
		month: string;
		metrics: {
			conceptionRate: number | null;
			avgDaysOpen: number | null;
			avgCalvingInterval: number | null;
			aiPerConception: number | null;
		};
		counts: Record<string, number>;
	}>;
	deltas: Array<{
		month: string;
		metrics: {
			conceptionRate: number | null;
			avgDaysOpen: number | null;
			avgCalvingInterval: number | null;
			aiPerConception: number | null;
		};
	}>;
} {
	return {
		series: analysis.series.map((point) => ({
			month: point.periodString,
			metrics: {
				conceptionRate: point.metrics.conceptionRate?.value ?? null,
				avgDaysOpen: point.metrics.averageDaysOpen?.value ?? null,
				avgCalvingInterval: point.metrics.averageCalvingInterval?.value ?? null,
				aiPerConception: point.metrics.aiPerConception?.value ?? null
			},
			counts: point.counts
		})),
		deltas: analysis.deltas.map((delta) => ({
			month: delta.periodString,
			metrics: {
				conceptionRate: delta.metrics.conceptionRate?.value ?? null,
				avgDaysOpen: delta.metrics.averageDaysOpen?.value ?? null,
				avgCalvingInterval: delta.metrics.averageCalvingInterval?.value ?? null,
				aiPerConception: delta.metrics.aiPerConception?.value ?? null
			}
		}))
	};
}

/**
 * トレンド分析 - ドメインモデル
 *
 * KPI指標の時系列変化を分析し、トレンドを管理する集約です。
 * 月次データ、指標の変化、統計情報を提供します。
 */

import type { BreedingMetrics } from "./breedingMetrics";
import { compareBreedingMetrics } from "./breedingMetrics";
import type { DateRange, MonthPeriod } from "./types";
import { formatMonthPeriod } from "./types";

/**
 * トレンド方向の型定義。
 */
type TrendDirection = "improving" | "declining" | "stable" | "unknown";

/**
 * トレンドポイント。
 *
 * 特定の月の指標データを表現します。
 */
export type TrendPoint = {
	/** 期間 */ readonly period: MonthPeriod;
	/** 繁殖指標 */ readonly metrics: BreedingMetrics;
	/** イベント数 */ readonly counts: TrendCounts;
	/** 期間文字列（YYYY-MM形式） */ readonly periodString: string;
};

/**
 * トレンドカウント。
 *
 * 特定の期間のイベント数を管理します。
 */
export type TrendCounts = {
	/** 授精回数 */ readonly inseminations: number;
	/** 受胎数 */ readonly conceptions: number;
	/** 分娩数 */ readonly calvings: number;
	/** 空胎日数計算対象ペア数 */ readonly pairsForDaysOpen: number;
	/** 総イベント数 */ readonly totalEvents: number;
};

/**
 * トレンドデルタ。
 *
 * 前月比の指標変化を表現します。
 */
export type TrendDelta = {
	/** 期間 */ readonly period: MonthPeriod;
	/** 繁殖指標 */ readonly metrics: BreedingMetrics;
	/** 期間文字列（YYYY-MM形式） */ readonly periodString: string;
	/** 指標の変化 */ readonly changes: MetricChanges;
};

/**
 * 指標の変化。
 *
 * 各指標の前月比変化を管理します。
 */
export type MetricChanges = {
	/** 受胎率の変化方向 */ readonly conceptionRate: TrendDirection;
	/** 平均空胎日数の変化方向 */ readonly averageDaysOpen: TrendDirection;
	/** 平均分娩間隔の変化方向 */ readonly averageCalvingInterval: TrendDirection;
	/** 受胎あたりの授精回数の変化方向 */ readonly aiPerConception: TrendDirection;
};

/**
 * トレンド分析の集約。
 *
 * 時系列での指標変化を分析し、洞察を提供します。
 */
export type TrendAnalysis = {
	/** 時系列データ */ readonly series: TrendPoint[];
	/** 変化データ */ readonly deltas: TrendDelta[];
	/** 全体的なトレンド */ readonly overallTrend: OverallTrend;
	/** 分析期間範囲 */ readonly periodRange: DateRange | null;
	/** 分析要約 */ readonly summary: string;
};

/**
 * 全体的なトレンド。
 *
 * 分析期間全体での傾向を表現します。
 */
export type OverallTrend = {
	/** トレンド方向 */ readonly direction:
		| "improving"
		| "declining"
		| "stable"
		| "mixed";
	/** 信頼度 */ readonly confidence: "high" | "medium" | "low";
	/** 主要な洞察 */ readonly keyInsights: string[];
	/** 推奨事項 */ readonly recommendations: string[];
};

/**
 * トレンドポイントの作成。
 *
 * 特定の期間の指標データからトレンドポイントを生成します。
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
 */
export function createTrendDelta(
	period: MonthPeriod,
	metrics: BreedingMetrics,
	previousMetrics: BreedingMetrics | null
): TrendDelta {
	const changes = previousMetrics
		? compareBreedingMetrics(metrics, previousMetrics)
		: {
				conceptionRate: "unknown" as const,
				averageDaysOpen: "unknown" as const,
				averageCalvingInterval: "unknown" as const,
				aiPerConception: "unknown" as const
			};

	return {
		period,
		metrics,
		periodString: formatMonthPeriod(period),
		changes: {
			conceptionRate: changes.conceptionRate,
			averageDaysOpen: changes.averageDaysOpen,
			averageCalvingInterval: changes.averageCalvingInterval,
			aiPerConception: changes.aiPerConception
		}
	};
}

/**
 * トレンド分析の作成
 */
export function createTrendAnalysis(
	series: TrendPoint[],
	deltas: TrendDelta[]
): TrendAnalysis {
	const overallTrend = calculateOverallTrend(series, deltas);
	const periodRange = calculatePeriodRange(series);
	const summary = generateTrendSummary(series, deltas, overallTrend);

	return {
		series,
		deltas,
		overallTrend,
		periodRange,
		summary
	};
}

/**
 * 全体的なトレンドの計算
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
	let direction: OverallTrend["direction"] = "mixed";
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
): "high" | "medium" | "low" {
	const totalDataPoints = seriesCount + deltasCount;
	if (totalDataPoints >= 12) {
		return "high";
	}
	if (6 > totalDataPoints && totalDataPoints >= 3) {
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
	direction: OverallTrend["direction"],
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

	return `${periodCount}ヶ月間の分析結果: 全体的に${trendDirection}傾向。信頼度: ${overallTrend.confidence}。${overallTrend.keyInsights[0]}`;
}

/**
 * トレンド分析のJSON変換
 *
 * APIレスポンス用の形式に変換します。
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

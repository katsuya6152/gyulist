/**
 * Trend Analysis Types
 *
 * KPIトレンド分析の型定義
 */

import type {
	BreedingMetrics,
	ConfidenceLevel,
	DateRange,
	MonthPeriod,
	OverallTrendDirection,
	TrendCounts,
	TrendDirection
} from "./KpiTypes";

// ============================================================================
// Trend Analysis Types
// ============================================================================

/**
 * トレンドポイント
 * 特定の月の指標データを表現
 */
export type TrendPoint = {
	readonly period: MonthPeriod;
	readonly metrics: BreedingMetrics;
	readonly counts: TrendCounts;
	readonly periodString: string;
};

/**
 * 指標の変化
 * 各指標の前月比変化を管理
 */
export type MetricChanges = {
	readonly conceptionRate: TrendDirection;
	readonly averageDaysOpen: TrendDirection;
	readonly averageCalvingInterval: TrendDirection;
	readonly aiPerConception: TrendDirection;
};

/**
 * トレンドデルタ
 * 前月比の指標変化を表現
 */
export type TrendDelta = {
	readonly period: MonthPeriod;
	readonly metrics: BreedingMetrics;
	readonly periodString: string;
	readonly changes: MetricChanges;
};

/**
 * 全体的なトレンド
 * 分析期間全体での傾向を表現
 */
export type OverallTrend = {
	readonly direction: OverallTrendDirection;
	readonly confidence: ConfidenceLevel;
	readonly keyInsights: string[];
	readonly recommendations: string[];
};

/**
 * トレンド分析の集約
 * 時系列での指標変化を分析し、洞察を提供
 */
export type TrendAnalysis = {
	readonly series: TrendPoint[];
	readonly deltas: TrendDelta[];
	readonly overallTrend: OverallTrend;
	readonly periodRange: DateRange | null;
	readonly summary: string;
};

// ============================================================================
// Search and Filter Types
// ============================================================================

/**
 * トレンド分析の検索条件
 */
export type TrendAnalysisSearchCriteria = {
	ownerUserId: import("../../../shared/brand").UserId;
	startPeriod: MonthPeriod;
	endPeriod: MonthPeriod;
	metricTypes?: string[];
	minDataPoints?: number;
};

/**
 * トレンド分析の結果
 */
export type TrendAnalysisResult = {
	analysis: TrendAnalysis;
	dataQuality: {
		totalDataPoints: number;
		missingDataPoints: number;
		reliability: ConfidenceLevel;
	};
	calculationMetadata: {
		calculatedAt: Date;
		periodCoverage: number; // 0-100%
		warnings: string[];
	};
};

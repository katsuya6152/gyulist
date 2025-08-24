/**
 * KPI Domain Types
 *
 * KPI管理ドメインの基本型定義
 */

import type { Brand } from "../../../shared/brand";

// ============================================================================
// Breeding Event Types
// ============================================================================

/**
 * 繁殖イベントタイプの定数配列
 * KPI計算に使用される繁殖関連のイベントを定義
 */
export const BREEDING_EVENT_TYPES = [
	"INSEMINATION", // 人工授精
	"CALVING", // 分娩
	"ESTRUS", // 発情
	"PREGNANCY_CHECK", // 妊娠検査
	"ABORTION", // 流産
	"CULLING" // 淘汰
] as const;

/**
 * 繁殖イベントタイプの型
 */
export type BreedingEventType = (typeof BREEDING_EVENT_TYPES)[number];

// ============================================================================
// Metric Types
// ============================================================================

/**
 * 指標タイプの定数配列
 * KPI計算で使用される指標の種類を定義
 */
export const METRIC_TYPES = [
	"conceptionRate", // 受胎率
	"avgDaysOpen", // 平均空胎日数
	"avgCalvingInterval", // 平均分娩間隔
	"aiPerConception" // 受胎あたりの人工授精回数
] as const;

/**
 * 指標タイプの型
 */
export type MetricType = (typeof METRIC_TYPES)[number];

/**
 * 指標の表示名
 */
export const METRIC_DISPLAY_NAMES: Record<MetricType, string> = {
	conceptionRate: "受胎率",
	avgDaysOpen: "平均空胎日数",
	avgCalvingInterval: "平均分娩間隔",
	aiPerConception: "受胎あたりの人工授精回数"
};

/**
 * 指標の単位
 */
export const METRIC_UNITS: Record<MetricType, string> = {
	conceptionRate: "%",
	avgDaysOpen: "日",
	avgCalvingInterval: "日",
	aiPerConception: "回"
};

// ============================================================================
// Period Types
// ============================================================================

/**
 * 期間タイプの定数配列
 */
export const PERIOD_TYPES = [
	"daily", // 日次
	"weekly", // 週次
	"monthly", // 月次
	"quarterly", // 四半期
	"yearly" // 年次
] as const;

export type PeriodType = (typeof PERIOD_TYPES)[number];

/**
 * 月次期間の型
 */
export type MonthPeriod = {
	readonly year: number;
	readonly month: number; // 1-12
};

/**
 * 日付期間の型
 */
export type DateRange = {
	readonly from: Date;
	readonly to: Date;
};

// ============================================================================
// Trend Types
// ============================================================================

/**
 * トレンド方向の定数配列
 */
export const TREND_DIRECTIONS = [
	"improving", // 改善
	"declining", // 悪化
	"stable", // 安定
	"fluctuating" // 変動
] as const;

export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

/**
 * 全体的なトレンド方向の型
 */
export type OverallTrendDirection =
	| "improving"
	| "declining"
	| "stable"
	| "mixed";

/**
 * 信頼度レベルの型
 */
export type ConfidenceLevel = "high" | "medium" | "low";

// ============================================================================
// Brand Types
// ============================================================================

export type KpiEventId = Brand<string, "KpiEventId">;

// ============================================================================
// Metric Value Types
// ============================================================================

/**
 * 指標値の型（null許可）
 */
export type MetricValue = number | null;

/**
 * 受胎率の値オブジェクト
 */
export type ConceptionRate = {
	readonly value: number;
	readonly unit: "%";
	readonly displayValue: string;
};

/**
 * 平均空胎日数の値オブジェクト
 */
export type AverageDaysOpen = {
	readonly value: number;
	readonly unit: "日";
	readonly displayValue: string;
};

/**
 * 平均分娩間隔の値オブジェクト
 */
export type AverageCalvingInterval = {
	readonly value: number;
	readonly unit: "日";
	readonly displayValue: string;
};

/**
 * 受胎あたりの人工授精回数の値オブジェクト
 */
export type AIPerConception = {
	readonly value: number;
	readonly unit: "回";
	readonly displayValue: string;
};

/**
 * 繁殖指標の集約
 */
export type BreedingMetrics = {
	readonly conceptionRate: ConceptionRate | null;
	readonly averageDaysOpen: AverageDaysOpen | null;
	readonly averageCalvingInterval: AverageCalvingInterval | null;
	readonly aiPerConception: AIPerConception | null;
};

// ============================================================================
// Event Count Types
// ============================================================================

/**
 * 繁殖イベント数の集約
 */
export type BreedingEventCounts = {
	readonly inseminations: number;
	readonly conceptions: number;
	readonly calvings: number;
	readonly pairsForDaysOpen: number;
	readonly totalEvents: number;
};

/**
 * トレンドカウント
 */
export type TrendCounts = {
	readonly inseminations: number;
	readonly conceptions: number;
	readonly calvings: number;
	readonly pairsForDaysOpen: number;
	readonly totalEvents: number;
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * 指標値の検証
 */
export function isValidMetricValue(value: number): boolean {
	return !Number.isNaN(value) && Number.isFinite(value) && value >= 0;
}

/**
 * 指標値の丸め処理
 */
export function roundMetricValue(value: number, decimals = 1): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/**
 * 月次期間の検証
 */
export function isValidMonthPeriod(period: MonthPeriod): boolean {
	return period.month >= 1 && period.month <= 12 && period.year > 0;
}

/**
 * 日付期間の検証
 */
export function isValidDateRange(range: DateRange): boolean {
	return range.from <= range.to;
}

// ============================================================================
// Format Functions
// ============================================================================

/**
 * 月次期間を文字列形式で表現
 */
export function formatMonthPeriod(period: MonthPeriod): string {
	return `${period.year}-${period.month.toString().padStart(2, "0")}`;
}

/**
 * 日付期間を文字列形式で表現
 */
export function formatDateRange(range: DateRange): string {
	return `${range.from.toISOString().split("T")[0]} - ${range.to.toISOString().split("T")[0]}`;
}

/**
 * 文字列から月次期間を作成
 */
export function parseMonthPeriod(periodStr: string): MonthPeriod {
	const match = periodStr.match(/^(\d{4})-(\d{2})$/);
	if (!match) {
		throw new Error("Invalid month period format. Expected YYYY-MM");
	}
	const year = Number.parseInt(match[1], 10);
	const month = Number.parseInt(match[2], 10);

	if (month < 1 || month > 12) {
		throw new Error("Month must be between 1 and 12");
	}

	return { year, month };
}

/**
 * 日付期間を作成
 */
export function createDateRange(from: Date, to: Date): DateRange {
	if (from > to) {
		throw new Error("From date must be before or equal to to date");
	}
	return { from, to };
}

/**
 * 月次期間を作成
 */
export function createMonthPeriod(year: number, month: number): MonthPeriod {
	if (month < 1 || month > 12) {
		throw new Error("Month must be between 1 and 12");
	}
	return { year, month };
}

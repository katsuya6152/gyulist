/**
 * KPIコンテキスト - 基本的な型定義
 *
 * 繁殖指標計算に必要な基本的な型と列挙型を定義します。
 */

import type { CattleId } from "../../../../shared/brand";

// ===== 繁殖イベントの種類 =====

/**
 * 繁殖イベントタイプの定数配列。
 * KPI計算に使用される繁殖関連のイベントを定義します。
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
 * 繁殖イベントタイプの型。
 * 定数配列から生成される型安全なイベントタイプです。
 */
export type BreedingEventType = (typeof BREEDING_EVENT_TYPES)[number];

// ===== 指標値の型安全な表現 =====

/**
 * 指標値の型。
 * 数値またはnullを表現します。
 */
export type MetricValue = number | null;

/**
 * 指標値の検証を行います。
 * @param value - 検証する数値
 * @returns 有効な指標値の場合は true
 */
export function isValidMetricValue(value: number): boolean {
	return !Number.isNaN(value) && Number.isFinite(value) && value >= 0;
}

/**
 * 指標値を指定された小数点以下桁数で丸めます。
 * @param value - 丸める数値
 * @param decimals - 小数点以下桁数（デフォルト: 1）
 * @returns 丸められた数値
 */
export function roundMetricValue(value: number, decimals = 1): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

// ===== 日付期間の表現 =====

/**
 * 日付期間の型。
 * 開始日と終了日を表現します。
 */
export type DateRange = {
	/** 開始日 */ readonly from: Date;
	/** 終了日 */ readonly to: Date;
};

/**
 * 日付期間を作成します。
 * @param from - 開始日
 * @param to - 終了日
 * @returns 日付期間オブジェクト
 * @throws 開始日が終了日より後の場合
 */
export function createDateRange(from: Date, to: Date): DateRange {
	if (from > to) {
		throw new Error("From date must be before or equal to to date");
	}
	return { from, to };
}

/**
 * 日付期間の検証を行います。
 * @param range - 検証する日付期間
 * @returns 有効な期間の場合は true
 */
export function isValidDateRange(range: DateRange): boolean {
	return range.from <= range.to;
}

/**
 * 日付期間を文字列形式で表現します。
 * @param range - 日付期間
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDateRange(range: DateRange): string {
	return `${range.from.toISOString().split("T")[0]} - ${range.to.toISOString().split("T")[0]}`;
}

// ===== 月次期間の表現 =====

/**
 * 月次期間の型。
 * 年と月を表現します。
 */
export type MonthPeriod = {
	/** 年 */ readonly year: number;
	/** 月（1-12） */ readonly month: number;
};

/**
 * 月次期間を作成します。
 * @param year - 年
 * @param month - 月（1-12）
 * @returns 月次期間オブジェクト
 * @throws 月が1-12の範囲外の場合
 */
export function createMonthPeriod(year: number, month: number): MonthPeriod {
	if (month < 1 || month > 12) {
		throw new Error("Month must be between 1 and 12");
	}
	return { year, month };
}

/**
 * 月次期間を文字列形式で表現します。
 * @param period - 月次期間
 * @returns YYYY-MM形式の文字列
 */
export function formatMonthPeriod(period: MonthPeriod): string {
	return `${period.year}-${period.month.toString().padStart(2, "0")}`;
}

/**
 * 文字列から月次期間を作成します。
 * @param periodStr - YYYY-MM形式の文字列
 * @returns 月次期間オブジェクト
 * @throws 不正な形式の場合
 */
export function parseMonthPeriod(periodStr: string): MonthPeriod {
	const match = periodStr.match(/^(\d{4})-(\d{2})$/);
	if (!match) {
		throw new Error("Invalid month period format. Expected YYYY-MM");
	}
	const year = Number.parseInt(match[1], 10);
	const month = Number.parseInt(match[2], 10);
	return createMonthPeriod(year, month);
}

/**
 * 月次期間の検証を行います。
 * @param period - 検証する月次期間
 * @returns 有効な期間の場合は true
 */
export function isValidMonthPeriod(period: MonthPeriod): boolean {
	return period.month >= 1 && period.month <= 12 && period.year > 0;
}

// ===== 指標の種類 =====

/**
 * 指標タイプの定数配列。
 * KPI計算で使用される指標の種類を定義します。
 */
export const METRIC_TYPES = [
	"conceptionRate", // 受胎率
	"avgDaysOpen", // 平均空胎日数
	"avgCalvingInterval", // 平均分娩間隔
	"aiPerConception" // 受胎あたりの人工授精回数
] as const;

/**
 * 指標タイプの型。
 * 定数配列から生成される型安全な指標タイプです。
 */
export type MetricType = (typeof METRIC_TYPES)[number];

// 指標の表示名
export const METRIC_DISPLAY_NAMES: Record<MetricType, string> = {
	conceptionRate: "受胎率",
	avgDaysOpen: "平均空胎日数",
	avgCalvingInterval: "平均分娩間隔",
	aiPerConception: "受胎あたりの人工授精回数"
};

// 指標の単位
export const METRIC_UNITS: Record<MetricType, string> = {
	conceptionRate: "%",
	avgDaysOpen: "日",
	avgCalvingInterval: "日",
	aiPerConception: "回"
};

// ===== 期間の種類 =====
export const PERIOD_TYPES = [
	"daily", // 日次
	"weekly", // 週次
	"monthly", // 月次
	"quarterly", // 四半期
	"yearly" // 年次
] as const;

export type PeriodType = (typeof PERIOD_TYPES)[number];

// ===== トレンドの方向性 =====
export const TREND_DIRECTIONS = [
	"improving", // 改善
	"declining", // 悪化
	"stable", // 安定
	"fluctuating" // 変動
] as const;

export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

// トレンド方向の判定
export function determineTrendDirection(
	current: number | null,
	previous: number | null
): TrendDirection {
	if (current === null || previous === null) {
		return "stable";
	}

	const change = current - previous;
	const changePercent = Math.abs(change / previous) * 100;

	if (changePercent < 5) {
		return "stable";
	}

	if (change > 0) {
		return "improving";
	}

	return "declining";
}

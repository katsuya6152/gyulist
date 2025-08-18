/**
 * 繁殖指標 - 値オブジェクト
 *
 * 繁殖指標の計算結果を表現する値オブジェクトです。
 * 各指標の値、単位、検証ルールを管理します。
 */

import type { MetricType, MetricValue } from "./types";
import { isValidMetricValue, roundMetricValue } from "./types";

/**
 * 受胎率の値オブジェクト
 *
 * 受胎率を0-100%の範囲で管理し、適切な丸め処理を提供します。
 */
export type ConceptionRate = {
	readonly value: number; // 0-100
	readonly unit: "%";
	readonly displayValue: string;
};

/**
 * 受胎率の作成
 */
export function createConceptionRate(value: number): ConceptionRate {
	if (!isValidMetricValue(value)) {
		throw new Error("Conception rate must be a valid positive number");
	}

	if (value > 100) {
		throw new Error("Conception rate cannot exceed 100%");
	}

	const roundedValue = roundMetricValue(value, 1);

	return {
		value: roundedValue,
		unit: "%",
		displayValue: `${roundedValue}%`
	};
}

/**
 * 受胎率の検証
 */
export function isValidConceptionRate(value: number): boolean {
	return isValidMetricValue(value) && value >= 0 && value <= 100;
}

/**
 * 平均空胎日数の値オブジェクト
 *
 * 平均空胎日数を日単位で管理します。
 */
export type AverageDaysOpen = {
	readonly value: number; // 0以上の整数
	readonly unit: "日";
	readonly displayValue: string;
};

/**
 * 平均空胎日数の作成
 */
export function createAverageDaysOpen(value: number): AverageDaysOpen {
	if (!isValidMetricValue(value)) {
		throw new Error("Average days open must be a valid positive number");
	}

	const roundedValue = Math.round(value);

	return {
		value: roundedValue,
		unit: "日",
		displayValue: `${roundedValue}日`
	};
}

/**
 * 平均空胎日数の検証
 */
export function isValidAverageDaysOpen(value: number): boolean {
	return isValidMetricValue(value) && value >= 0;
}

/**
 * 平均分娩間隔の値オブジェクト
 *
 * 平均分娩間隔を日単位で管理します。
 */
export type AverageCalvingInterval = {
	readonly value: number; // 0以上の整数
	readonly unit: "日";
	readonly displayValue: string;
};

/**
 * 平均分娩間隔の作成
 */
export function createAverageCalvingInterval(
	value: number
): AverageCalvingInterval {
	if (!isValidMetricValue(value)) {
		throw new Error("Average calving interval must be a valid positive number");
	}

	const roundedValue = Math.round(value);

	return {
		value: roundedValue,
		unit: "日",
		displayValue: `${roundedValue}日`
	};
}

/**
 * 平均分娩間隔の検証
 */
export function isValidAverageCalvingInterval(value: number): boolean {
	return isValidMetricValue(value) && value >= 0;
}

/**
 * 受胎あたりの人工授精回数の値オブジェクト
 *
 * 受胎あたりの人工授精回数を回数単位で管理します。
 */
export type AIPerConception = {
	readonly value: number; // 1以上の数値
	readonly unit: "回";
	readonly displayValue: string;
};

/**
 * 受胎あたりの人工授精回数の作成
 */
export function createAIPerConception(value: number): AIPerConception {
	if (!isValidMetricValue(value)) {
		throw new Error("AI per conception must be a valid positive number");
	}

	if (value < 1) {
		throw new Error("AI per conception must be at least 1");
	}

	const roundedValue = roundMetricValue(value, 1);

	return {
		value: roundedValue,
		unit: "回",
		displayValue: `${roundedValue}回`
	};
}

/**
 * 受胎あたりの人工授精回数の検証
 */
export function isValidAIPerConception(value: number): boolean {
	return isValidMetricValue(value) && value >= 1;
}

/**
 * 繁殖指標の集約
 *
 * すべての繁殖指標を一つのオブジェクトにまとめます。
 */
export type BreedingMetrics = {
	readonly conceptionRate: ConceptionRate | null;
	readonly averageDaysOpen: AverageDaysOpen | null;
	readonly averageCalvingInterval: AverageCalvingInterval | null;
	readonly aiPerConception: AIPerConception | null;
};

/**
 * 繁殖指標の作成
 */
export function createBreedingMetrics(
	conceptionRate: number | null,
	averageDaysOpen: number | null,
	averageCalvingInterval: number | null,
	aiPerConception: number | null
): BreedingMetrics {
	return {
		conceptionRate:
			conceptionRate !== null ? createConceptionRate(conceptionRate) : null,
		averageDaysOpen:
			averageDaysOpen !== null ? createAverageDaysOpen(averageDaysOpen) : null,
		averageCalvingInterval:
			averageCalvingInterval !== null
				? createAverageCalvingInterval(averageCalvingInterval)
				: null,
		aiPerConception:
			aiPerConception !== null ? createAIPerConception(aiPerConception) : null
	};
}

/**
 * 繁殖指標の検証
 */
export function validateBreedingMetrics(metrics: BreedingMetrics): boolean {
	if (
		metrics.conceptionRate &&
		!isValidConceptionRate(metrics.conceptionRate.value)
	) {
		return false;
	}

	if (
		metrics.averageDaysOpen &&
		!isValidAverageDaysOpen(metrics.averageDaysOpen.value)
	) {
		return false;
	}

	if (
		metrics.averageCalvingInterval &&
		!isValidAverageCalvingInterval(metrics.averageCalvingInterval.value)
	) {
		return false;
	}

	if (
		metrics.aiPerConception &&
		!isValidAIPerConception(metrics.aiPerConception.value)
	) {
		return false;
	}

	return true;
}

/**
 * 繁殖指標の比較
 *
 * 二つの指標セットを比較し、改善度を判定します。
 */
export function compareBreedingMetrics(
	current: BreedingMetrics,
	previous: BreedingMetrics
): {
	conceptionRate: "improving" | "declining" | "stable" | "unknown";
	averageDaysOpen: "improving" | "declining" | "stable" | "unknown";
	averageCalvingInterval: "improving" | "declining" | "stable" | "unknown";
	aiPerConception: "improving" | "declining" | "stable" | "unknown";
} {
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
 */
function compareMetricValues(
	current: number | null,
	previous: number | null,
	betterDirection: "higher" | "lower"
): "improving" | "declining" | "stable" | "unknown" {
	if (current === null || previous === null) {
		return "unknown";
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
 * 繁殖指標の要約
 *
 * 指標の概要を人間が読みやすい形式で提供します。
 */
export function summarizeBreedingMetrics(metrics: BreedingMetrics): string {
	const parts: string[] = [];

	if (metrics.conceptionRate) {
		parts.push(`受胎率: ${metrics.conceptionRate.displayValue}`);
	}

	if (metrics.averageDaysOpen) {
		parts.push(`平均空胎日数: ${metrics.averageDaysOpen.displayValue}`);
	}

	if (metrics.averageCalvingInterval) {
		parts.push(`平均分娩間隔: ${metrics.averageCalvingInterval.displayValue}`);
	}

	if (metrics.aiPerConception) {
		parts.push(`受胎あたりAI回数: ${metrics.aiPerConception.displayValue}`);
	}

	if (parts.length === 0) {
		return "指標データなし";
	}

	return parts.join(", ");
}

/**
 * 繁殖指標のJSON変換
 *
 * APIレスポンス用の形式に変換します。
 */
export function breedingMetricsToJson(metrics: BreedingMetrics): {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
} {
	return {
		conceptionRate: metrics.conceptionRate?.value ?? null,
		avgDaysOpen: metrics.averageDaysOpen?.value ?? null,
		avgCalvingInterval: metrics.averageCalvingInterval?.value ?? null,
		aiPerConception: metrics.aiPerConception?.value ?? null
	};
}

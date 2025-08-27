/**
 * Breeding Metrics Calculator
 *
 * 繁殖指標の計算を行うドメイン関数群
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { KpiError } from "../../errors/kpi/KpiErrors";
import type {
	AIPerConception,
	AverageCalvingInterval,
	AverageDaysOpen,
	BreedingEventCounts,
	BreedingEventType,
	BreedingMetrics,
	ConceptionRate,
	KpiEvent
} from "../../types/kpi";
import { isValidMetricValue, roundMetricValue } from "../../types/kpi";
import {
	filterKpiEventsByType,
	groupKpiEventsByCattle
} from "./kpiEventFactory";

/**
 * 受胎率の作成
 *
 * @param value - 受胎率（0-100）
 * @returns 受胎率値オブジェクト
 */
export function createConceptionRate(
	value: number
): Result<ConceptionRate, KpiError> {
	if (!isValidMetricValue(value)) {
		return err({
			type: "ValidationError",
			message: "Conception rate must be a valid positive number",
			field: "conceptionRate"
		});
	}

	if (value > 100) {
		return err({
			type: "ValidationError",
			message: "Conception rate cannot exceed 100%",
			field: "conceptionRate"
		});
	}

	const roundedValue = roundMetricValue(value, 1);

	return ok({
		value: roundedValue,
		unit: "%",
		displayValue: `${roundedValue}%`
	});
}

/**
 * 平均空胎日数の作成
 *
 * @param value - 平均空胎日数
 * @returns 平均空胎日数値オブジェクト
 */
export function createAverageDaysOpen(
	value: number
): Result<AverageDaysOpen, KpiError> {
	if (!isValidMetricValue(value)) {
		return err({
			type: "ValidationError",
			message: "Average days open must be a valid positive number",
			field: "averageDaysOpen"
		});
	}

	const roundedValue = Math.round(value);

	return ok({
		value: roundedValue,
		unit: "日",
		displayValue: `${roundedValue}日`
	});
}

/**
 * 平均分娩間隔の作成
 *
 * @param value - 平均分娩間隔
 * @returns 平均分娩間隔値オブジェクト
 */
export function createAverageCalvingInterval(
	value: number
): Result<AverageCalvingInterval, KpiError> {
	if (!isValidMetricValue(value)) {
		return err({
			type: "ValidationError",
			message: "Average calving interval must be a valid positive number",
			field: "averageCalvingInterval"
		});
	}

	const roundedValue = Math.round(value);

	return ok({
		value: roundedValue,
		unit: "日",
		displayValue: `${roundedValue}日`
	});
}

/**
 * 受胎あたりの人工授精回数の作成
 *
 * @param value - 受胎あたりの人工授精回数
 * @returns 受胎あたりの人工授精回数値オブジェクト
 */
export function createAIPerConception(
	value: number
): Result<AIPerConception, KpiError> {
	if (!isValidMetricValue(value)) {
		return err({
			type: "ValidationError",
			message: "AI per conception must be a valid positive number",
			field: "aiPerConception"
		});
	}

	if (value < 1) {
		return err({
			type: "ValidationError",
			message: "AI per conception must be at least 1",
			field: "aiPerConception"
		});
	}

	const roundedValue = roundMetricValue(value, 1);

	return ok({
		value: roundedValue,
		unit: "回",
		displayValue: `${roundedValue}回`
	});
}

/**
 * 繁殖指標の作成
 *
 * @param conceptionRate - 受胎率
 * @param averageDaysOpen - 平均空胎日数
 * @param averageCalvingInterval - 平均分娩間隔
 * @param aiPerConception - 受胎あたりの人工授精回数
 * @returns 繁殖指標値オブジェクト
 */
export function createBreedingMetrics(
	conceptionRate: number | null,
	averageDaysOpen: number | null,
	averageCalvingInterval: number | null,
	aiPerConception: number | null
): Result<BreedingMetrics, KpiError> {
	let conceptionRateObj: ConceptionRate | null = null;
	let averageDaysOpenObj: AverageDaysOpen | null = null;
	let averageCalvingIntervalObj: AverageCalvingInterval | null = null;
	let aiPerConceptionObj: AIPerConception | null = null;

	// 各指標の作成（nullでない場合のみ）
	if (conceptionRate !== null) {
		const result = createConceptionRate(conceptionRate);
		if (!result.ok) return result;
		conceptionRateObj = result.value;
	}

	if (averageDaysOpen !== null) {
		const result = createAverageDaysOpen(averageDaysOpen);
		if (!result.ok) return result;
		averageDaysOpenObj = result.value;
	}

	if (averageCalvingInterval !== null) {
		const result = createAverageCalvingInterval(averageCalvingInterval);
		if (!result.ok) return result;
		averageCalvingIntervalObj = result.value;
	}

	if (aiPerConception !== null) {
		const result = createAIPerConception(aiPerConception);
		if (!result.ok) return result;
		aiPerConceptionObj = result.value;
	}

	return ok({
		conceptionRate: conceptionRateObj,
		averageDaysOpen: averageDaysOpenObj,
		averageCalvingInterval: averageCalvingIntervalObj,
		aiPerConception: aiPerConceptionObj
	});
}

/**
 * KPIイベントプロパティのバリデーション
 *
 * @param props - 検証するプロパティ
 * @param currentTime - 現在時刻
 * @returns バリデーション結果
 */
function validateKpiEventProps(
	props: NewKpiEventProps,
	currentTime: Date
): Result<true, KpiError> {
	// 必須項目チェック
	if (!props.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (!props.eventType) {
		return err({
			type: "ValidationError",
			message: "Event type is required",
			field: "eventType"
		});
	}

	if (!props.eventDatetime) {
		return err({
			type: "ValidationError",
			message: "Event datetime is required",
			field: "eventDatetime"
		});
	}

	// イベントタイプの妥当性チェック
	if (!BREEDING_EVENT_TYPES.includes(props.eventType)) {
		return err({
			type: "ValidationError",
			message: "Invalid event type",
			field: "eventType"
		});
	}

	// 未来の日付は許可しない
	if (props.eventDatetime > currentTime) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be in the future",
			field: "eventDatetime"
		});
	}

	// 過去30年より前の日付は許可しない
	const thirtyYearsAgo = new Date(currentTime);
	thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
	if (props.eventDatetime < thirtyYearsAgo) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be more than 30 years ago",
			field: "eventDatetime"
		});
	}

	return ok(true);
}

/**
 * 繁殖イベント数の計算
 *
 * @param events - KPIイベント一覧
 * @returns 繁殖イベント数の集約
 */
export function calculateBreedingEventCounts(
	events: KpiEvent[]
): BreedingEventCounts {
	const inseminations = filterKpiEventsByType(events, "INSEMINATION").length;
	const calvings = filterKpiEventsByType(events, "CALVING").length;

	// 受胎数は妊娠検査で陽性のもの、または分娩イベントから推定
	const conceptions = calvings; // 簡略化：分娩数を受胎数とする

	// 空胎日数計算対象ペア数（分娩-次回授精のペア）
	const cattleGroups = groupKpiEventsByCattle(events);
	let pairsForDaysOpen = 0;

	for (const [, cattleEvents] of cattleGroups) {
		const calvingEvents = cattleEvents.filter((e) => e.eventType === "CALVING");
		const inseminationEvents = cattleEvents.filter(
			(e) => e.eventType === "INSEMINATION"
		);

		// 各分娩に対して、その後の最初の授精までのペアをカウント
		for (const calving of calvingEvents) {
			const nextInsemination = inseminationEvents.find(
				(ins) => ins.eventDatetime > calving.eventDatetime
			);
			if (nextInsemination) {
				pairsForDaysOpen++;
			}
		}
	}

	return {
		inseminations,
		conceptions,
		calvings,
		pairsForDaysOpen,
		totalEvents: events.length
	};
}

/**
 * 繁殖指標の検証
 *
 * @param metrics - 検証する繁殖指標
 * @returns 検証結果
 */
export function validateBreedingMetrics(
	metrics: BreedingMetrics
): Result<true, KpiError> {
	if (
		metrics.conceptionRate &&
		(metrics.conceptionRate.value < 0 || metrics.conceptionRate.value > 100)
	) {
		return err({
			type: "MetricError",
			message: "Conception rate must be between 0 and 100",
			metricType: "conceptionRate",
			value: metrics.conceptionRate.value
		});
	}

	if (metrics.averageDaysOpen && metrics.averageDaysOpen.value < 0) {
		return err({
			type: "MetricError",
			message: "Average days open must be positive",
			metricType: "averageDaysOpen",
			value: metrics.averageDaysOpen.value
		});
	}

	if (
		metrics.averageCalvingInterval &&
		metrics.averageCalvingInterval.value < 0
	) {
		return err({
			type: "MetricError",
			message: "Average calving interval must be positive",
			metricType: "averageCalvingInterval",
			value: metrics.averageCalvingInterval.value
		});
	}

	if (metrics.aiPerConception && metrics.aiPerConception.value < 1) {
		return err({
			type: "MetricError",
			message: "AI per conception must be at least 1",
			metricType: "aiPerConception",
			value: metrics.aiPerConception.value
		});
	}

	return ok(true);
}

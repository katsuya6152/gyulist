/**
 * Calculate Breeding Metrics Use Case
 *
 * 繁殖指標計算ユースケース
 */

import type { KpiError } from "../../../domain/errors/kpi/KpiErrors";
import {
	calculateBreedingEventCounts,
	createBreedingMetrics,
	filterKpiEventsByType,
	groupKpiEventsByCattle
} from "../../../domain/functions/kpi";
import type { KpiRepository } from "../../../domain/ports/kpi";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange,
	KpiEvent
} from "../../../domain/types/kpi";
import { createDateRange } from "../../../domain/types/kpi";
import type { UserId } from "../../../shared/brand";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type CalculateBreedingMetricsDeps = {
	kpiRepo: KpiRepository;
	clock: ClockPort;
};

/**
 * 繁殖指標計算コマンドの型
 */
export type CalculateBreedingMetricsInput = {
	ownerUserId: UserId;
	fromDate?: Date;
	toDate?: Date;
};

/**
 * 繁殖指標計算結果の型
 */
export type CalculateBreedingMetricsResult = {
	metrics: BreedingMetrics;
	counts: BreedingEventCounts;
	period: DateRange;
	insights: string[];
	calculationDetails: {
		totalCattle: number;
		dataPoints: number;
		reliability: "high" | "medium" | "low";
	};
};

/**
 * 繁殖指標計算ユースケースの関数型定義
 */
export type CalculateBreedingMetricsUseCase = (
	deps: CalculateBreedingMetricsDeps
) => (
	input: CalculateBreedingMetricsInput
) => Promise<Result<CalculateBreedingMetricsResult, KpiError>>;

/**
 * 繁殖指標計算ユースケース
 *
 * 指定された期間の繁殖データから各種指標を計算し、
 * ビジネス洞察と共に返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const calculateBreedingMetricsUseCase: CalculateBreedingMetricsUseCase =
	(deps: CalculateBreedingMetricsDeps) =>
	async (
		input: CalculateBreedingMetricsInput
	): Promise<Result<CalculateBreedingMetricsResult, KpiError>> => {
		try {
			// 期間の設定（デフォルトは過去1年）
			const toDate = input.toDate || deps.clock.now();
			const fromDate =
				input.fromDate ||
				(() => {
					const date = new Date(toDate);
					date.setFullYear(date.getFullYear() - 1);
					return date;
				})();

			const period = createDateRange(fromDate, toDate);

			// 生イベントデータの取得
			const rawEventsResult = await deps.kpiRepo.findEventsForBreedingKpi(
				input.ownerUserId,
				fromDate,
				toDate
			);
			if (!rawEventsResult.ok) return rawEventsResult;

			const rawEvents = rawEventsResult.value;

			// データ不足チェック
			if (rawEvents.length === 0) {
				return err({
					type: "DataInsufficientError",
					message: "No breeding events found in the specified period",
					requiredData: ["INSEMINATION", "CALVING", "PREGNANCY_CHECK"]
				});
			}

			// KPIイベントに変換（簡略化）
			const kpiEvents: KpiEvent[] = rawEvents.map((raw, index) => ({
				eventId: `kpi-${index}` as import(
					"../../../domain/types/kpi"
				).KpiEventId,
				cattleId: raw.cattleId as import("../../../shared/brand").CattleId,
				eventType: raw.eventType as import(
					"../../../domain/types/kpi"
				).BreedingEventType,
				eventDatetime: new Date(raw.eventDatetime),
				metadata: raw.metadata || {},
				createdAt: new Date(),
				updatedAt: new Date()
			}));

			// 繁殖イベント数の計算
			const counts = calculateBreedingEventCounts(kpiEvents);

			// 繁殖指標の計算
			const metrics = await calculateDetailedBreedingMetrics(kpiEvents, counts);
			if (!metrics.ok) return metrics;

			// 計算詳細の生成
			const cattleGroups = groupKpiEventsByCattle(kpiEvents);
			const calculationDetails = {
				totalCattle: cattleGroups.size,
				dataPoints: kpiEvents.length,
				reliability: evaluateReliability(counts, cattleGroups.size)
			};

			// 洞察の生成
			const insights = generateBreedingInsights(
				metrics.value,
				counts,
				calculationDetails
			);

			return ok({
				metrics: metrics.value,
				counts,
				period,
				insights,
				calculationDetails
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to calculate breeding metrics",
				cause
			});
		}
	};

/**
 * 詳細な繁殖指標の計算
 */
async function calculateDetailedBreedingMetrics(
	events: KpiEvent[],
	counts: BreedingEventCounts
): Promise<Result<BreedingMetrics, KpiError>> {
	// 受胎率の計算
	const conceptionRate =
		counts.inseminations > 0
			? (counts.conceptions / counts.inseminations) * 100
			: null;

	// 平均空胎日数の計算（簡略化）
	const averageDaysOpen =
		counts.pairsForDaysOpen > 0 ? calculateAverageDaysOpen(events) : null;

	// 平均分娩間隔の計算（簡略化）
	const averageCalvingInterval =
		counts.calvings > 1 ? calculateAverageCalvingInterval(events) : null;

	// 受胎あたりの人工授精回数
	const aiPerConception =
		counts.conceptions > 0 ? counts.inseminations / counts.conceptions : null;

	return createBreedingMetrics(
		conceptionRate,
		averageDaysOpen,
		averageCalvingInterval,
		aiPerConception
	);
}

/**
 * 平均空胎日数の計算
 */
function calculateAverageDaysOpen(events: KpiEvent[]): number {
	const cattleGroups = groupKpiEventsByCattle(events);
	let totalDaysOpen = 0;
	let pairCount = 0;

	for (const [, cattleEvents] of cattleGroups) {
		const calvingEvents = cattleEvents.filter((e) => e.eventType === "CALVING");
		const inseminationEvents = cattleEvents.filter(
			(e) => e.eventType === "INSEMINATION"
		);

		for (const calving of calvingEvents) {
			const nextInsemination = inseminationEvents.find(
				(ins) => ins.eventDatetime > calving.eventDatetime
			);
			if (nextInsemination) {
				const daysOpen = Math.floor(
					(nextInsemination.eventDatetime.getTime() -
						calving.eventDatetime.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				totalDaysOpen += daysOpen;
				pairCount++;
			}
		}
	}

	return pairCount > 0 ? totalDaysOpen / pairCount : 0;
}

/**
 * 平均分娩間隔の計算
 */
function calculateAverageCalvingInterval(events: KpiEvent[]): number {
	const cattleGroups = groupKpiEventsByCattle(events);
	let totalInterval = 0;
	let intervalCount = 0;

	for (const [, cattleEvents] of cattleGroups) {
		const calvingEvents = cattleEvents
			.filter((e) => e.eventType === "CALVING")
			.sort((a, b) => a.eventDatetime.getTime() - b.eventDatetime.getTime());

		for (let i = 1; i < calvingEvents.length; i++) {
			const interval = Math.floor(
				(calvingEvents[i].eventDatetime.getTime() -
					calvingEvents[i - 1].eventDatetime.getTime()) /
					(1000 * 60 * 60 * 24)
			);
			totalInterval += interval;
			intervalCount++;
		}
	}

	return intervalCount > 0 ? totalInterval / intervalCount : 0;
}

/**
 * 信頼性の評価
 */
function evaluateReliability(
	counts: BreedingEventCounts,
	totalCattle: number
): "high" | "medium" | "low" {
	// 十分なデータがある場合は高信頼性
	if (counts.totalEvents >= 100 && totalCattle >= 20 && counts.calvings >= 10) {
		return "high";
	}

	// 中程度のデータがある場合は中信頼性
	if (counts.totalEvents >= 30 && totalCattle >= 5 && counts.calvings >= 3) {
		return "medium";
	}

	// それ以外は低信頼性
	return "low";
}

/**
 * 繁殖洞察の生成
 */
function generateBreedingInsights(
	metrics: BreedingMetrics,
	counts: BreedingEventCounts,
	details: { totalCattle: number; dataPoints: number; reliability: string }
): string[] {
	const insights: string[] = [];

	// 受胎率の評価
	if (metrics.conceptionRate) {
		const rate = metrics.conceptionRate.value;
		if (rate >= 80) {
			insights.push("受胎率が優秀です（80%以上）");
		} else if (rate >= 60) {
			insights.push("受胎率が良好です（60%以上）");
		} else if (rate >= 40) {
			insights.push("受胎率が平均的です（40%以上）");
		} else {
			insights.push("受胎率の改善が必要です（40%未満）");
		}
	}

	// 平均空胎日数の評価
	if (metrics.averageDaysOpen) {
		const days = metrics.averageDaysOpen.value;
		if (days <= 85) {
			insights.push("空胎日数が優秀です（85日以下）");
		} else if (days <= 120) {
			insights.push("空胎日数が良好です（120日以下）");
		} else {
			insights.push("空胎日数の短縮が必要です（120日超過）");
		}
	}

	// データ品質の評価
	if (details.reliability === "low") {
		insights.push(
			"データ量が不足しています。より多くのイベント記録をお勧めします"
		);
	}

	if (insights.length === 0) {
		insights.push("十分なデータが蓄積されていません");
	}

	return insights;
}

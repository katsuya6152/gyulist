/**
 * 繁殖指標計算サービス
 *
 * 繁殖関連のKPI指標を計算するドメインサービスです。
 * 既存のサービスからビジネスロジックを抽出し、ドメインモデルを使用するように改善しました。
 */

import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";
import type { BreedingMetrics } from "../model/breedingMetrics";
import { createBreedingMetrics } from "../model/breedingMetrics";
import type { KpiEvent } from "../model/kpiEvent";
import {
	filterKpiEventsByType,
	groupKpiEventsByCattle
} from "../model/kpiEvent";
import type { DateRange } from "../model/types";

/**
 * 繁殖指標計算の依存関係
 */
export type BreedingKpiCalculatorDeps = {
	getEvents: (
		ownerUserId: number,
		fromDate?: Date,
		toDate?: Date
	) => Promise<KpiEvent[]>;
};

/**
 * 繁殖指標計算の入力
 */
export type BreedingKpiCalculationInput = {
	ownerUserId: number;
	fromDate?: Date;
	toDate?: Date;
};

/**
 * 繁殖指標計算の結果
 */
export type BreedingKpiCalculationResult = {
	metrics: BreedingMetrics;
	counts: BreedingEventCounts;
	period: DateRange;
	insights: string[];
};

/**
 * 繁殖イベントのカウント
 */
export type BreedingEventCounts = {
	inseminations: number;
	conceptions: number;
	calvings: number;
	pairsForDaysOpen: number;
	totalEvents: number;
};

/**
 * 繁殖指標計算サービス
 */
export class BreedingKpiCalculator {
	constructor(private deps: BreedingKpiCalculatorDeps) {}

	/**
	 * 繁殖指標を計算
	 */
	async calculateBreedingKpi(
		input: BreedingKpiCalculationInput
	): Promise<Result<BreedingKpiCalculationResult, DomainError>> {
		try {
			// イベントデータを取得
			const events = await this.deps.getEvents(
				input.ownerUserId,
				input.fromDate,
				input.toDate
			);

			if (events.length === 0) {
				return ok({
					metrics: createBreedingMetrics(null, null, null, null),
					counts: {
						inseminations: 0,
						conceptions: 0,
						calvings: 0,
						pairsForDaysOpen: 0,
						totalEvents: 0
					},
					period: this.createDefaultPeriod(input.fromDate, input.toDate),
					insights: ["期間内に繁殖イベントがありません"]
				});
			}

			// 牛別にイベントをグループ化
			const eventsByCattle = groupKpiEventsByCattle(events);

			// 期間を決定
			const period = this.calculatePeriod(events, input.fromDate, input.toDate);

			// 指標を計算
			const metrics = this.calculateMetrics(eventsByCattle, period);
			const counts = this.calculateCounts(events, period);
			const insights = this.generateInsights(metrics, counts);

			return ok({
				metrics,
				counts,
				period,
				insights
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "繁殖指標の計算に失敗しました",
				cause
			});
		}
	}

	/**
	 * 繁殖指標を計算
	 */
	private calculateMetrics(
		eventsByCattle: Map<CattleId, KpiEvent[]>,
		period: DateRange
	): BreedingMetrics {
		let totalInseminationsInPeriod = 0;
		let totalConceptions = 0;
		const daysOpenPairs: number[] = [];
		const calvingIntervals: number[] = [];
		const aiCountsPerConception: number[] = [];

		for (const [, cattleEvents] of eventsByCattle) {
			const inseminations = filterKpiEventsByType(cattleEvents, "INSEMINATION");
			const calvings = filterKpiEventsByType(cattleEvents, "CALVING");

			// 分娩間隔の計算
			for (let i = 1; i < calvings.length; i++) {
				const interval = this.calculateDaysBetween(
					calvings[i - 1].eventDatetime,
					calvings[i].eventDatetime
				);

				if (this.isEventInPeriod(calvings[i], period)) {
					calvingIntervals.push(interval);
				}
			}

			// 期間内の人工授精数をカウント
			const inseminationsInPeriod = inseminations.filter((event) =>
				this.isEventInPeriod(event, period)
			);
			totalInseminationsInPeriod += inseminationsInPeriod.length;

			// 受胎と空胎日数の計算
			for (let i = 0; i < calvings.length; i++) {
				const calving = calvings[i];
				const chosenInsemination = this.findChosenInsemination(
					inseminations,
					calving,
					i > 0 ? calvings[i - 1] : null
				);

				if (chosenInsemination) {
					if (this.isEventInPeriod(calving, period)) {
						totalConceptions += 1;

						// 受胎あたりのAI回数を計算
						const aiTrials = this.calculateAITrials(
							inseminations,
							chosenInsemination,
							i > 0 ? calvings[i - 1] : null
						);
						if (aiTrials > 0) {
							aiCountsPerConception.push(aiTrials);
						}
					}

					// 空胎日数を計算
					if (i > 0) {
						const daysOpen = this.calculateDaysBetween(
							calvings[i - 1].eventDatetime,
							chosenInsemination.eventDatetime
						);

						if (this.isEventInPeriod(chosenInsemination, period)) {
							daysOpenPairs.push(daysOpen);
						}
					}
				}
			}
		}

		// 指標値を計算
		const conceptionRate =
			totalInseminationsInPeriod > 0
				? (totalConceptions / totalInseminationsInPeriod) * 100
				: null;

		const avgDaysOpen =
			daysOpenPairs.length > 0
				? daysOpenPairs.reduce((sum, days) => sum + days, 0) /
					daysOpenPairs.length
				: null;

		const avgCalvingInterval =
			calvingIntervals.length > 0
				? calvingIntervals.reduce((sum, days) => sum + days, 0) /
					calvingIntervals.length
				: null;

		const aiPerConception =
			aiCountsPerConception.length > 0
				? aiCountsPerConception.reduce((sum, count) => sum + count, 0) /
					aiCountsPerConception.length
				: null;

		return createBreedingMetrics(
			conceptionRate,
			avgDaysOpen,
			avgCalvingInterval,
			aiPerConception
		);
	}

	/**
	 * イベント数を計算
	 */
	private calculateCounts(
		events: KpiEvent[],
		period: DateRange
	): BreedingEventCounts {
		const inseminations = filterKpiEventsByType(events, "INSEMINATION").filter(
			(event) => this.isEventInPeriod(event, period)
		);

		const calvings = filterKpiEventsByType(events, "CALVING").filter((event) =>
			this.isEventInPeriod(event, period)
		);

		// 空胎日数計算に使用できるペア数を計算
		const eventsByCattle = groupKpiEventsByCattle(events);
		let pairsForDaysOpen = 0;

		for (const [, cattleEvents] of eventsByCattle) {
			const cattleCalvings = filterKpiEventsByType(cattleEvents, "CALVING");
			const cattleInseminations = filterKpiEventsByType(
				cattleEvents,
				"INSEMINATION"
			);

			if (cattleCalvings.length > 1 && cattleInseminations.length > 0) {
				pairsForDaysOpen += Math.min(
					cattleCalvings.length - 1,
					cattleInseminations.length
				);
			}
		}

		return {
			inseminations: inseminations.length,
			conceptions: this.calculateConceptions(events, period),
			calvings: calvings.length,
			pairsForDaysOpen,
			totalEvents: events.length
		};
	}

	/**
	 * 受胎数を計算
	 */
	private calculateConceptions(events: KpiEvent[], period: DateRange): number {
		const eventsByCattle = groupKpiEventsByCattle(events);
		let conceptions = 0;

		for (const [, cattleEvents] of eventsByCattle) {
			const calvings = filterKpiEventsByType(cattleEvents, "CALVING");
			const inseminations = filterKpiEventsByType(cattleEvents, "INSEMINATION");

			for (let i = 0; i < calvings.length; i++) {
				const calving = calvings[i];
				const chosenInsemination = this.findChosenInsemination(
					inseminations,
					calving,
					i > 0 ? calvings[i - 1] : null
				);

				if (chosenInsemination && this.isEventInPeriod(calving, period)) {
					conceptions += 1;
				}
			}
		}

		return conceptions;
	}

	/**
	 * 選択された人工授精を特定
	 */
	private findChosenInsemination(
		inseminations: KpiEvent[],
		calving: KpiEvent,
		previousCalving: KpiEvent | null
	): KpiEvent | null {
		// 分娩前の人工授精を時系列順にソート
		const validInseminations = inseminations
			.filter((insem) => insem.eventDatetime <= calving.eventDatetime)
			.sort((a, b) => b.eventDatetime.getTime() - a.eventDatetime.getTime());

		for (const insem of validInseminations) {
			const daysToCalving = this.calculateDaysBetween(
				insem.eventDatetime,
				calving.eventDatetime
			);

			// 妊娠期間が260-300日の範囲内かチェック
			if (daysToCalving >= 260 && daysToCalving <= 300) {
				return insem;
			}
		}

		return null;
	}

	/**
	 * 受胎あたりのAI回数を計算
	 */
	private calculateAITrials(
		inseminations: KpiEvent[],
		chosenInsemination: KpiEvent,
		previousCalving: KpiEvent | null
	): number {
		const startDate = previousCalving?.eventDatetime || new Date(0);
		const endDate = chosenInsemination.eventDatetime;

		return inseminations.filter((insem) => {
			const insemDate = insem.eventDatetime;
			return insemDate > startDate && insemDate <= endDate;
		}).length;
	}

	/**
	 * 2つの日付間の日数を計算
	 */
	private calculateDaysBetween(date1: Date, date2: Date): number {
		const timeDiff = Math.abs(date2.getTime() - date1.getTime());
		return Math.ceil(timeDiff / (1000 * 3600 * 24));
	}

	/**
	 * イベントが期間内かチェック
	 */
	private isEventInPeriod(event: KpiEvent, period: DateRange): boolean {
		return (
			event.eventDatetime >= period.from && event.eventDatetime <= period.to
		);
	}

	/**
	 * 期間を計算
	 */
	private calculatePeriod(
		events: KpiEvent[],
		fromDate?: Date,
		toDate?: Date
	): DateRange {
		if (fromDate && toDate) {
			return { from: fromDate, to: toDate };
		}

		if (events.length === 0) {
			return this.createDefaultPeriod(fromDate, toDate);
		}

		const eventDates = events.map((e) => e.eventDatetime);
		const minDate = new Date(Math.min(...eventDates.map((d) => d.getTime())));
		const maxDate = new Date(Math.max(...eventDates.map((d) => d.getTime())));

		return {
			from: fromDate || minDate,
			to: toDate || maxDate
		};
	}

	/**
	 * デフォルト期間を作成
	 */
	private createDefaultPeriod(fromDate?: Date, toDate?: Date): DateRange {
		const now = new Date();
		const oneYearAgo = new Date(
			now.getFullYear() - 1,
			now.getMonth(),
			now.getDate()
		);

		return {
			from: fromDate || oneYearAgo,
			to: toDate || now
		};
	}

	/**
	 * 洞察を生成
	 */
	private generateInsights(
		metrics: BreedingMetrics,
		counts: BreedingEventCounts
	): string[] {
		const insights: string[] = [];

		if (counts.totalEvents === 0) {
			insights.push("期間内に繁殖イベントがありません");
			return insights;
		}

		if (metrics.conceptionRate) {
			if (metrics.conceptionRate.value >= 60) {
				insights.push("受胎率が良好です（60%以上）");
			} else if (metrics.conceptionRate.value >= 40) {
				insights.push("受胎率は標準レベルです");
			} else {
				insights.push("受胎率の改善が必要です（40%未満）");
			}
		}

		if (metrics.averageDaysOpen) {
			if (metrics.averageDaysOpen.value <= 90) {
				insights.push("空胎日数が適切に管理されています（90日以下）");
			} else if (metrics.averageDaysOpen.value <= 120) {
				insights.push("空胎日数は許容範囲内です");
			} else {
				insights.push("空胎日数の短縮が必要です（120日超過）");
			}
		}

		if (metrics.aiPerConception) {
			if (metrics.aiPerConception.value <= 1.5) {
				insights.push("人工授精の効率が良好です（1.5回以下）");
			} else if (metrics.aiPerConception.value <= 2.0) {
				insights.push("人工授精の効率は標準レベルです");
			} else {
				insights.push("人工授精の効率改善が必要です（2.0回超過）");
			}
		}

		if (insights.length === 0) {
			insights.push("指標データが不足しているため、詳細な分析ができません");
		}

		return insights;
	}
}

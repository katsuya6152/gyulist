/**
 * KPI Repository Implementation
 * Implements the KpiRepository port using Drizzle ORM
 */

import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { events, cattle } from "../../../db/schema";
import type { KpiError } from "../../../domain/errors/kpi/KpiErrors";
import type { KpiRepository, RawKpiEvent } from "../../../domain/ports/kpi";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange,
	KpiEvent,
	KpiEventSearchCriteria,
	MonthPeriod,
	TrendAnalysisResult,
	TrendAnalysisSearchCriteria
} from "../../../domain/types/kpi";
import type { UserId } from "../../../shared/brand";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import { mapRawEventToKpiEvent } from "../mappers/kpiDbMapper";

// ============================================================================
// Repository Implementation
// ============================================================================

/**
 * Drizzle ORMを使用したKPIリポジトリの実装
 */
export class KpiRepositoryImpl implements KpiRepository {
	private readonly db: ReturnType<typeof import("drizzle-orm/d1").drizzle>;

	constructor(dbInstance: D1DatabasePort) {
		this.db = dbInstance.getDrizzle();
	}

	async findEventsForBreedingKpi(
		ownerUserId: UserId,
		fromDate?: Date,
		toDate?: Date
	): Promise<Result<RawKpiEvent[], KpiError>> {
		try {
			// 受胎判定と分娩間隔算出のため、期間前後も広めに取得
			const windowFrom = fromDate
				? fromDate.toISOString()
				: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
			const windowTo = toDate ? toDate.toISOString() : new Date().toISOString();

			const rows = await this.db
				.select({
					cattleId: events.cattleId,
					eventType: events.eventType,
					eventDatetime: events.eventDatetime
				})
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(
					and(
						eq(cattle.ownerUserId, ownerUserId),
						gte(events.eventDatetime, windowFrom),
						lte(events.eventDatetime, windowTo),
						inArray(events.eventType, ["INSEMINATION", "CALVING"])
					)
				)
				.orderBy(events.cattleId, events.eventDatetime);
			return ok(rows);
		} catch (error) {
			return err({
				type: "InfraError" as const,
				message: "Failed to find events for breeding KPI",
				cause: error
			});
		}
	}

	async searchKpiEvents(
		criteria: KpiEventSearchCriteria
	): Promise<Result<KpiEvent[], KpiError>> {
		// 簡易実装 - 実際の実装は複雑なクエリが必要
		return err({
			type: "InfraError" as const,
			message: "searchKpiEvents not implemented yet"
		});
	}

	async calculateBreedingMetrics(
		ownerUserId: UserId,
		period: DateRange
	): Promise<Result<BreedingMetrics, KpiError>> {
		try {
			// 期間内のイベントを取得
			const eventsResult = await this.findEventsForBreedingKpi(
				ownerUserId,
				period.from,
				period.to
			);
			if (!eventsResult.ok) {
				return eventsResult;
			}

			const events = eventsResult.value;

			// データが不足している場合はデフォルト値を返す
			if (events.length === 0) {
				return ok({
					conceptionRate: null,
					avgDaysOpen: null,
					avgCalvingInterval: null,
					aiPerConception: null
				});
			}

			// 牛ごとにイベントをグループ化
			const cattleGroups = new Map<
				number,
				Array<{ type: string; datetime: Date }>
			>();

			for (const event of events) {
				if (!cattleGroups.has(event.cattleId)) {
					cattleGroups.set(event.cattleId, []);
				}
				const group = cattleGroups.get(event.cattleId);
				if (group) {
					group.push({
						type: event.eventType,
						datetime: new Date(event.eventDatetime)
					});
				}
			}

			// 基本統計
			const inseminations = events.filter(
				(e) => e.eventType === "INSEMINATION"
			).length;
			const calvings = events.filter((e) => e.eventType === "CALVING").length;

			// 受胎率の計算
			let conceptionRate = null;
			if (inseminations > 0) {
				const rawRate = (calvings / inseminations) * 100;
				conceptionRate = Math.min(rawRate, 100);
			}

			// 平均空胎日数の計算
			let avgDaysOpen = null;
			const daysOpenValues: number[] = [];

			for (const [, cattleEvents] of cattleGroups) {
				// 時系列順にソート
				cattleEvents.sort(
					(a, b) => a.datetime.getTime() - b.datetime.getTime()
				);

				for (let i = 0; i < cattleEvents.length - 1; i++) {
					const current = cattleEvents[i];
					const next = cattleEvents[i + 1];

					if (current.type === "CALVING" && next.type === "INSEMINATION") {
						const daysDiff = Math.floor(
							(next.datetime.getTime() - current.datetime.getTime()) /
								(1000 * 60 * 60 * 24)
						);
						if (daysDiff > 0 && daysDiff < 365) {
							// 妥当な範囲内
							daysOpenValues.push(daysDiff);
						}
					}
				}
			}

			if (daysOpenValues.length > 0) {
				avgDaysOpen = Math.round(
					daysOpenValues.reduce((sum, days) => sum + days, 0) /
						daysOpenValues.length
				);
			}

			// 平均分娩間隔の計算
			let avgCalvingInterval = null;
			const calvingIntervals: number[] = [];

			for (const [, cattleEvents] of cattleGroups) {
				const calvingEvents = cattleEvents.filter((e) => e.type === "CALVING");
				calvingEvents.sort(
					(a, b) => a.datetime.getTime() - b.datetime.getTime()
				);

				for (let i = 0; i < calvingEvents.length - 1; i++) {
					const current = calvingEvents[i];
					const next = calvingEvents[i + 1];
					const daysDiff = Math.floor(
						(next.datetime.getTime() - current.datetime.getTime()) /
							(1000 * 60 * 60 * 24)
					);
					if (daysDiff > 200 && daysDiff < 500) {
						// 妥当な分娩間隔
						calvingIntervals.push(daysDiff);
					}
				}
			}

			if (calvingIntervals.length > 0) {
				avgCalvingInterval = Math.round(
					calvingIntervals.reduce((sum, days) => sum + days, 0) /
						calvingIntervals.length
				);
			}

			// 受胎あたりのAI回数の計算
			let aiPerConception = null;
			const aiPerConceptionValues: number[] = [];

			for (const [, cattleEvents] of cattleGroups) {
				cattleEvents.sort(
					(a, b) => a.datetime.getTime() - b.datetime.getTime()
				);

				let aiCount = 0;
				for (let i = 0; i < cattleEvents.length; i++) {
					const event = cattleEvents[i];

					if (event.type === "INSEMINATION") {
						aiCount++;
					} else if (event.type === "CALVING") {
						if (aiCount > 0) {
							aiPerConceptionValues.push(aiCount);
							aiCount = 0; // リセット
						}
					}
				}
			}

			if (aiPerConceptionValues.length > 0) {
				aiPerConception =
					Math.round(
						(aiPerConceptionValues.reduce((sum, count) => sum + count, 0) /
							aiPerConceptionValues.length) *
							10
					) / 10;
			}

			return ok({
				conceptionRate,
				avgDaysOpen,
				avgCalvingInterval,
				aiPerConception
			});
		} catch (error) {
			return err({
				type: "InfraError" as const,
				message: "Failed to calculate breeding metrics",
				cause: error
			});
		}
	}

	async getBreedingEventCounts(
		ownerUserId: UserId,
		period: DateRange
	): Promise<Result<BreedingEventCounts, KpiError>> {
		try {
			// 期間内のイベントを取得
			const eventsResult = await this.findEventsForBreedingKpi(
				ownerUserId,
				period.from,
				period.to
			);
			if (!eventsResult.ok) {
				return eventsResult;
			}

			const events = eventsResult.value;

			// 簡易的な計算を直接実装
			const inseminations = events.filter(
				(e) => e.eventType === "INSEMINATION"
			).length;
			const calvings = events.filter((e) => e.eventType === "CALVING").length;
			const conceptions = calvings; // 簡略化：分娩数を受胎数とする

			// 空胎日数計算対象ペア数（分娩-次回授精のペア）
			const cattleGroups = new Map<
				number,
				Array<{ type: string; datetime: Date }>
			>();

			for (const event of events) {
				if (!cattleGroups.has(event.cattleId)) {
					cattleGroups.set(event.cattleId, []);
				}
				const group = cattleGroups.get(event.cattleId);
				if (group) {
					group.push({
						type: event.eventType,
						datetime: new Date(event.eventDatetime)
					});
				}
			}

			let pairsForDaysOpen = 0;
			for (const [, cattleEvents] of cattleGroups) {
				const calvingEvents = cattleEvents.filter((e) => e.type === "CALVING");
				const inseminationEvents = cattleEvents.filter(
					(e) => e.type === "INSEMINATION"
				);

				// 各分娩に対して、その後の最初の授精までのペアをカウント
				for (const calving of calvingEvents) {
					const nextInsemination = inseminationEvents.find(
						(ins) => ins.datetime > calving.datetime
					);
					if (nextInsemination) {
						pairsForDaysOpen++;
					}
				}
			}

			return ok({
				inseminations,
				conceptions,
				calvings,
				pairsForDaysOpen,
				totalEvents: events.length
			});
		} catch (error) {
			return err({
				type: "InfraError" as const,
				message: "Failed to get breeding event counts",
				cause: error
			});
		}
	}

	async calculateMonthlyBreedingPerformance(
		ownerUserId: UserId,
		period: MonthPeriod
	): Promise<
		Result<
			{
				metrics: BreedingMetrics;
				counts: BreedingEventCounts;
				period: MonthPeriod;
			},
			KpiError
		>
	> {
		// 既存のファクトリー関数を使用
		const { createBreedingMetrics, calculateBreedingEventCounts } =
			await import("../../../domain/functions/kpi/breedingMetricsCalculator");

		const metrics = createBreedingMetrics(null, null, null, null);
		if (!metrics.ok) return metrics;

		// 空のイベント配列でカウントを計算
		const counts = calculateBreedingEventCounts([]);

		return ok({
			metrics: metrics.value,
			counts,
			period
		});
	}

	async calculateYearlyBreedingPerformance(
		ownerUserId: UserId,
		year: number
	): Promise<
		Result<
			{
				metrics: BreedingMetrics;
				counts: BreedingEventCounts;
				monthlyBreakdown: Array<{
					period: MonthPeriod;
					metrics: BreedingMetrics;
					counts: BreedingEventCounts;
				}>;
			},
			KpiError
		>
	> {
		// 既存のファクトリー関数を使用
		const { createBreedingMetrics, calculateBreedingEventCounts } =
			await import("../../../domain/functions/kpi/breedingMetricsCalculator");

		const metrics = createBreedingMetrics(null, null, null, null);
		if (!metrics.ok) return metrics;

		// 空のイベント配列でカウントを計算
		const counts = calculateBreedingEventCounts([]);

		return ok({
			metrics: metrics.value,
			counts,
			monthlyBreakdown: []
		});
	}

	async getBenchmarkComparison(
		ownerUserId: UserId,
		period: DateRange
	): Promise<
		Result<
			{
				userMetrics: BreedingMetrics;
				industryBenchmarksJapan: BreedingMetrics;
				performanceRating: "excellent" | "good" | "average" | "poor";
				improvementAreas: string[];
			},
			KpiError
		>
	> {
		// 既存のファクトリー関数を使用
		const { createBreedingMetrics } = await import(
			"../../../domain/functions/kpi/breedingMetricsCalculator"
		);

		const userMetrics = createBreedingMetrics(null, null, null, null);
		if (!userMetrics.ok) return userMetrics;

		const industryBenchmarksJapan = createBreedingMetrics(
			null,
			null,
			null,
			null
		);
		if (!industryBenchmarksJapan.ok) return industryBenchmarksJapan;

		return ok({
			userMetrics: userMetrics.value,
			industryBenchmarksJapan: industryBenchmarksJapan.value,
			performanceRating: "average" as const,
			improvementAreas: []
		});
	}
}

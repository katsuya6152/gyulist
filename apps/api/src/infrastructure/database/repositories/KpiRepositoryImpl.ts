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

			// 簡易的な計算（実際の実装ではより複雑な計算が必要）
			const inseminations = events.filter(
				(e) => e.eventType === "INSEMINATION"
			).length;
			const calvings = events.filter((e) => e.eventType === "CALVING").length;

			// 受胎率（分娩数 / 授精数）- 100%を超えないように制限
			let conceptionRate = null;
			if (inseminations > 0) {
				const rawRate = (calvings / inseminations) * 100;
				// 100%を超える場合は100%に制限
				conceptionRate = Math.min(rawRate, 100);
			}

			// OpenAPI準拠の形式で返す
			return ok({
				conceptionRate,
				avgDaysOpen: null,
				avgCalvingInterval: null,
				aiPerConception: null
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

			// 既存のファクトリー関数を使用して正しい型を作成
			const { calculateBreedingEventCounts } = await import(
				"../../../domain/functions/kpi/breedingMetricsCalculator"
			);
			const result = calculateBreedingEventCounts(
				events as unknown as import("../../../domain/types/kpi").KpiEvent[]
			);
			return ok(result);
		} catch (error) {
			return err({
				type: "InfraError" as const,
				message: "Failed to get breeding event counts",
				cause: error
			});
		}
	}

	async getBreedingKpiTrends(
		ownerUserId: UserId,
		params: {
			toMonth?: string;
			months?: number;
			fromMonth?: string;
		}
	): Promise<
		Result<
			{
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
			},
			KpiError
		>
	> {
		// 簡易実装 - 実際の実装は複雑なトレンド計算が必要
		return ok({
			series: [],
			deltas: []
		});
	}

	async analyzeBreedingTrends(
		criteria: TrendAnalysisSearchCriteria
	): Promise<Result<TrendAnalysisResult, KpiError>> {
		// 簡易実装
		return err({
			type: "InfraError" as const,
			message: "analyzeBreedingTrends not implemented yet"
		});
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

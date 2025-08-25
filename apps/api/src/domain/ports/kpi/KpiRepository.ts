/**
 * KPI Repository Port
 *
 * KPI管理ドメインのリポジトリインターフェース定義
 */

import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { KpiError } from "../../errors/kpi/KpiErrors";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange,
	KpiEvent,
	KpiEventSearchCriteria,
	MonthPeriod,
	TrendAnalysisResult,
	TrendAnalysisSearchCriteria
} from "../../types/kpi";

/**
 * 生イベントデータ
 * データベースから取得される生のイベントデータ
 */
export type RawKpiEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string; // ISO8601
	metadata?: Record<string, unknown>;
};

/**
 * KPIエンティティのリポジトリポート
 *
 * KPI計算、トレンド分析、統計データの取得などの操作を提供します。
 * 実装はインフラ層（DB等）に委譲されます。
 */
export interface KpiRepository {
	// Basic KPI Event operations
	/**
	 * 繁殖KPI計算用のイベントデータを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param fromDate - 開始日時（オプション）
	 * @param toDate - 終了日時（オプション）
	 * @returns イベントデータ一覧
	 */
	findEventsForBreedingKpi(
		ownerUserId: UserId,
		fromDate?: Date,
		toDate?: Date
	): Promise<Result<RawKpiEvent[], KpiError>>;

	/**
	 * KPIイベントを検索します。
	 * @param criteria - 検索条件
	 * @returns KPIイベント一覧
	 */
	searchKpiEvents(
		criteria: KpiEventSearchCriteria
	): Promise<Result<KpiEvent[], KpiError>>;

	// Breeding Metrics operations
	/**
	 * 指定期間の繁殖指標を計算します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param period - 計算期間
	 * @returns 繁殖指標
	 */
	calculateBreedingMetrics(
		ownerUserId: UserId,
		period: DateRange
	): Promise<Result<BreedingMetrics, KpiError>>;

	/**
	 * 指定期間の繁殖イベント数を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param period - 計算期間
	 * @returns 繁殖イベント数
	 */
	getBreedingEventCounts(
		ownerUserId: UserId,
		period: DateRange
	): Promise<Result<BreedingEventCounts, KpiError>>;

	// Performance and Comparison operations
	/**
	 * 月次繁殖パフォーマンスを計算します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param period - 月次期間
	 * @returns 月次パフォーマンス指標
	 */
	calculateMonthlyBreedingPerformance(
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
	>;

	/**
	 * 年次繁殖パフォーマンスを計算します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param year - 年
	 * @returns 年次パフォーマンス指標
	 */
	calculateYearlyBreedingPerformance(
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
	>;

	/**
	 * ベンチマーク比較データを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param period - 比較期間
	 * @returns ベンチマーク比較結果
	 */
	getBenchmarkComparison(
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
	>;
}

/**
 * Get Breeding KPI Use Case
 *
 * 繁殖KPI取得ユースケース
 */

import type { KpiError } from "../../../domain/errors/kpi/KpiErrors";
import type { KpiRepository } from "../../../domain/ports/kpi";
import type {
	BreedingEventCounts,
	BreedingMetrics,
	DateRange
} from "../../../domain/types/kpi";
import { createDateRange } from "../../../domain/types/kpi";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetBreedingKpiDeps = {
	kpiRepo: KpiRepository;
};

/**
 * 繁殖KPI取得コマンドの型
 */
export type GetBreedingKpiInput = {
	ownerUserId: UserId;
	fromDate?: Date;
	toDate?: Date;
};

/**
 * 繁殖KPI取得結果の型（OpenAPI準拠）
 */
export type GetBreedingKpiResult = {
	metrics: BreedingMetrics;
	counts: Record<string, number>;
	period: {
		from: string;
		to: string;
	};
	summary: {
		totalEvents: number;
		dataQuality: "high" | "medium" | "low";
		calculatedAt: string;
	};
};

/**
 * 繁殖KPI取得ユースケースの関数型定義
 */
export type GetBreedingKpiUseCase = (
	deps: GetBreedingKpiDeps
) => (
	input: GetBreedingKpiInput
) => Promise<Result<GetBreedingKpiResult, KpiError>>;

/**
 * 繁殖KPI取得ユースケース
 *
 * 指定された期間の繁殖指標を計算し、統計情報と共に返します。
 * 受胎率、平均空胎日数、平均分娩間隔、受胎あたりの授精回数を算出します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const getBreedingKpiUseCase: GetBreedingKpiUseCase =
	(deps: GetBreedingKpiDeps) =>
	async (
		input: GetBreedingKpiInput
	): Promise<Result<GetBreedingKpiResult, KpiError>> => {
		try {
			// 期間の設定（デフォルトは過去1年）
			const toDate = input.toDate || new Date();
			const fromDate =
				input.fromDate ||
				(() => {
					const date = new Date(toDate);
					date.setFullYear(date.getFullYear() - 1);
					return date;
				})();

			const period = createDateRange(fromDate, toDate);

			// 繁殖指標の計算
			const metricsResult = await deps.kpiRepo.calculateBreedingMetrics(
				input.ownerUserId,
				period
			);
			if (!metricsResult.ok) return metricsResult;

			// 繁殖イベント数の取得
			const countsResult = await deps.kpiRepo.getBreedingEventCounts(
				input.ownerUserId,
				period
			);
			if (!countsResult.ok) return countsResult;

			const metrics = metricsResult.value;
			const counts = countsResult.value;

			// データ品質の評価
			const dataQuality = evaluateDataQuality(counts);

			return ok({
				metrics,
				counts: {
					inseminations: counts.inseminations,
					conceptions: counts.conceptions,
					calvings: counts.calvings,
					totalEvents: counts.totalEvents
				},
				period: {
					from: period.from.toISOString(),
					to: period.to.toISOString()
				},
				summary: {
					totalEvents: counts.totalEvents,
					dataQuality,
					calculatedAt: new Date().toISOString()
				}
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to get breeding KPI",
				cause
			});
		}
	};

/**
 * データ品質の評価
 *
 * @param counts - イベント数
 * @returns データ品質レベル
 */
function evaluateDataQuality(
	counts: BreedingEventCounts
): "high" | "medium" | "low" {
	// 十分なデータがある場合は高品質
	if (
		counts.totalEvents >= 50 &&
		counts.inseminations >= 10 &&
		counts.calvings >= 5
	) {
		return "high";
	}

	// 中程度のデータがある場合は中品質
	if (counts.totalEvents >= 20 && counts.inseminations >= 5) {
		return "medium";
	}

	// それ以外は低品質
	return "low";
}

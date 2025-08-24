/**
 * Get Breeding Trends Use Case
 *
 * 繁殖トレンド取得ユースケース
 */

import type { KpiError } from "../../../domain/errors/kpi/KpiErrors";
import type { KpiRepository } from "../../../domain/ports/kpi";
import type {
	MonthPeriod,
	TrendAnalysisResult,
	TrendAnalysisSearchCriteria
} from "../../../domain/types/kpi";
import { createMonthPeriod, parseMonthPeriod } from "../../../domain/types/kpi";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetBreedingTrendsDeps = {
	kpiRepo: KpiRepository;
};

/**
 * 繁殖トレンド取得コマンドの型
 */
export type GetBreedingTrendsInput = {
	ownerUserId: UserId;
	toMonth?: string; // YYYY-MM形式
	months?: number;
	fromMonth?: string; // YYYY-MM形式
};

/**
 * 繁殖トレンド取得ユースケースの関数型定義
 */
export type GetBreedingTrendsUseCase = (
	deps: GetBreedingTrendsDeps
) => (
	input: GetBreedingTrendsInput
) => Promise<Result<TrendAnalysisResult, KpiError>>;

/**
 * 繁殖トレンド取得ユースケース
 *
 * 指定された期間の繁殖トレンドを分析し、時系列変化と洞察を提供します。
 * 月次データの比較、改善・悪化傾向の分析、推奨事項の生成を行います。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const getBreedingTrendsUseCase: GetBreedingTrendsUseCase =
	(deps: GetBreedingTrendsDeps) =>
	async (
		input: GetBreedingTrendsInput
	): Promise<Result<TrendAnalysisResult, KpiError>> => {
		try {
			// 期間パラメータの正規化
			const params = normalizeParams(input);
			if (!params.ok) return params;

			// トレンド分析の実行
			const analysisResult = await deps.kpiRepo.analyzeBreedingTrends({
				ownerUserId: input.ownerUserId,
				startPeriod: params.value.startPeriod,
				endPeriod: params.value.endPeriod,
				minDataPoints: 3
			});

			return analysisResult;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to get breeding trends",
				cause
			});
		}
	};

/**
 * パラメータの正規化
 *
 * @param input - 入力パラメータ
 * @returns 正規化されたパラメータ
 */
function normalizeParams(input: GetBreedingTrendsInput): Result<
	{
		startPeriod: MonthPeriod;
		endPeriod: MonthPeriod;
	},
	KpiError
> {
	try {
		let endPeriod: MonthPeriod;
		let startPeriod: MonthPeriod;

		// 終了月の設定
		if (input.toMonth) {
			endPeriod = parseMonthPeriod(input.toMonth);
		} else {
			const now = new Date();
			endPeriod = createMonthPeriod(now.getFullYear(), now.getMonth() + 1);
		}

		// 開始月の設定
		if (input.fromMonth) {
			startPeriod = parseMonthPeriod(input.fromMonth);
		} else {
			const months = input.months || 12; // デフォルト12ヶ月
			const startDate = new Date(
				endPeriod.year,
				endPeriod.month - 1 - months,
				1
			);
			startPeriod = createMonthPeriod(
				startDate.getFullYear(),
				startDate.getMonth() + 1
			);
		}

		// 期間の妥当性チェック
		if (
			startPeriod.year > endPeriod.year ||
			(startPeriod.year === endPeriod.year &&
				startPeriod.month > endPeriod.month)
		) {
			return err({
				type: "PeriodError",
				message: "Start period must be before or equal to end period",
				invalidPeriod: `${startPeriod.year}-${startPeriod.month} to ${endPeriod.year}-${endPeriod.month}`
			});
		}

		return ok({ startPeriod, endPeriod });
	} catch (cause) {
		return err({
			type: "ValidationError",
			message: "Invalid period format",
			field: "period"
		});
	}
}

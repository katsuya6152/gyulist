/**
 * Get Breeding KPI Delta Use Case
 *
 * 繁殖KPIの変化量（デルタ）を取得するユースケース
 */

import type { KpiError } from "../../../domain/errors/kpi/KpiErrors";
import type { KpiRepository } from "../../../domain/ports/kpi";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetBreedingKpiDeltaDeps = {
	kpiRepo: KpiRepository;
};

/**
 * 取得コマンドの型
 */
export type GetBreedingKpiDeltaInput = {
	ownerUserId: UserId;
	fromDate?: Date;
	toDate?: Date;
};

/**
 * 繁殖KPIデルタの型
 */
export type BreedingKpiDelta = {
	metrics: {
		conceptionRateDelta: number | null;
		avgDaysOpenDelta: number | null;
		avgCalvingIntervalDelta: number | null;
		aiPerConceptionDelta: number | null;
	};
	period: {
		from: string;
		to: string;
		previousFrom: string;
		previousTo: string;
	};
	summary: {
		improvement: "positive" | "negative" | "neutral";
		keyChanges: string[];
		calculatedAt: string;
	};
};

/**
 * 繁殖KPIデルタ取得ユースケースの関数型定義
 */
export type GetBreedingKpiDeltaUseCase = (
	deps: GetBreedingKpiDeltaDeps
) => (
	input: GetBreedingKpiDeltaInput
) => Promise<Result<BreedingKpiDelta, KpiError>>;

/**
 * 繁殖KPIの変化量（デルタ）を取得するユースケース
 *
 * 指定された期間の繁殖KPIと前回期間のKPIを比較し、変化量を計算します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は繁殖KPIデルタ、失敗時は `KpiError` を含む `Result`
 */
export const getBreedingKpiDeltaUseCase: GetBreedingKpiDeltaUseCase =
	(deps) =>
	async (input): Promise<Result<BreedingKpiDelta, KpiError>> => {
		try {
			const toDate = input.toDate || new Date();
			const fromDate =
				input.fromDate ||
				new Date(toDate.getTime() - 365 * 24 * 60 * 60 * 1000);

			// 前回期間を計算（同じ期間の前回）
			const periodLength = toDate.getTime() - fromDate.getTime();
			const previousToDate = new Date(fromDate.getTime());
			const previousFromDate = new Date(fromDate.getTime() - periodLength);

			// 現在期間のKPIを取得
			const currentKpiResult = await deps.kpiRepo.calculateBreedingMetrics(
				input.ownerUserId,
				{ from: fromDate, to: toDate }
			);

			if (!currentKpiResult.ok) {
				return currentKpiResult;
			}

			// 前回期間のKPIを取得
			const previousKpiResult = await deps.kpiRepo.calculateBreedingMetrics(
				input.ownerUserId,
				{ from: previousFromDate, to: previousToDate }
			);

			if (!previousKpiResult.ok) {
				return previousKpiResult;
			}

			const currentKpi = currentKpiResult.value;
			const previousKpi = previousKpiResult.value;

			// デルタを計算
			const metrics = {
				conceptionRateDelta: calculateDelta(
					currentKpi.conceptionRate?.value || null,
					previousKpi.conceptionRate?.value || null
				),
				avgDaysOpenDelta: calculateDelta(
					currentKpi.averageDaysOpen?.value || null,
					previousKpi.averageDaysOpen?.value || null
				),
				avgCalvingIntervalDelta: calculateDelta(
					currentKpi.averageCalvingInterval?.value || null,
					previousKpi.averageCalvingInterval?.value || null
				),
				aiPerConceptionDelta: calculateDelta(
					currentKpi.aiPerConception?.value || null,
					previousKpi.aiPerConception?.value || null
				)
			};

			// 改善状況を判定
			const improvement = determineImprovement(metrics);
			const keyChanges = identifyKeyChanges(metrics);

			const delta: BreedingKpiDelta = {
				metrics,
				period: {
					from: fromDate.toISOString(),
					to: toDate.toISOString(),
					previousFrom: previousFromDate.toISOString(),
					previousTo: previousToDate.toISOString()
				},
				summary: {
					improvement,
					keyChanges,
					calculatedAt: new Date().toISOString()
				}
			};

			return ok(delta);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to get breeding KPI delta",
				cause: error
			});
		}
	};

/**
 * デルタ値を計算するヘルパー関数
 */
function calculateDelta(
	current: number | null,
	previous: number | null
): number | null {
	if (current === null || previous === null) return null;
	return current - previous;
}

/**
 * 改善状況を判定するヘルパー関数
 */
function determineImprovement(
	metrics: BreedingKpiDelta["metrics"]
): "positive" | "negative" | "neutral" {
	let positiveCount = 0;
	let negativeCount = 0;

	// 受胎率は高いほど良い
	if (metrics.conceptionRateDelta !== null) {
		if (metrics.conceptionRateDelta > 0) positiveCount++;
		else if (metrics.conceptionRateDelta < 0) negativeCount++;
	}

	// 空胎日数は短いほど良い
	if (metrics.avgDaysOpenDelta !== null) {
		if (metrics.avgDaysOpenDelta < 0) positiveCount++;
		else if (metrics.avgDaysOpenDelta > 0) negativeCount++;
	}

	// 分娩間隔は適切な範囲が良い（簡易判定）
	if (metrics.avgCalvingIntervalDelta !== null) {
		if (Math.abs(metrics.avgCalvingIntervalDelta) < 30) positiveCount++;
		else if (Math.abs(metrics.avgCalvingIntervalDelta) > 60) negativeCount++;
	}

	// AI回数は少ないほど良い
	if (metrics.aiPerConceptionDelta !== null) {
		if (metrics.aiPerConceptionDelta < 0) positiveCount++;
		else if (metrics.aiPerConceptionDelta > 0) negativeCount++;
	}

	if (positiveCount > negativeCount) return "positive";
	if (negativeCount > positiveCount) return "negative";
	return "neutral";
}

/**
 * 主要な変化を特定するヘルパー関数
 */
function identifyKeyChanges(metrics: BreedingKpiDelta["metrics"]): string[] {
	const changes: string[] = [];

	if (
		metrics.conceptionRateDelta !== null &&
		Math.abs(metrics.conceptionRateDelta) > 5
	) {
		changes.push(
			`受胎率が${metrics.conceptionRateDelta > 0 ? "向上" : "低下"}しました (${Math.abs(metrics.conceptionRateDelta).toFixed(1)}%)`
		);
	}

	if (
		metrics.avgDaysOpenDelta !== null &&
		Math.abs(metrics.avgDaysOpenDelta) > 10
	) {
		changes.push(
			`平均空胎日数が${metrics.avgDaysOpenDelta < 0 ? "短縮" : "延長"}しました (${Math.abs(metrics.avgDaysOpenDelta).toFixed(1)}日)`
		);
	}

	if (
		metrics.aiPerConceptionDelta !== null &&
		Math.abs(metrics.aiPerConceptionDelta) > 0.5
	) {
		changes.push(
			`受胎1回あたりのAI回数が${metrics.aiPerConceptionDelta < 0 ? "減少" : "増加"}しました (${Math.abs(metrics.aiPerConceptionDelta).toFixed(1)}回)`
		);
	}

	return changes;
}

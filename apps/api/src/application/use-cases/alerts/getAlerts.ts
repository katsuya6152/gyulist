/**
 * Get Alerts Use Case
 *
 * アラートの取得・一覧ユースケース
 */

import type { AlertError } from "../../../domain/errors/alerts/AlertErrors";
import { AlertRules } from "../../../domain/functions/alerts";
import type { AlertRepository } from "../../../domain/ports/alerts";
import type { Alert, AlertStats } from "../../../domain/types/alerts";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetAlertsDeps = {
	alertRepo: AlertRepository;
};

/**
 * アラート取得コマンドの型
 */
export type GetAlertsInput = {
	ownerUserId: UserId;
	limit?: number;
};

/**
 * アラート取得結果の型
 */
export type GetAlertsResult = {
	results: Alert[];
	total: number;
	summary: {
		high: number;
		medium: number;
		low: number;
		urgent: number;
		active: number;
		resolved: number;
		overdue: number;
		dueSoon: number;
	};
};

/**
 * アラート取得ユースケースの関数型定義
 */
export type GetAlertsUseCase = (
	deps: GetAlertsDeps
) => (input: GetAlertsInput) => Promise<Result<GetAlertsResult, AlertError>>;

/**
 * アラートの取得・一覧ユースケース
 *
 * 指定されたユーザーのアラート一覧を取得し、統計情報と共に返します。
 * アクティブなアラートの優先表示や重要度別の集計を行います。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const getAlertsUseCase: GetAlertsUseCase =
	(deps: GetAlertsDeps) =>
	async (
		input: GetAlertsInput
	): Promise<Result<GetAlertsResult, AlertError>> => {
		try {
			// アクティブなアラートを取得
			const activeAlertsResult = await deps.alertRepo.findActiveAlerts(
				input.ownerUserId,
				input.limit
			);

			if (!activeAlertsResult.ok) return activeAlertsResult;

			const alerts = activeAlertsResult.value;

			// 統計情報の計算
			const summary = {
				high: alerts.filter((alert) => alert.severity === "high").length,
				medium: alerts.filter((alert) => alert.severity === "medium").length,
				low: alerts.filter((alert) => alert.severity === "low").length,
				urgent: alerts.filter((alert) => AlertRules.isAlertUrgent(alert))
					.length,
				active: alerts.filter((alert) => AlertRules.isAlertActive(alert))
					.length,
				resolved: alerts.filter((alert) => AlertRules.isAlertResolved(alert))
					.length,
				overdue: alerts.filter((alert) => AlertRules.isAlertOverdue(alert))
					.length,
				dueSoon: alerts.filter((alert) => AlertRules.isAlertDueSoon(alert))
					.length
			};

			return ok({
				results: alerts,
				total: alerts.length,
				summary
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to get alerts",
				cause
			});
		}
	};

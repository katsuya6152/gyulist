/**
 * Update Alert Status Use Case
 *
 * アラートステータス更新ユースケース
 */

import type { AlertError } from "../../../domain/errors/alerts/AlertErrors";
import { updateAlertStatus } from "../../../domain/functions/alerts";
import type { AlertRepository } from "../../../domain/ports/alerts";
import type { Alert, AlertStatus } from "../../../domain/types/alerts";
import type { AlertId, UserId } from "../../../shared/brand";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type UpdateAlertStatusDeps = {
	alertRepo: AlertRepository;
	clock: ClockPort;
};

/**
 * ステータス更新コマンドの型
 */
export type UpdateAlertStatusInput = {
	alertId: AlertId;
	newStatus: AlertStatus;
	requestingUserId: UserId;
};

/**
 * アラートステータス更新ユースケースの関数型定義
 */
export type UpdateAlertStatusUseCase = (
	deps: UpdateAlertStatusDeps
) => (input: UpdateAlertStatusInput) => Promise<Result<Alert, AlertError>>;

/**
 * アラートステータス更新ユースケース
 *
 * アラートのステータスを更新し、必要に応じて確認日時や解決日時を設定します。
 * 権限チェックとステータス遷移の妥当性検証を行います。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const updateAlertStatusUseCase: UpdateAlertStatusUseCase =
	(deps: UpdateAlertStatusDeps) =>
	async (input: UpdateAlertStatusInput): Promise<Result<Alert, AlertError>> => {
		try {
			// 既存のアラートを取得
			const alertResult = await deps.alertRepo.findById(
				input.alertId,
				input.requestingUserId
			);
			if (!alertResult.ok) return alertResult;

			if (!alertResult.value) {
				return err({
					type: "AlertNotFoundError",
					message: "Alert not found",
					alertId: input.alertId as number
				});
			}

			const currentAlert = alertResult.value;
			const currentTime = deps.clock.now();

			// ドメイン関数を使用してステータス更新
			const updatedAlertResult = updateAlertStatus(
				currentAlert,
				input.newStatus,
				currentTime
			);
			if (!updatedAlertResult.ok) return updatedAlertResult;

			// リポジトリで更新
			const updateResult = await deps.alertRepo.update(
				input.alertId,
				{
					status: updatedAlertResult.value.status,
					acknowledgedAt: updatedAlertResult.value.acknowledgedAt,
					resolvedAt: updatedAlertResult.value.resolvedAt,
					updatedAt: updatedAlertResult.value.updatedAt
				},
				input.requestingUserId
			);

			return updateResult;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update alert status",
				cause
			});
		}
	};

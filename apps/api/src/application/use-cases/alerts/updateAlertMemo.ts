/**
 * Update Alert Memo Use Case
 *
 * アラートのメモを更新するユースケース
 */

import type { AlertError } from "../../../domain/errors/alerts/AlertErrors";
import type { AlertRepository } from "../../../domain/ports/alerts";
import type { AlertId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * アラートメモ更新の入力
 */
export interface UpdateAlertMemoInput {
	alertId: AlertId;
	memo: string;
	requestingUserId: UserId;
}

/**
 * アラートメモ更新の結果
 */
export interface UpdateAlertMemoResult {
	message: string;
}

/**
 * アラートメモ更新ユースケースの関数型定義
 */
export type UpdateAlertMemoUseCase = (deps: {
	alertsRepo: AlertRepository;
}) => (
	input: UpdateAlertMemoInput
) => Promise<Result<UpdateAlertMemoResult, AlertError>>;

/**
 * アラートメモ更新ユースケース
 */
export const updateAlertMemoUseCase: UpdateAlertMemoUseCase =
	(deps: { alertsRepo: AlertRepository }) =>
	async (
		input: UpdateAlertMemoInput
	): Promise<Result<UpdateAlertMemoResult, AlertError>> => {
		try {
			const { alertId, memo, requestingUserId } = input;

			// アラートの存在確認
			const alert = await deps.alertsRepo.getById(alertId);
			if (!alert.ok) {
				return alert;
			}

			const alertData = alert.value;
			if (!alertData) {
				return err({
					type: "AlertNotFoundError",
					message: "Alert not found",
					alertId: alertId as unknown as number
				});
			}

			// 権限チェック（自分のアラートのみ更新可能）
			if (alertData.ownerUserId !== requestingUserId) {
				return err({
					type: "InfraError",
					message: "You can only update your own alerts"
				});
			}

			// メモ更新
			const updateResult = await deps.alertsRepo.updateMemo(alertId, memo);
			if (!updateResult.ok) {
				return updateResult;
			}

			return ok({
				message: "Alert memo updated successfully"
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to update alert memo",
				cause: error
			});
		}
	};

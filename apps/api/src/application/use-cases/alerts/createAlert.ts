/**
 * Create Alert Use Case
 *
 * アラートの新規作成ユースケース
 */

import type { AlertError } from "../../../domain/errors/alerts/AlertErrors";
import { createAlert } from "../../../domain/functions/alerts";
import type { AlertRepository } from "../../../domain/ports/alerts";
import type { Alert, NewAlertProps } from "../../../domain/types/alerts";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type CreateAlertDeps = {
	alertRepo: AlertRepository;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型
 */
export type CreateAlertInput = NewAlertProps;

/**
 * アラート作成ユースケースの関数型定義
 */
export type CreateAlertUseCase = (
	deps: CreateAlertDeps
) => (input: CreateAlertInput) => Promise<Result<Alert, AlertError>>;

/**
 * アラートの新規作成ユースケース
 *
 * 新しいアラートを作成し、リポジトリに保存します。
 * ドメインルールに基づくバリデーションを実行し、
 * 作成日時と更新日時は自動的に設定されます。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const createAlertUseCase: CreateAlertUseCase =
	(deps: CreateAlertDeps) =>
	async (input: CreateAlertInput): Promise<Result<Alert, AlertError>> => {
		try {
			const currentTime = deps.clock.now();

			// ドメインモデルを使用してアラートを作成・バリデーション
			const alertResult = createAlert(input, currentTime);
			if (!alertResult.ok) return alertResult;

			// リポジトリに保存
			const saveResult = await deps.alertRepo.create({
				type: alertResult.value.type,
				severity: alertResult.value.severity,
				status: alertResult.value.status,
				cattleId: alertResult.value.cattleId,
				cattleName: alertResult.value.cattleName,
				cattleEarTagNumber: alertResult.value.cattleEarTagNumber,
				dueAt: alertResult.value.dueAt,
				message: alertResult.value.message,
				memo: alertResult.value.memo,
				ownerUserId: alertResult.value.ownerUserId,
				acknowledgedAt: alertResult.value.acknowledgedAt,
				resolvedAt: alertResult.value.resolvedAt
			});

			return saveResult;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create alert",
				cause
			});
		}
	};

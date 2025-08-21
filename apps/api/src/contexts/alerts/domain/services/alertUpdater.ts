import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AlertsRepoPort } from "../../ports";
import type { AlertsDomainError } from "../errors";
import type {
	Alert,
	AlertHistory,
	AlertHistoryId,
	AlertId,
	AlertStatus,
	Timestamp,
	UserId
} from "../model";
import { toTimestamp } from "../model";
import { createAlertHistory } from "../model/alertHistory";

// ============================================================================
// 依存関係とコマンド
// ============================================================================

/**
 * アラート更新の依存関係。
 */
export type AlertUpdaterDeps = {
	/** アラートリポジトリ */ repo: AlertsRepoPort;
	/** 時刻取得器 */ time: { nowSeconds(): number };
	/** ID生成器 */ idGenerator: { generate(): string };
};

/**
 * アラート更新コマンド。
 */
export type UpdateAlertsCmd = {
	/** 所有者ユーザーID */ ownerUserId: UserId;
	/** 現在時刻取得関数 */ now: () => Date;
};

/**
 * アラート状態更新コマンド。
 */
export type UpdateAlertStatusCmd = {
	/** アラートID */ alertId: AlertId;
	/** 新しいステータス */ newStatus: AlertStatus;
	/** 変更理由 */ reason: string;
	/** 変更者ID */ changedBy: UserId;
	/** 現在時刻 */ currentTime: Timestamp;
};

export type UpdateAlertMemoCmd = {
	/** アラートID */ alertId: AlertId;
	/** 新しいメモ */ memo: string;
	/** 更新者ID */ userId: UserId;
};

// ============================================================================
// 結果型
// ============================================================================

/**
 * アラート更新結果。
 */
export type AlertUpdateResult = {
	/** 更新されたアラート数 */ updatedCount: number;
	/** 新規作成されたアラート数 */ createdCount: number;
	/** 解決されたアラート数 */ resolvedCount: number;
};

// ============================================================================
// アラート更新サービス
// ============================================================================

/**
 * ユーザーのアラートを一括更新するユースケース。
 *
 * 既存アラートの状態をチェック・更新し、新規アラートを生成します。
 *
 * @param deps - 依存関係
 * @param cmd - アラート更新コマンド
 * @returns 成功時はアラート更新結果、失敗時はドメインエラー
 */
export const updateAlertsForUser =
	(deps: AlertUpdaterDeps) =>
	async (
		cmd: UpdateAlertsCmd
	): Promise<Result<AlertUpdateResult, AlertsDomainError>> => {
		try {
			const now = cmd.now();
			const currentTime = toTimestamp(deps.time.nowSeconds());
			const userId = fromUserId(cmd.ownerUserId);

			// 1. 既存アラートの状態をチェック・更新
			const existingAlerts = await deps.repo.findActiveAlertsByUserId(userId);
			let resolvedCount = 0;

			for (const alert of existingAlerts) {
				const shouldResolve = await checkIfAlertShouldBeResolved(
					deps,
					alert,
					now
				);
				if (shouldResolve) {
					const updateResult = await updateAlertStatus(deps)({
						alertId: alert.id,
						newStatus: "resolved",
						reason: "自動解決",
						changedBy: cmd.ownerUserId,
						currentTime
					});

					if (updateResult.ok) {
						resolvedCount++;
					}
				}
			}

			// 2. 新規アラートを生成
			const newAlertsResult = await deps.repo.generateAlertsForUser(
				userId,
				now.toISOString()
			);

			if (!newAlertsResult.ok) {
				return err(newAlertsResult.error);
			}

			const newAlerts = newAlertsResult.value;
			let createdCount = 0;

			for (const alert of newAlerts) {
				const createResult = await deps.repo.createAlert(alert);

				if (createResult.ok) {
					// アラート履歴を追加
					await deps.repo.addAlertHistory({
						id: deps.idGenerator.generate() as AlertHistoryId,
						alertId: alert.id,
						action: "created",
						previousStatus: null,
						newStatus: alert.status,
						changedBy: cmd.ownerUserId,
						reason: "新規生成",
						createdAt: currentTime
					});
					createdCount++;
				}
			}
			return ok({
				updatedCount: existingAlerts.length,
				createdCount,
				resolvedCount
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: error instanceof Error ? error.message : String(error),
				cause: error
			});
		}
	};

/**
 * アラートのステータスを更新するユースケース。
 *
 * @param deps - 依存関係
 * @param cmd - アラート状態更新コマンド
 * @returns 成功時は更新されたアラート、失敗時はドメインエラー
 */
export const updateAlertStatus =
	(deps: AlertUpdaterDeps) =>
	async (
		cmd: UpdateAlertStatusCmd
	): Promise<Result<Alert, AlertsDomainError>> => {
		try {
			// 1. 既存アラートを取得
			const existingAlert = await deps.repo.findAlertById(cmd.alertId);
			if (!existingAlert) {
				return err({
					type: "InfraError",
					message: "アラートが見つかりません",
					cause: new Error("Alert not found")
				});
			}

			// 2. アラートステータスを更新
			const updatedAlert = await deps.repo.updateAlertStatus(
				cmd.alertId,
				cmd.newStatus,
				cmd.currentTime
			);

			if (!updatedAlert.ok) {
				return err(updatedAlert.error);
			}

			// 3. アラート履歴を追加
			await deps.repo.addAlertHistory({
				id: deps.idGenerator.generate() as AlertHistoryId,
				alertId: cmd.alertId,
				action: getActionFromStatusChange(existingAlert.status, cmd.newStatus),
				previousStatus: existingAlert.status,
				newStatus: cmd.newStatus,
				changedBy: cmd.changedBy,
				reason: cmd.reason,
				createdAt: cmd.currentTime
			});

			return ok(updatedAlert.value);
		} catch (error) {
			return err({
				type: "InfraError",
				message: error instanceof Error ? error.message : String(error),
				cause: error
			});
		}
	};

export const updateAlertMemo =
	(deps: AlertUpdaterDeps) =>
	async (
		cmd: UpdateAlertMemoCmd
	): Promise<Result<Alert, AlertsDomainError>> => {
		try {
			// アラートの存在確認
			const alert = await deps.repo.findAlertById(cmd.alertId);
			if (!alert) {
				return err({
					type: "InfraError",
					message: "アラートが見つかりません",
					cause: new Error("Alert not found")
				});
			}

			// メモ更新
			const updateResult = await deps.repo.updateAlertMemo(
				cmd.alertId,
				cmd.memo,
				toTimestamp(deps.time.nowSeconds())
			);

			if (!updateResult.ok) {
				return updateResult;
			}

			// 履歴追加
			const history = createAlertHistory({
				id: deps.idGenerator.generate() as AlertHistoryId,
				alertId: cmd.alertId,
				action: "updated",
				previousStatus: alert.status,
				newStatus: alert.status,
				changedBy: cmd.userId,
				reason: "メモ更新",
				createdAt: toTimestamp(deps.time.nowSeconds())
			});

			await deps.repo.addAlertHistory(history);

			return updateResult;
		} catch (error) {
			return err({
				type: "InfraError",
				message: "メモ更新に失敗しました",
				cause: error
			});
		}
	};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * アラートが解決されるべきかチェック
 * 現在は簡易的な実装（将来的に詳細な条件チェックを実装可能）
 */
async function checkIfAlertShouldBeResolved(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	// 現在は簡易的な実装
	// 将来的に詳細な条件チェックが必要になった場合は、
	// 各アラートタイプに応じた解決条件を実装
	return false;
}

/**
 * ステータス変更からアクションを取得
 */
function getActionFromStatusChange(
	previousStatus: AlertStatus,
	newStatus: AlertStatus
): "updated" | "acknowledged" | "resolved" | "dismissed" {
	if (newStatus === "acknowledged") return "acknowledged";
	if (newStatus === "resolved") return "resolved";
	if (newStatus === "dismissed") return "dismissed";
	return "updated";
}

/**
 * UserIdをnumberに変換
 */
function fromUserId(userId: UserId): number {
	return userId as number;
}

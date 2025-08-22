import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
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
import type { CattleId } from "../model/types";

// ============================================================================
// 依存関係とコマンド
// ============================================================================

/**
 * アラート更新の依存関係。
 */
export type AlertUpdaterDeps = {
	/** アラートリポジトリ */ repo: AlertsRepoPort;
	/** イベントリポジトリ */ eventsRepo?: EventsRepoPort;
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

			console.log(
				`[Alert Update] User ${userId}: Checking ${existingAlerts.length} existing alerts for resolution`
			);

			for (const alert of existingAlerts) {
				const shouldResolve = await checkIfAlertShouldBeResolved(
					deps,
					alert,
					now
				);
				if (shouldResolve) {
					console.log(
						`[Alert Update] Resolving alert ${alert.id} (${alert.type}) for cattle ${alert.cattleId}`
					);
					const updateResult = await updateAlertStatus(deps)({
						alertId: alert.id,
						newStatus: "resolved",
						reason: "自動解決",
						changedBy: cmd.ownerUserId,
						currentTime
					});

					if (updateResult.ok) {
						resolvedCount++;
						console.log(
							`[Alert Update] Successfully resolved alert ${alert.id}`
						);
					} else {
						console.error(
							`[Alert Update] Failed to resolve alert ${alert.id}:`,
							updateResult.error
						);
					}
				}
			}

			console.log(
				`[Alert Update] User ${userId}: Resolved ${resolvedCount} alerts`
			);

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
 * 各アラートタイプに応じた解決条件を実装
 */
async function checkIfAlertShouldBeResolved(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	try {
		switch (alert.type) {
			case "OPEN_DAYS_OVER60_NO_AI":
				// 空胎60日以上（AI未実施）の解決条件
				// 人工授精が実施された場合、または分娩が発生した場合
				return await checkOpenDaysResolution(deps, alert, now);

			case "CALVING_WITHIN_60":
				// 60日以内分娩予定の解決条件
				// 分娩が発生した場合、または分娩予定日を過ぎた場合
				return await checkCalvingWithinResolution(deps, alert, now);

			case "CALVING_OVERDUE":
				// 分娩予定日超過の解決条件
				// 分娩が発生した場合
				return await checkCalvingOverdueResolution(deps, alert, now);

			case "ESTRUS_OVER20_NOT_PREGNANT":
				// 発情から20日以上未妊娠の解決条件
				// 妊娠確認が実施された場合、または再発情が確認された場合
				return await checkEstrusOverResolution(deps, alert, now);

			default:
				console.warn(`Unknown alert type: ${alert.type}`);
				return false;
		}
	} catch (error) {
		console.error(`Error checking alert resolution for ${alert.type}:`, error);
		return false;
	}
}

// ============================================================================
// アラート解決条件チェック関数
// ============================================================================

/**
 * 空胎60日以上（AI未実施）アラートの解決条件チェック
 */
async function checkOpenDaysResolution(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	try {
		// アラート作成日以降の人工授精イベントまたは分娩イベントをチェック
		const alertCreatedAt = new Date(alert.createdAt);

		// 人工授精イベントをチェック（INSEMINATION）
		const hasInseminationAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["INSEMINATION"],
			alertCreatedAt
		);

		// 分娩イベントをチェック（CALVING）
		const hasCalvingAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["CALVING"],
			alertCreatedAt
		);

		const shouldResolve = hasInseminationAfterAlert || hasCalvingAfterAlert;

		if (shouldResolve) {
			console.log(
				`[Alert Resolution] OPEN_DAYS_OVER60_NO_AI resolved for cattle ${alert.cattleId}: ${hasInseminationAfterAlert ? "INSEMINATION" : "CALVING"} event found`
			);
		}

		return shouldResolve;
	} catch (error) {
		console.error("Error checking open days resolution:", error);
		return false;
	}
}

/**
 * 60日以内分娩予定アラートの解決条件チェック
 */
async function checkCalvingWithinResolution(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	try {
		const alertCreatedAt = new Date(alert.createdAt);

		// 分娩イベントをチェック（CALVING）
		const hasCalvingAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["CALVING"],
			alertCreatedAt
		);

		// 分娩予定日を過ぎた場合もアラートを解決
		// alert.dueAtが分娩予定日を示している
		const isPastDueDate = alert.dueAt ? now > new Date(alert.dueAt) : false;

		const shouldResolve = hasCalvingAfterAlert || isPastDueDate;

		if (shouldResolve) {
			console.log(
				`[Alert Resolution] CALVING_WITHIN_60 resolved for cattle ${alert.cattleId}: ${hasCalvingAfterAlert ? "CALVING event found" : "Past due date"}`
			);
		}

		return shouldResolve;
	} catch (error) {
		console.error("Error checking calving within resolution:", error);
		return false;
	}
}

/**
 * 分娩予定日超過アラートの解決条件チェック
 */
async function checkCalvingOverdueResolution(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	try {
		const alertCreatedAt = new Date(alert.createdAt);

		// 分娩イベントをチェック（CALVING）
		const hasCalvingAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["CALVING"],
			alertCreatedAt
		);

		if (hasCalvingAfterAlert) {
			console.log(
				`[Alert Resolution] CALVING_OVERDUE resolved for cattle ${alert.cattleId}: CALVING event found`
			);
		}

		return hasCalvingAfterAlert;
	} catch (error) {
		console.error("Error checking calving overdue resolution:", error);
		return false;
	}
}

/**
 * 発情から20日以上未妊娠アラートの解決条件チェック
 */
async function checkEstrusOverResolution(
	deps: AlertUpdaterDeps,
	alert: Alert,
	now: Date
): Promise<boolean> {
	try {
		const alertCreatedAt = new Date(alert.createdAt);

		// 妊娠確認イベントをチェック（PREGNANCY_CHECK）
		const hasPregnancyCheckAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["PREGNANCY_CHECK"],
			alertCreatedAt
		);

		// 再発情イベントをチェック（ESTRUS）
		const hasEstrusAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["ESTRUS"],
			alertCreatedAt
		);

		// 人工授精イベントをチェック（INSEMINATION）
		const hasInseminationAfterAlert = await checkEventAfterDate(
			deps,
			alert.cattleId,
			alert.ownerUserId,
			["INSEMINATION"],
			alertCreatedAt
		);

		const shouldResolve =
			hasPregnancyCheckAfterAlert ||
			hasEstrusAfterAlert ||
			hasInseminationAfterAlert;

		if (shouldResolve) {
			const reason = hasPregnancyCheckAfterAlert
				? "PREGNANCY_CHECK"
				: hasEstrusAfterAlert
					? "ESTRUS"
					: "INSEMINATION";
			console.log(
				`[Alert Resolution] ESTRUS_OVER20_NOT_PREGNANT resolved for cattle ${alert.cattleId}: ${reason} event found`
			);
		}

		return shouldResolve;
	} catch (error) {
		console.error("Error checking estrus over resolution:", error);
		return false;
	}
}

// ============================================================================
// 共通ヘルパー関数
// ============================================================================

/**
 * 指定した日付以降に特定のイベントタイプが発生したかチェック
 */
async function checkEventAfterDate(
	deps: AlertUpdaterDeps,
	cattleId: CattleId,
	ownerUserId: UserId,
	eventTypes: string[],
	afterDate: Date
): Promise<boolean> {
	try {
		// イベントリポジトリが利用できない場合はfalseを返す
		if (!deps.eventsRepo) {
			console.warn("Events repository not available for alert resolution");
			return false;
		}

		// 指定した牛のイベント一覧を取得
		const events = await deps.eventsRepo.listByCattleId(cattleId, ownerUserId);

		// 指定した日付以降の対象イベントタイプをチェック
		const hasEventAfterDate = events.some((event) => {
			const eventDate = new Date(event.eventDatetime);
			return eventTypes.includes(event.eventType) && eventDate >= afterDate;
		});

		return hasEventAfterDate;
	} catch (error) {
		console.error(
			`Error checking events after date for cattle ${cattleId}:`,
			error
		);
		return false;
	}
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

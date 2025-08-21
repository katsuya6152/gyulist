import type { Brand } from "../../../../shared/brand";
import type { AlertId, Timestamp, UserId } from "./types";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * アラート履歴アクションの定数配列。
 */
export const ALERT_HISTORY_ACTIONS = [
	"created",
	"updated",
	"acknowledged",
	"resolved",
	"dismissed"
] as const;

/**
 * アラート履歴アクションの型。
 */
export type AlertHistoryAction = (typeof ALERT_HISTORY_ACTIONS)[number];

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * アラート履歴IDのブランド型。
 */
export type AlertHistoryId = Brand<string, "AlertHistoryId">;

// ============================================================================
// アラート履歴エンティティ
// ============================================================================

/**
 * 新規アラート履歴作成用のプロパティ。
 */
export type NewAlertHistoryProps = {
	/** アラート履歴ID */ readonly id: AlertHistoryId;
	/** アラートID */ readonly alertId: AlertId;
	/** アクション */ readonly action: AlertHistoryAction;
	/** 変更前ステータス */ readonly previousStatus: string | null;
	/** 変更後ステータス */ readonly newStatus: string;
	/** 変更者ID */ readonly changedBy: UserId;
	/** 変更理由 */ readonly reason: string;
	/** 作成日時 */ readonly createdAt: Timestamp;
};

/**
 * アラート履歴エンティティ。
 *
 * アラートの状態変更履歴を表現します。
 */
export type AlertHistory = {
	/** アラート履歴ID */ readonly id: AlertHistoryId;
	/** アラートID */ readonly alertId: AlertId;
	/** アクション */ readonly action: AlertHistoryAction;
	/** 変更前ステータス */ readonly previousStatus: string | null;
	/** 変更後ステータス */ readonly newStatus: string;
	/** 変更者ID */ readonly changedBy: UserId;
	/** 変更理由 */ readonly reason: string;
	/** 作成日時 */ readonly createdAt: Timestamp;
};

/**
 * アラート履歴エンティティのファクトリ関数。
 *
 * 新規アラート履歴を作成します。
 * @param props - 新規アラート履歴のプロパティ
 * @returns 作成されたアラート履歴エンティティ
 */
export function createAlertHistory(props: NewAlertHistoryProps): AlertHistory {
	return {
		id: props.id,
		alertId: props.alertId,
		action: props.action,
		previousStatus: props.previousStatus,
		newStatus: props.newStatus,
		changedBy: props.changedBy,
		reason: props.reason,
		createdAt: props.createdAt
	};
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * アラート履歴アクションが有効かチェック
 */
export function isValidAlertHistoryAction(
	action: string
): action is AlertHistoryAction {
	return ALERT_HISTORY_ACTIONS.includes(action as AlertHistoryAction);
}

/**
 * Alert Entity
 *
 * アラート管理ドメインのエンティティ定義
 */

import type { CattleId, UserId } from "../../../shared/brand";
import type {
	AlertId,
	AlertMessage,
	AlertSeverity,
	AlertStatus,
	AlertType,
	DueDate
} from "./AlertTypes";

// ============================================================================
// Alert Entity
// ============================================================================

/**
 * Alertエンティティ
 *
 * 牛の繁殖管理、健康管理、スケジュール管理に関するアラートを表現します。
 * ステータス管理、重要度管理、期限管理などの機能を提供します。
 */
export type Alert = {
	/** アラートID */
	readonly id: AlertId;
	/** アラートタイプ */
	readonly type: AlertType;
	/** 重要度 */
	readonly severity: AlertSeverity;
	/** ステータス */
	readonly status: AlertStatus;
	/** 牛ID */
	readonly cattleId: CattleId;
	/** 牛名 */
	readonly cattleName: string | null;
	/** 耳標番号 */
	readonly cattleEarTagNumber: number | null;
	/** 期限日時 */
	readonly dueAt: DueDate | null;
	/** アラートメッセージ */
	readonly message: AlertMessage;
	/** メモ */
	readonly memo: string | null;
	/** 所有者ユーザーID */
	readonly ownerUserId: UserId;
	/** 作成日時 */
	readonly createdAt: Date;
	/** 更新日時 */
	readonly updatedAt: Date;
	/** 確認日時 */
	readonly acknowledgedAt: Date | null;
	/** 解決日時 */
	readonly resolvedAt: Date | null;
};

// ============================================================================
// New Alert Properties
// ============================================================================

/**
 * 新規アラート作成用のプロパティ
 *
 * アラートエンティティの作成に必要な情報を定義します。
 */
export type NewAlertProps = {
	/** アラートタイプ */
	readonly type: AlertType;
	/** 重要度 */
	readonly severity: AlertSeverity;
	/** 牛ID */
	readonly cattleId: CattleId;
	/** 牛名 */
	readonly cattleName: string | null;
	/** 耳標番号 */
	readonly cattleEarTagNumber: number | null;
	/** 期限日時 */
	readonly dueAt: Date | null;
	/** アラートメッセージ */
	readonly message: string;
	/** メモ */
	readonly memo: string | null;
	/** 所有者ユーザーID */
	readonly ownerUserId: UserId;
};

// ============================================================================
// Update Alert Properties
// ============================================================================

/**
 * アラート更新用のプロパティ
 */
export type UpdateAlertProps = {
	/** ステータス */
	readonly status?: AlertStatus;
	/** 重要度 */
	readonly severity?: AlertSeverity;
	/** アラートメッセージ */
	readonly message?: string;
	/** メモ */
	readonly memo?: string;
};

// ============================================================================
// Alert Statistics
// ============================================================================

/**
 * アラート統計情報
 */
export type AlertStats = {
	totalAlerts: number;
	activeAlerts: number;
	resolvedAlerts: number;
	alertsBySeverity: Record<AlertSeverity, number>;
	alertsByType: Record<AlertType, number>;
	alertsByStatus: Record<AlertStatus, number>;
	overdueAlerts: number;
	dueSoonAlerts: number;
};

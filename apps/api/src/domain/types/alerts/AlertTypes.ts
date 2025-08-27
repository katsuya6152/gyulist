/**
 * Alert Domain Types
 *
 * アラート管理ドメインの基本型定義
 */

import type { Brand } from "../../../shared/brand";

// ============================================================================
// Alert Type Constants
// ============================================================================

/**
 * アラートタイプの定数定義
 */
export const ALERT_TYPES = [
	"OPEN_DAYS_OVER60_NO_AI",
	"CALVING_WITHIN_60",
	"CALVING_OVERDUE",
	"ESTRUS_OVER20_NOT_PREGNANT"
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

/**
 * アラートタイプのラベル定義
 */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
	OPEN_DAYS_OVER60_NO_AI: "空胎60日以上（AI未実施）",
	CALVING_WITHIN_60: "60日以内分娩予定",
	CALVING_OVERDUE: "分娩予定日超過",
	ESTRUS_OVER20_NOT_PREGNANT: "発情から20日以上未妊娠"
};

// ============================================================================
// Alert Severity Constants
// ============================================================================

/**
 * アラート重要度の定数定義
 */
export const ALERT_SEVERITIES = ["high", "medium", "low"] as const;

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/**
 * アラート重要度のラベル定義
 */
export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
	high: "高",
	medium: "中",
	low: "低"
};

// ============================================================================
// Alert Status Constants
// ============================================================================

/**
 * アラートステータスの定数定義
 */
export const ALERT_STATUSES = [
	"active",
	"acknowledged",
	"resolved",
	"dismissed"
] as const;

export type AlertStatus = (typeof ALERT_STATUSES)[number];

/**
 * アラートステータスのラベル定義
 */
export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
	active: "アクティブ",
	acknowledged: "確認済み",
	resolved: "解決済み",
	dismissed: "却下"
};

/**
 * ステータス更新メッセージ
 */
export const STATUS_UPDATE_MESSAGES = {
	acknowledged: "アラートが確認済みに更新されました",
	resolved: "アラートが解決済みに更新されました",
	dismissed: "アラートが却下されました"
} as const;

// ============================================================================
// Brand Types
// ============================================================================

export type AlertId = Brand<number, "AlertId">;
export type AlertMessage = Brand<string, "AlertMessage">;
export type DueDate = Brand<Date, "DueDate">;

// ============================================================================
// Value Objects
// ============================================================================

/**
 * アラートタイプ値オブジェクト
 */
export type AlertTypeValue = {
	readonly value: AlertType;
	readonly displayName: string;
	readonly description: string;
	readonly category: "breeding" | "health" | "management";
	readonly defaultSeverity: AlertSeverity;
	readonly requiresAction: boolean;
};

/**
 * アラート重要度値オブジェクト
 */
export type AlertSeverityValue = {
	readonly value: AlertSeverity;
	readonly displayName: string;
	readonly priority: number;
	readonly color: string;
	readonly requiresImmediateAction: boolean;
};

/**
 * アラートステータス値オブジェクト
 */
export type AlertStatusValue = {
	readonly value: AlertStatus;
	readonly displayName: string;
	readonly description: string;
	readonly isActive: boolean;
	readonly isResolved: boolean;
};

// ============================================================================
// Search and Filter Types
// ============================================================================

/**
 * アラート検索条件
 */
export type AlertSearchCriteria = {
	ownerUserId: import("../../../shared/brand").UserId;
	alertType?: AlertType;
	severity?: AlertSeverity;
	status?: AlertStatus;
	cattleId?: import("../../../shared/brand").CattleId;
	startDate?: Date;
	endDate?: Date;
	cursor?: number;
	limit: number;
};

/**
 * アラート検索結果
 */
export type AlertSearchResult = {
	results: Array<import("./Alert").Alert>;
	nextCursor: number | null;
	hasNext: boolean;
};

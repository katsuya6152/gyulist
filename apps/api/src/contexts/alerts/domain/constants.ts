/**
 * Alerts ドメイン定数定義
 * アラートタイプ、重要度等のドメイン固有定数
 */

// Alert types
export const ALERT_TYPES = [
	"OPEN_DAYS_OVER60_NO_AI",
	"CALVING_WITHIN_60",
	"CALVING_OVERDUE",
	"ESTRUS_OVER20_NOT_PREGNANT"
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
	OPEN_DAYS_OVER60_NO_AI: "空胎60日以上（AI未実施）",
	CALVING_WITHIN_60: "60日以内分娩予定",
	CALVING_OVERDUE: "分娩予定日超過",
	ESTRUS_OVER20_NOT_PREGNANT: "発情から20日以上未妊娠"
};

// Alert severities
export const ALERT_SEVERITIES = ["high", "medium", "low"] as const;

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
	high: "高",
	medium: "中",
	low: "低"
};

// Alert statuses
export const ALERT_STATUSES = [
	"active",
	"acknowledged",
	"resolved",
	"dismissed"
] as const;

export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
	active: "アクティブ",
	acknowledged: "確認済み",
	resolved: "解決済み",
	dismissed: "却下"
};

// Status update messages
export const STATUS_UPDATE_MESSAGES = {
	acknowledged: "アラートが確認済みに更新されました",
	resolved: "アラートが解決済みに更新されました",
	dismissed: "アラートが却下されました"
} as const;

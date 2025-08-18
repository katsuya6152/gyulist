import type { Brand } from "../../../../shared/brand";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * アラートタイプの定数
 */
export const ALERT_TYPES = [
	"OPEN_DAYS_OVER60_NO_AI",
	"CALVING_WITHIN_60",
	"CALVING_OVERDUE",
	"ESTRUS_OVER20_NOT_PREGNANT"
] as const;

/**
 * アラートタイプの型
 */
export type AlertType = (typeof ALERT_TYPES)[number];

/**
 * アラート重要度の定数
 */
export const ALERT_SEVERITIES = ["high", "medium", "low"] as const;

/**
 * アラート重要度の型
 */
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/**
 * アラートステータスの定数
 */
export const ALERT_STATUSES = [
	"active",
	"acknowledged",
	"resolved",
	"dismissed"
] as const;

/**
 * アラートステータスの型
 */
export type AlertStatus = (typeof ALERT_STATUSES)[number];

/**
 * アラートメッセージの最大長
 */
export const MAX_ALERT_MESSAGE_LENGTH = 500;

/**
 * アラートIDの最大長
 */
export const MAX_ALERT_ID_LENGTH = 100;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * アラートID
 */
export type AlertId = Brand<string, "AlertId">;

/**
 * 牛ID（CattleIdの再エクスポート）
 */
export type CattleId = Brand<number, "CattleId">;

/**
 * ユーザーID（UserIdの再エクスポート）
 */
export type UserId = Brand<number, "UserId">;

/**
 * アラートメッセージ
 */
export type AlertMessage = Brand<string, "AlertMessage">;

/**
 * 牛の名前
 */
export type CattleName = Brand<string, "CattleName">;

/**
 * 耳標番号
 */
export type EarTagNumber = Brand<string, "EarTagNumber">;

/**
 * 期限日時
 */
export type DueDate = Brand<string, "DueDate">;

/**
 * タイムスタンプ
 */
export type Timestamp = Brand<number, "Timestamp">;

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * アラートタイプが有効かチェック
 */
export function isValidAlertType(type: string): type is AlertType {
	return ALERT_TYPES.includes(type as AlertType);
}

/**
 * アラート重要度が有効かチェック
 */
export function isValidAlertSeverity(
	severity: string
): severity is AlertSeverity {
	return ALERT_SEVERITIES.includes(severity as AlertSeverity);
}

/**
 * アラートステータスが有効かチェック
 */
export function isValidAlertStatus(status: string): status is AlertStatus {
	return ALERT_STATUSES.includes(status as AlertStatus);
}

/**
 * アラートメッセージの長さが有効かチェック
 */
export function isValidAlertMessageLength(message: string): boolean {
	return message.length <= MAX_ALERT_MESSAGE_LENGTH;
}

/**
 * アラートIDの長さが有効かチェック
 */
export function isValidAlertIdLength(id: string): boolean {
	return id.length <= MAX_ALERT_ID_LENGTH;
}

/**
 * 現在時刻を取得
 */
export function now(): Date {
	return new Date();
}

/**
 * 現在時刻をISO文字列で取得
 */
export function nowIso(): string {
	return now().toISOString();
}

import type { Brand } from "../../../../shared/brand";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * アラートタイプの定数配列。
 * 繁殖管理、健康管理、スケジュール管理などの各種アラートを定義します。
 */
export const ALERT_TYPES = [
	"OPEN_DAYS_OVER60_NO_AI",
	"CALVING_WITHIN_60",
	"CALVING_OVERDUE",
	"ESTRUS_OVER20_NOT_PREGNANT"
] as const;

/**
 * アラートタイプの型。
 * 定数配列から生成される型安全なアラートタイプです。
 */
export type AlertType = (typeof ALERT_TYPES)[number];

/**
 * アラート重要度の定数配列。
 * アラートの緊急度を表現します。
 */
export const ALERT_SEVERITIES = ["high", "medium", "low"] as const;

/**
 * アラート重要度の型。
 * 定数配列から生成される型安全な重要度です。
 */
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/**
 * アラートステータスの定数配列。
 * アラートの処理状況を表現します。
 */
export const ALERT_STATUSES = [
	"active",
	"acknowledged",
	"resolved",
	"dismissed"
] as const;

/**
 * アラートステータスの型。
 * 定数配列から生成される型安全なステータスです。
 */
export type AlertStatus = (typeof ALERT_STATUSES)[number];

/**
 * アラートメッセージの最大長。
 * データベース制約に基づく制限です。
 */
export const MAX_ALERT_MESSAGE_LENGTH = 500;

/**
 * アラートIDの最大長。
 * データベース制約に基づく制限です。
 */
export const MAX_ALERT_ID_LENGTH = 100;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * アラートIDのブランド型。
 * アラートの一意識別子を表現します。
 */
export type AlertId = Brand<string, "AlertId">;

/**
 * 牛IDのブランド型。
 * 牛の一意識別子を表現します。
 */
export type CattleId = Brand<number, "CattleId">;

/**
 * ユーザーIDのブランド型。
 * ユーザーの一意識別子を表現します。
 */
export type UserId = Brand<number, "UserId">;

/**
 * アラートメッセージのブランド型。
 * アラートの内容を表現する文字列です。
 */
export type AlertMessage = Brand<string, "AlertMessage">;

/**
 * 牛の名前のブランド型。
 * 牛の名前を表現する文字列です。
 */
export type CattleName = Brand<string, "CattleName">;

/**
 * 耳標番号のブランド型。
 * 牛の耳標番号を表現する文字列です。
 */
export type EarTagNumber = Brand<string, "EarTagNumber">;

/**
 * 期限日時のブランド型。
 * アラートの期限を表現するISO8601形式の文字列です。
 */
export type DueDate = Brand<string, "DueDate">;

/**
 * タイムスタンプのブランド型。
 * UNIXタイムスタンプを表現する数値です。
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

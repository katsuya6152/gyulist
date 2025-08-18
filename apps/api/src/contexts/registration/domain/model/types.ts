import type { Brand } from "../../../../shared/brand";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * 登録ステータスの定数
 */
export const REGISTRATION_STATUSES = [
	"pending",
	"confirmed",
	"completed",
	"cancelled"
] as const;

/**
 * 登録ステータスの型
 */
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/**
 * ロケールの定数
 */
export const LOCALES = ["ja", "en"] as const;

/**
 * ロケールの型
 */
export type Locale = (typeof LOCALES)[number];

/**
 * 紹介元の最大長
 */
export const MAX_REFERRAL_SOURCE_LENGTH = 100;

/**
 * メールアドレスの最大長
 */
export const MAX_EMAIL_LENGTH = 254;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * 登録ID
 */
export type RegistrationId = Brand<string, "RegistrationId">;

/**
 * メールアドレス
 */
export type Email = Brand<string, "Email">;

/**
 * 紹介元
 */
export type ReferralSource = Brand<string, "ReferralSource">;

/**
 * ロケール
 */
export type LocaleValue = Brand<string, "Locale">;

/**
 * タイムスタンプ（秒）
 */
export type Timestamp = Brand<number, "Timestamp">;

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 登録ステータスが有効かチェック
 */
export function isValidRegistrationStatus(
	status: string
): status is RegistrationStatus {
	return REGISTRATION_STATUSES.includes(status as RegistrationStatus);
}

/**
 * ロケールが有効かチェック
 */
export function isValidLocale(locale: string): locale is Locale {
	return LOCALES.includes(locale as Locale);
}

/**
 * 紹介元の長さが有効かチェック
 */
export function isValidReferralSourceLength(source: string): boolean {
	return source.length <= MAX_REFERRAL_SOURCE_LENGTH;
}

/**
 * メールアドレスの長さが有効かチェック
 */
export function isValidEmailLength(email: string): boolean {
	return email.length <= MAX_EMAIL_LENGTH;
}

/**
 * 現在時刻を秒単位で取得
 */
export function nowSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

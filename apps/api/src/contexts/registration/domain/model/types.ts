import type { Brand } from "../../../../shared/brand";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * 登録ステータスの定数配列。
 * 事前登録の処理状況を表現します。
 */
export const REGISTRATION_STATUSES = [
	"pending",
	"confirmed",
	"completed",
	"cancelled"
] as const;

/**
 * 登録ステータスの型。
 * 定数配列から生成される型安全なステータスです。
 */
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/**
 * ロケールの定数配列。
 * サポートされる言語を定義します。
 */
export const LOCALES = ["ja", "en"] as const;

/**
 * ロケールの型。
 * 定数配列から生成される型安全なロケールです。
 */
export type Locale = (typeof LOCALES)[number];

/**
 * 紹介元の最大長。
 * データベース制約に基づく制限です。
 */
export const MAX_REFERRAL_SOURCE_LENGTH = 100;

/**
 * メールアドレスの最大長。
 * RFC 5321に基づく制限です。
 */
export const MAX_EMAIL_LENGTH = 254;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * 登録IDのブランド型。
 * 事前登録の一意識別子を表現します。
 */
export type RegistrationId = Brand<string, "RegistrationId">;

/**
 * メールアドレスのブランド型。
 * ユーザーのメールアドレスを表現します。
 */
export type Email = Brand<string, "Email">;

/**
 * 紹介元のブランド型。
 * 登録の紹介元を表現する文字列です。
 */
export type ReferralSource = Brand<string, "ReferralSource">;

/**
 * ロケールのブランド型。
 * ユーザーの言語設定を表現します。
 */
export type LocaleValue = Brand<string, "Locale">;

/**
 * タイムスタンプのブランド型。
 * UNIXタイムスタンプ（秒）を表現する数値です。
 */
export type Timestamp = Brand<number, "Timestamp">;

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 登録ステータスが有効かチェックします。
 * @param status - チェックするステータス文字列
 * @returns 有効なステータスの場合は true
 */
export function isValidRegistrationStatus(
	status: string
): status is RegistrationStatus {
	return REGISTRATION_STATUSES.includes(status as RegistrationStatus);
}

/**
 * ロケールが有効かチェックします。
 * @param locale - チェックするロケール文字列
 * @returns 有効なロケールの場合は true
 */
export function isValidLocale(locale: string): locale is Locale {
	return LOCALES.includes(locale as Locale);
}

/**
 * 紹介元の長さが有効かチェックします。
 * @param source - チェックする紹介元文字列
 * @returns 有効な長さの場合は true
 */
export function isValidReferralSourceLength(source: string): boolean {
	return source.length <= MAX_REFERRAL_SOURCE_LENGTH;
}

/**
 * メールアドレスの長さが有効かチェックします。
 * @param email - チェックするメールアドレス
 * @returns 有効な長さの場合は true
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

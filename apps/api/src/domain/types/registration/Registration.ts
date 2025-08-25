/**
 * Registration Domain Types
 *
 * 事前登録ドメインの型定義
 */

import type { Brand } from "../../../shared/brand";

// ============================================================================
// Brand Types
// ============================================================================

export type RegistrationId = Brand<string, "RegistrationId">;
export type Email = Brand<string, "Email">;
export type ReferralSource = Brand<string, "ReferralSource">;
export type LocaleValue = Brand<string, "Locale">;
export type Timestamp = Brand<number, "Timestamp">;

// ============================================================================
// Constants
// ============================================================================

/**
 * 登録ステータスの定数配列
 * 事前登録の処理状況を表現します
 */
export const REGISTRATION_STATUSES = [
	"pending",
	"confirmed",
	"completed",
	"cancelled"
] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/**
 * ロケールの定数配列
 * サポートされる言語を定義します
 */
export const LOCALES = ["ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * 紹介元の最大長
 * データベース制約に基づく制限です
 */
export const MAX_REFERRAL_SOURCE_LENGTH = 100;

/**
 * メールアドレスの最大長
 * RFC 5321に基づく制限です
 */
export const MAX_EMAIL_LENGTH = 254;

// ============================================================================
// Value Objects
// ============================================================================

/**
 * 登録ステータス値オブジェクト
 *
 * 登録ステータスの表示名、説明、編集可能性などの情報を管理します
 */
export type RegistrationStatusValue = Readonly<{
	value: RegistrationStatus;
	displayName: string;
	description: string;
	isActive: boolean;
	isEditable: boolean;
}>;

/**
 * ロケール値オブジェクト
 *
 * ロケールの表示名、言語コード、国コードなどの情報を管理します
 */
export type LocaleValueObject = Readonly<{
	value: LocaleValue;
	displayName: string;
	languageCode: string;
	countryCode?: string;
}>;

// ============================================================================
// Registration Entity
// ============================================================================

/**
 * 新規登録作成用のプロパティ
 */
export type NewRegistrationProps = Readonly<{
	email: Email;
	referralSource: ReferralSource | null;
	locale: LocaleValue;
}>;

/**
 * Registrationエンティティ
 *
 * 事前登録の情報を表現します
 */
export type Registration = Readonly<{
	/** 登録ID */
	id: RegistrationId;
	/** メールアドレス */
	email: Email;
	/** 紹介元 */
	referralSource: ReferralSource | null;
	/** 登録ステータス */
	status: RegistrationStatus;
	/** ロケール */
	locale: LocaleValue;
	/** 作成日時 */
	createdAt: Timestamp;
	/** 更新日時 */
	updatedAt: Timestamp;
}>;

/**
 * 登録更新プロパティ
 */
export type UpdateRegistrationProps = Readonly<{
	status?: RegistrationStatus;
	referralSource?: ReferralSource | null;
}>;

// ============================================================================
// Email Log Types
// ============================================================================

/**
 * メールタイプの定数配列
 * 登録プロセスで使用されるメールの種類を定義します
 */
export const EMAIL_TYPES = [
	"completed",
	"verification",
	"reminder",
	"notification"
] as const;

export type EmailType = (typeof EMAIL_TYPES)[number];

/**
 * HTTPステータスコードの型
 * メール送信の結果を表現するHTTPステータスコードです
 */
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502;

export type EmailLogId = Brand<string, "EmailLogId">;
export type ResendId = Brand<string, "ResendId">;
export type ErrorMessage = Brand<string, "ErrorMessage">;

/**
 * メールタイプ値オブジェクト
 *
 * メールタイプの表示名、説明、リトライ設定などの情報を管理します
 */
export type EmailTypeValue = Readonly<{
	value: EmailType;
	displayName: string;
	description: string;
	isRetryable: boolean;
	maxRetries: number;
}>;

/**
 * HTTPステータス値オブジェクト
 *
 * HTTPステータスコードとその意味を表現します
 */
export type HttpStatusValue = Readonly<{
	value: HttpStatus;
	isSuccess: boolean;
	category: "success" | "client_error" | "server_error";
	description: string;
}>;

/**
 * 新規メールログ作成用のプロパティ
 */
export type NewEmailLogProps = Readonly<{
	email: Email;
	type: EmailType;
	httpStatus?: HttpStatus;
	resendId?: ResendId | null;
	error?: ErrorMessage | null;
}>;

/**
 * EmailLogエンティティ
 *
 * メール送信の履歴を表現します
 */
export type EmailLog = Readonly<{
	/** メールログID */
	id: EmailLogId;
	/** メールアドレス */
	email: Email;
	/** メールタイプ */
	type: EmailType;
	/** HTTPステータス */
	httpStatus?: HttpStatus;
	/** Resend ID */
	resendId?: ResendId | null;
	/** エラーメッセージ */
	error?: ErrorMessage | null;
	/** 作成日時 */
	createdAt: Timestamp;
}>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * 登録ステータスが有効かチェックします
 */
export function isValidRegistrationStatus(
	status: string
): status is RegistrationStatus {
	return REGISTRATION_STATUSES.includes(status as RegistrationStatus);
}

/**
 * ロケールが有効かチェックします
 */
export function isValidLocale(locale: string): locale is Locale {
	return LOCALES.includes(locale as Locale);
}

/**
 * 紹介元の長さが有効かチェックします
 */
export function isValidReferralSourceLength(source: string): boolean {
	return source.length <= MAX_REFERRAL_SOURCE_LENGTH;
}

/**
 * メールアドレスの長さが有効かチェックします
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

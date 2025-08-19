import type { EmailLogId, ErrorMessage, ResendId } from "./emailLog";
import type {
	Email,
	LocaleValue,
	ReferralSource,
	RegistrationId,
	Timestamp
} from "./types";

// ============================================================================
// 文字列からドメイン型への変換
// ============================================================================

/**
 * 文字列をRegistrationIdに変換します。
 * @param id - 登録ID文字列
 * @returns RegistrationIdブランド型
 */
export function toRegistrationId(id: string): RegistrationId {
	return id as RegistrationId;
}

/**
 * 文字列をEmailに変換します。
 * @param email - メールアドレス文字列
 * @returns Emailブランド型
 */
export function toEmail(email: string): Email {
	return email as Email;
}

/**
 * 文字列をReferralSourceに変換します。
 * @param source - 紹介元文字列（null可）
 * @returns ReferralSourceブランド型（null可）
 */
export function toReferralSource(source: string | null): ReferralSource | null {
	return source as ReferralSource | null;
}

/**
 * 文字列をLocaleValueに変換します。
 * @param locale - ロケール文字列
 * @returns LocaleValueブランド型
 */
export function toLocaleValue(locale: string): LocaleValue {
	return locale as LocaleValue;
}

/**
 * 数値をTimestampに変換します。
 * @param timestamp - UNIXタイムスタンプ数値
 * @returns Timestampブランド型
 */
export function toTimestamp(timestamp: number): Timestamp {
	return timestamp as Timestamp;
}

/**
 * 文字列をEmailLogIdに変換します。
 * @param id - メールログID文字列
 * @returns EmailLogIdブランド型
 */
export function toEmailLogId(id: string): EmailLogId {
	return id as EmailLogId;
}

/**
 * 文字列をResendIdに変換します。
 * @param id - Resend ID文字列（null可）
 * @returns ResendIdブランド型（null可）
 */
export function toResendId(id: string | null): ResendId | null {
	return id as ResendId | null;
}

/**
 * 文字列をErrorMessageに変換します。
 * @param error - エラーメッセージ文字列（null可）
 * @returns ErrorMessageブランド型（null可）
 */
export function toErrorMessage(error: string | null): ErrorMessage | null {
	return error as ErrorMessage | null;
}

// ============================================================================
// ドメイン型から文字列への変換
// ============================================================================

/**
 * RegistrationIdを文字列に変換します。
 * @param id - RegistrationIdブランド型
 * @returns 登録ID文字列
 */
export function fromRegistrationId(id: RegistrationId): string {
	return id;
}

/**
 * Emailを文字列に変換します。
 * @param email - Emailブランド型
 * @returns メールアドレス文字列
 */
export function fromEmail(email: Email): string {
	return email;
}

/**
 * ReferralSourceを文字列に変換します。
 * @param source - ReferralSourceブランド型（null可）
 * @returns 紹介元文字列（null可）
 */
export function fromReferralSource(
	source: ReferralSource | null
): string | null {
	return source;
}

/**
 * LocaleValueを文字列に変換します。
 * @param locale - LocaleValueブランド型
 * @returns ロケール文字列
 */
export function fromLocaleValue(locale: LocaleValue): string {
	return locale;
}

/**
 * Timestampを数値に変換
 */
export function fromTimestamp(timestamp: Timestamp): number {
	return timestamp;
}

/**
 * EmailLogIdを文字列に変換
 */
export function fromEmailLogId(id: EmailLogId): string {
	return id;
}

/**
 * ResendIdを文字列に変換
 */
export function fromResendId(id: ResendId | null): string | null {
	return id;
}

/**
 * ErrorMessageを文字列に変換
 */
export function fromErrorMessage(error: ErrorMessage | null): string | null {
	return error;
}

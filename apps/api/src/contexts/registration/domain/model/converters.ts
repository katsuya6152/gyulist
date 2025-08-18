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
 * 文字列をRegistrationIdに変換
 */
export function toRegistrationId(id: string): RegistrationId {
	return id as RegistrationId;
}

/**
 * 文字列をEmailに変換
 */
export function toEmail(email: string): Email {
	return email as Email;
}

/**
 * 文字列をReferralSourceに変換
 */
export function toReferralSource(source: string | null): ReferralSource | null {
	return source as ReferralSource | null;
}

/**
 * 文字列をLocaleValueに変換
 */
export function toLocaleValue(locale: string): LocaleValue {
	return locale as LocaleValue;
}

/**
 * 数値をTimestampに変換
 */
export function toTimestamp(timestamp: number): Timestamp {
	return timestamp as Timestamp;
}

/**
 * 文字列をEmailLogIdに変換
 */
export function toEmailLogId(id: string): EmailLogId {
	return id as EmailLogId;
}

/**
 * 文字列をResendIdに変換
 */
export function toResendId(id: string | null): ResendId | null {
	return id as ResendId | null;
}

/**
 * 文字列をErrorMessageに変換
 */
export function toErrorMessage(error: string | null): ErrorMessage | null {
	return error as ErrorMessage | null;
}

// ============================================================================
// ドメイン型から文字列への変換
// ============================================================================

/**
 * RegistrationIdを文字列に変換
 */
export function fromRegistrationId(id: RegistrationId): string {
	return id;
}

/**
 * Emailを文字列に変換
 */
export function fromEmail(email: Email): string {
	return email;
}

/**
 * ReferralSourceを文字列に変換
 */
export function fromReferralSource(
	source: ReferralSource | null
): string | null {
	return source;
}

/**
 * LocaleValueを文字列に変換
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

/**
 * Registration Domain Types
 *
 * 事前登録ドメインの型定義を集約
 */

// Registration types
export type {
	Registration,
	RegistrationId,
	Email,
	ReferralSource,
	LocaleValue,
	Timestamp,
	RegistrationStatus,
	Locale,
	RegistrationStatusValue,
	LocaleValueObject,
	NewRegistrationProps,
	UpdateRegistrationProps
} from "./Registration";

// Email log types
export type {
	EmailLog,
	EmailLogId,
	ResendId,
	ErrorMessage,
	EmailType,
	HttpStatus,
	EmailTypeValue,
	HttpStatusValue,
	NewEmailLogProps
} from "./Registration";

// Constants (not exported to avoid Cloudflare Workers type conflicts)
// Available via validation functions:
// - REGISTRATION_STATUSES, LOCALES, EMAIL_TYPES
// - MAX_REFERRAL_SOURCE_LENGTH, MAX_EMAIL_LENGTH

// Validation functions
export {
	isValidRegistrationStatus,
	isValidLocale,
	isValidReferralSourceLength,
	isValidEmailLength,
	nowSeconds
} from "./Registration";

import { z } from "zod";
import {
	LOCALES,
	MAX_EMAIL_LENGTH,
	MAX_REFERRAL_SOURCE_LENGTH,
	REGISTRATION_STATUSES
} from "../model/types";

// ============================================================================
// 事前登録スキーマ
// ============================================================================

export const preRegisterSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email("有効なメールアドレスを入力してください")
		.max(
			MAX_EMAIL_LENGTH,
			`メールアドレスは${MAX_EMAIL_LENGTH}文字以内で入力してください`
		),
	referralSource: z
		.string()
		.max(
			MAX_REFERRAL_SOURCE_LENGTH,
			`紹介元は${MAX_REFERRAL_SOURCE_LENGTH}文字以内で入力してください`
		)
		.optional()
		.transform((v) => (v?.trim() ? v.trim() : null)),
	turnstileToken: z.string().min(10, "Turnstileトークンが無効です")
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

// ============================================================================
// 管理者用検索クエリスキーマ
// ============================================================================

export const registrationQuerySchema = z.object({
	q: z.string().optional(),
	from: z.coerce.number().int().optional(),
	to: z.coerce.number().int().optional(),
	source: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0)
});

export type RegistrationQuery = z.infer<typeof registrationQuerySchema>;

// ============================================================================
// 登録ステータス更新スキーマ
// ============================================================================

export const updateRegistrationStatusSchema = z.object({
	status: z.enum(REGISTRATION_STATUSES, {
		errorMap: () => ({ message: "有効なステータスを選択してください" })
	}),
	reason: z.string().optional()
});

export type UpdateRegistrationStatusInput = z.infer<
	typeof updateRegistrationStatusSchema
>;

// ============================================================================
// 紹介元更新スキーマ
// ============================================================================

export const updateReferralSourceSchema = z.object({
	referralSource: z
		.string()
		.max(
			MAX_REFERRAL_SOURCE_LENGTH,
			`紹介元は${MAX_REFERRAL_SOURCE_LENGTH}文字以内で入力してください`
		)
		.optional()
		.transform((v) => (v?.trim() ? v.trim() : null))
});

export type UpdateReferralSourceInput = z.infer<
	typeof updateReferralSourceSchema
>;

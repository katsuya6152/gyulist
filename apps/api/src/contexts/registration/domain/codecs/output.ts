import { z } from "zod";
import { LOCALES, REGISTRATION_STATUSES } from "../model/types";

// ============================================================================
// 登録項目スキーマ
// ============================================================================

export const registrationItemSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	referralSource: z.string().nullable(),
	status: z.enum(REGISTRATION_STATUSES),
	locale: z.enum(LOCALES),
	createdAt: z.number(),
	updatedAt: z.number()
});

export type RegistrationItem = z.infer<typeof registrationItemSchema>;

// ============================================================================
// 登録一覧レスポンススキーマ
// ============================================================================

export const registrationsListResponseSchema = z.object({
	items: z.array(registrationItemSchema),
	total: z.number()
});

export type RegistrationsListResponse = z.infer<
	typeof registrationsListResponseSchema
>;

// ============================================================================
// 事前登録成功スキーマ
// ============================================================================

export const preRegisterSuccessSchema = z.object({
	ok: z.literal(true),
	message: z.string().optional(),
	alreadyRegistered: z.boolean().optional()
});

export type PreRegisterSuccess = z.infer<typeof preRegisterSuccessSchema>;

// ============================================================================
// 事前登録失敗スキーマ
// ============================================================================

export const preRegisterErrorSchema = z.object({
	ok: z.literal(false),
	code: z.enum(["TURNSTILE_FAILED", "RESEND_FAILED", "VALIDATION_ERROR"]),
	message: z.string()
});

export type PreRegisterError = z.infer<typeof preRegisterErrorSchema>;

// ============================================================================
// 事前登録レスポンススキーマ
// ============================================================================

export const preRegisterResponseSchema = z.union([
	preRegisterSuccessSchema,
	preRegisterErrorSchema
]);

export type PreRegisterResponse = z.infer<typeof preRegisterResponseSchema>;

// ============================================================================
// 登録ステータス更新レスポンススキーマ
// ============================================================================

export const updateRegistrationStatusResponseSchema = z.object({
	ok: z.literal(true),
	message: z.string(),
	registration: registrationItemSchema
});

export type UpdateRegistrationStatusResponse = z.infer<
	typeof updateRegistrationStatusResponseSchema
>;

// ============================================================================
// 紹介元更新レスポンススキーマ
// ============================================================================

export const updateReferralSourceResponseSchema = z.object({
	ok: z.literal(true),
	message: z.string(),
	registration: registrationItemSchema
});

export type UpdateReferralSourceResponse = z.infer<
	typeof updateReferralSourceResponseSchema
>;

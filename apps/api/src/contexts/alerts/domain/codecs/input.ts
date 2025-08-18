import { z } from "zod";
import { ALERT_SEVERITIES, ALERT_STATUSES } from "../model/types";

// ============================================================================
// アラート取得クエリスキーマ
// ============================================================================

export const getAlertsQuerySchema = z.object({
	severity: z.enum(ALERT_SEVERITIES).optional(),
	status: z.enum(ALERT_STATUSES).optional(),
	cattleId: z.coerce.number().int().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0)
});

export type GetAlertsQuery = z.infer<typeof getAlertsQuerySchema>;

// ============================================================================
// アラートステータス更新スキーマ
// ============================================================================

export const updateAlertStatusSchema = z.object({
	status: z.enum(ALERT_STATUSES, {
		errorMap: () => ({ message: "有効なステータスを選択してください" })
	}),
	reason: z.string().optional()
});

export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;

// ============================================================================
// アラート重要度更新スキーマ
// ============================================================================

export const updateAlertSeveritySchema = z.object({
	severity: z.enum(ALERT_SEVERITIES, {
		errorMap: () => ({ message: "有効な重要度を選択してください" })
	}),
	reason: z.string().optional()
});

export type UpdateAlertSeverityInput = z.infer<
	typeof updateAlertSeveritySchema
>;

// ============================================================================
// アラート作成スキーマ
// ============================================================================

export const createAlertSchema = z.object({
	type: z.enum(
		[
			"OPEN_DAYS_OVER60_NO_AI",
			"CALVING_WITHIN_60",
			"CALVING_OVERDUE",
			"ESTRUS_OVER20_NOT_PREGNANT"
		],
		{
			errorMap: () => ({ message: "有効なアラートタイプを選択してください" })
		}
	),
	severity: z.enum(ALERT_SEVERITIES, {
		errorMap: () => ({ message: "有効な重要度を選択してください" })
	}),
	cattleId: z.number().int().positive("牛IDは正の整数である必要があります"),
	message: z
		.string()
		.min(1, "メッセージは必須です")
		.max(500, "メッセージは500文字以内で入力してください"),
	dueAt: z.string().datetime().optional()
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

// ============================================================================
// アラート検索スキーマ
// ============================================================================

export const searchAlertsSchema = z.object({
	q: z.string().optional(),
	from: z.coerce.number().int().optional(),
	to: z.coerce.number().int().optional(),
	severity: z.enum(ALERT_SEVERITIES).optional(),
	status: z.enum(ALERT_STATUSES).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0)
});

export type SearchAlertsInput = z.infer<typeof searchAlertsSchema>;

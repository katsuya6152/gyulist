import { z } from "zod";
import { ALERT_SEVERITIES, ALERT_STATUSES, ALERT_TYPES } from "../model/types";

// ============================================================================
// アラート項目スキーマ
// ============================================================================

export const alertSchema = z.object({
	id: z.string(),
	type: z.enum(ALERT_TYPES),
	severity: z.enum(ALERT_SEVERITIES),
	status: z.enum(ALERT_STATUSES),
	cattleId: z.number(),
	cattleName: z.string().nullable(),
	cattleEarTagNumber: z.string().nullable(),
	dueAt: z.string().nullable(),
	message: z.string(),
	ownerUserId: z.number(),
	createdAt: z.number(),
	updatedAt: z.number(),
	acknowledgedAt: z.number().nullable(),
	resolvedAt: z.number().nullable()
});

export type AlertItem = z.infer<typeof alertSchema>;

// ============================================================================
// アラート一覧レスポンススキーマ
// ============================================================================

export const alertsResponseSchema = z.object({
	results: z.array(alertSchema),
	total: z.number(),
	summary: z.object({
		high: z.number(),
		medium: z.number(),
		low: z.number(),
		urgent: z.number()
	})
});

export type AlertsResponse = z.infer<typeof alertsResponseSchema>;

// ============================================================================
// アラート詳細レスポンススキーマ
// ============================================================================

export const alertDetailResponseSchema = z.object({
	alert: alertSchema
});

export type AlertDetailResponse = z.infer<typeof alertDetailResponseSchema>;

// ============================================================================
// アラート更新レスポンススキーマ
// ============================================================================

export const alertUpdateResponseSchema = z.object({
	ok: z.literal(true),
	message: z.string(),
	alert: alertSchema
});

export type AlertUpdateResponse = z.infer<typeof alertUpdateResponseSchema>;

// ============================================================================
// アラート作成レスポンススキーマ
// ============================================================================

export const alertCreateResponseSchema = z.object({
	ok: z.literal(true),
	message: z.string(),
	alert: alertSchema
});

export type AlertCreateResponse = z.infer<typeof alertCreateResponseSchema>;

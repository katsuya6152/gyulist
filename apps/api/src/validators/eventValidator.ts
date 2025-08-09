import { z } from "zod";

// イベントタイプの定義
export const eventTypes = [
	"ESTRUS", // 発情
	"INSEMINATION", // 受精（人工授精）
	"PREGNANCY_CHECK", // 妊娠鑑定
	"TREATMENT_START", // 治療開始
	"TREATMENT_END", // 治療終了
	"CALVING", // 分娩
	"VACCINATION", // ワクチン接種
	"SHIPMENT", // 出荷
	"HOOF_TRIMMING", // 削蹄
	"OTHER", // その他
] as const;

// イベント作成用のスキーマ
export const createEventSchema = z.object({
	cattleId: z.number().int().positive(),
	eventType: z.enum(eventTypes),
	eventDatetime: z.string().datetime(),
	notes: z.string().optional(),
});

// イベント更新用のスキーマ
export const updateEventSchema = z.object({
	eventType: z.enum(eventTypes).optional(),
	eventDatetime: z.string().datetime().optional(),
	notes: z.string().optional(),
});

// イベント検索用のスキーマ
export const searchEventSchema = z.object({
	cattleId: z.coerce.number().int().positive().optional(),
	eventType: z.enum(eventTypes).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.coerce.number().int().positive().max(100).default(20),
	cursor: z.coerce.number().int().positive().optional(),
});

// 型定義
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SearchEventQuery = z.infer<typeof searchEventSchema>;

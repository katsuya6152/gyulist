import { z } from "zod";
import { EVENT_TYPES_TUPLE } from "../constants/events";

// イベント作成用のスキーマ
export const createEventSchema = z.object({
	cattleId: z.number().int().positive(),
	eventType: z.enum(EVENT_TYPES_TUPLE),
	eventDatetime: z.string().datetime(),
	notes: z.string().optional(),
});

// イベント更新用のスキーマ
export const updateEventSchema = z.object({
	eventType: z.enum(EVENT_TYPES_TUPLE).optional(),
	eventDatetime: z.string().datetime().optional(),
	notes: z.string().optional(),
});

// イベント検索用のスキーマ
export const searchEventSchema = z.object({
	cattleId: z.coerce.number().int().positive().optional(),
	eventType: z.enum(EVENT_TYPES_TUPLE).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.coerce.number().int().positive().max(100).default(20),
	cursor: z.coerce.number().int().positive().optional(),
});

// 型定義
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SearchEventQuery = z.infer<typeof searchEventSchema>;

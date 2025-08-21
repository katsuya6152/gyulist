import { z } from "zod";
import { EVENT_TYPES, type EventType } from "../model";

export const searchEventsSchema = z.object({
	cattleId: z.number().int().positive().optional(),
	eventType: z.enum(EVENT_TYPES).optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	cursor: z.number().int().positive().nullable().optional(),
	limit: z.number().int().min(1).max(100)
});

export type SearchEventsInput = z.infer<typeof searchEventsSchema>;

export const createEventSchema = z.object({
	cattleId: z.number().int().positive(),
	eventType: z.enum(EVENT_TYPES),
	eventDatetime: z.string().datetime(),
	notes: z.string().nullable().optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
	eventType: z.enum(EVENT_TYPES).optional(),
	eventDatetime: z.string().datetime().optional(),
	notes: z.string().nullable().optional()
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// イベント検索用のスキーマ（HTTP API用）
export const searchEventSchema = z.object({
	cattleId: z.coerce.number().int().positive().optional(),
	eventType: z.enum(EVENT_TYPES).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.coerce.number().int().positive().max(100).default(20),
	cursor: z.coerce.number().int().positive().optional()
});

export type SearchEventQuery = z.infer<typeof searchEventSchema>;

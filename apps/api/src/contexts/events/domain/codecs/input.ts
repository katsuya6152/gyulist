import { z } from "zod";
import type { EventType } from "../../../events/ports";

export const searchEventsSchema = z.object({
	cattleId: z.number().int().positive().optional(),
	eventType: z.custom<EventType>().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	cursor: z.number().int().positive().nullable().optional(),
	limit: z.number().int().min(1).max(100)
});

export type SearchEventsInput = z.infer<typeof searchEventsSchema>;

export const createEventSchema = z.object({
	cattleId: z.number().int().positive(),
	eventType: z.custom<EventType>(),
	eventDatetime: z.string(),
	notes: z.string().nullable().optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
	eventType: z.custom<EventType>().optional(),
	eventDatetime: z.string().optional(),
	notes: z.string().nullable().optional()
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// イベント検索用のスキーマ（HTTP API用）
export const searchEventSchema = z.object({
	cattleId: z.coerce.number().int().positive().optional(),
	eventType: z.custom<EventType>().optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.coerce.number().int().positive().max(100).default(20),
	cursor: z.coerce.number().int().positive().optional()
});

export type SearchEventQuery = z.infer<typeof searchEventSchema>;

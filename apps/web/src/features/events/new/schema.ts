import { EVENT_TYPES, EVENT_TYPES_TUPLE, EVENT_TYPE_LABELS } from "@repo/api";
import { z } from "zod";

export const eventTypes = EVENT_TYPES.map((v) => ({
	value: v,
	label: EVENT_TYPE_LABELS[v],
}));

export const createEventSchema = z.object({
	cattleId: z.coerce.number().int().positive(),
	eventType: z.enum(EVENT_TYPES_TUPLE),
	eventDate: z.string().min(1, "イベント日付は必須です"),
	eventTime: z.string().min(1, "イベント時刻は必須です"),
	notes: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

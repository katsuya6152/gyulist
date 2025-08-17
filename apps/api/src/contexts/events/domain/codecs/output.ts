import { z } from "zod";

export const eventSchema = z.object({
	eventId: z.number(),
	cattleId: z.number(),
	eventType: z.string(),
	eventDatetime: z.string(),
	notes: z.string().nullable(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	cattleName: z.string().nullable().optional(),
	cattleEarTagNumber: z.number().nullable().optional()
});

export const eventsSearchResponseSchema = z.object({
	results: z.array(eventSchema),
	nextCursor: z.number().nullable(),
	hasNext: z.boolean()
});

export const eventsOfCattleResponseSchema = z.object({
	results: z.array(eventSchema)
});

export const eventResponseSchema = eventSchema;

// Export inferred types for consumers
export type EventOutput = z.infer<typeof eventSchema>;
export type EventsSearchResponse = z.infer<typeof eventsSearchResponseSchema>;
export type EventsOfCattleResponse = z.infer<
	typeof eventsOfCattleResponseSchema
>;
export type EventResponse = z.infer<typeof eventResponseSchema>;

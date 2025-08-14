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



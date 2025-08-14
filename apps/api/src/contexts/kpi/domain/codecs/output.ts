import { z } from "zod";

export const breedingKpiSchema = z.object({
  metrics: z.object({
    conceptionRate: z.number().nullable(),
    avgDaysOpen: z.number().nullable(),
    avgCalvingInterval: z.number().nullable(),
    aiPerConception: z.number().nullable()
  }),
  counts: z.record(z.number())
});

export type BreedingKpiResponse = z.infer<typeof breedingKpiSchema>;

export const breedingKpiDeltaSchema = z.object({
  month: z.string().nullable(),
  delta: z.object({
    conceptionRate: z.number().nullable(),
    avgDaysOpen: z.number().nullable(),
    avgCalvingInterval: z.number().nullable(),
    aiPerConception: z.number().nullable()
  })
});

export const breedingKpiTrendsSchema = z.object({
  series: z.array(
    z.object({
      month: z.string(),
      metrics: z.object({
        conceptionRate: z.number().nullable(),
        avgDaysOpen: z.number().nullable(),
        avgCalvingInterval: z.number().nullable(),
        aiPerConception: z.number().nullable()
      }),
      counts: z.record(z.number())
    })
  ),
  deltas: z.array(
    z.object({
      month: z.string(),
      metrics: z.object({
        conceptionRate: z.number().nullable(),
        avgDaysOpen: z.number().nullable(),
        avgCalvingInterval: z.number().nullable(),
        aiPerConception: z.number().nullable()
      })
    })
  )
});



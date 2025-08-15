import { z } from "zod";

export const alertSchema = z.object({
	alertId: z.string(),
	type: z.enum([
		"OPEN_DAYS_OVER60_NO_AI",
		"CALVING_WITHIN_60",
		"CALVING_OVERDUE",
		"ESTRUS_OVER20_NOT_PREGNANT"
	]),
	severity: z.enum(["high", "medium", "low"]),
	cattleId: z.number(),
	cattleName: z.string().nullable(),
	cattleEarTagNumber: z.string().nullable(),
	dueAt: z.string().nullable(),
	message: z.string()
});

export const alertsResponseSchema = z.object({
	results: z.array(alertSchema)
});

export type AlertsResponse = z.infer<typeof alertsResponseSchema>;

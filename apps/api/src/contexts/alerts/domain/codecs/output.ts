import { z } from "zod";
import { ALERT_SEVERITIES, ALERT_TYPES } from "../constants";

export const alertSchema = z.object({
	alertId: z.string(),
	type: z.enum(ALERT_TYPES),
	severity: z.enum(ALERT_SEVERITIES),
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

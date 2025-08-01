import { z } from "zod";

export const eventTypes = [
	{ value: "ESTRUS", label: "発情" },
	{ value: "INSEMINATION", label: "人工授精" },
	{ value: "CALVING", label: "分娩" },
	{ value: "VACCINATION", label: "ワクチン接種" },
	{ value: "SHIPMENT", label: "出荷" },
	{ value: "HOOF_TRIMMING", label: "削蹄" },
	{ value: "OTHER", label: "その他" },
] as const;

export const createEventSchema = z.object({
	cattleId: z.coerce.number().int().positive(),
	eventType: z.enum([
		"ESTRUS",
		"INSEMINATION",
		"CALVING",
		"VACCINATION",
		"SHIPMENT",
		"HOOF_TRIMMING",
		"OTHER",
	]),
	eventDate: z.string().min(1, "イベント日付は必須です"),
	eventTime: z.string().min(1, "イベント時刻は必須です"),
	notes: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

import { z } from "zod";

export const preRegisterSchema = z.object({
	email: z.string().trim().toLowerCase().email(),
	referralSource: z
		.string()
		.max(100)
		.optional()
		.transform((v) => (v?.trim() ? v.trim() : null)),
	turnstileToken: z.string().min(10)
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

// Admin用の検索クエリスキーマ
export const registrationQuerySchema = z.object({
	q: z.string().optional(),
	from: z.coerce.number().int().optional(),
	to: z.coerce.number().int().optional(),
	source: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0)
});

export type RegistrationQuery = z.infer<typeof registrationQuerySchema>;

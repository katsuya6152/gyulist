import { z } from "zod";

export const preRegisterSchema = z.object({
	email: z.string().trim().toLowerCase().email(),
	referralSource: z
		.string()
		.max(100)
		.optional()
		.transform((v) => (v?.trim() ? v.trim() : null)),
	turnstileToken: z.string().min(10),
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

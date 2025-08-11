import { z } from "zod";

export const preRegisterSchema = z.object({
	email: z
		.string()
		.email()
		.transform((v) => v.trim().toLowerCase()),
	referralSource: z
		.string()
		.max(100)
		.optional()
		.transform((v) => {
			const value = v?.trim();
			return value ? value : null;
		}),
	turnstileToken: z.string().min(10),
});

export type PreRegisterFormInput = z.infer<typeof preRegisterSchema>;

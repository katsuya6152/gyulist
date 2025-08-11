import { z } from "zod";

export const PreRegisterSchema = z.object({
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

export type PreRegisterInput = z.infer<typeof PreRegisterSchema>;

export const AdminRegistrationsQuerySchema = z.object({
	q: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	source: z.string().optional(),
	limit: z.coerce.number().int().positive().max(100).optional(),
	offset: z.coerce.number().int().nonnegative().optional(),
});

export type AdminRegistrationsQuery = z.infer<
	typeof AdminRegistrationsQuerySchema
>;

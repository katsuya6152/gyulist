import { z } from "zod";

export const registrationItemSchema = z.object({
	id: z.string(),
	email: z.string(),
	referralSource: z.string().nullable(),
	status: z.string(),
	locale: z.string(),
	createdAt: z.number(),
	updatedAt: z.number()
});

export const registrationsListResponseSchema = z.object({
	items: z.array(registrationItemSchema),
	total: z.number()
});

export const preRegisterSuccessSchema = z.object({
	ok: z.literal(true),
	message: z.string().optional(),
	alreadyRegistered: z.boolean().optional()
});

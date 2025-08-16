import { z } from "zod";

export const loginResponseSchema = z.object({
	token: z.string()
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const registerResponseSchema = z.object({
	success: z.literal(true),
	message: z.string()
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const verifyResponseSchema = z.object({
	success: z.boolean(),
	message: z.string()
});
export type VerifyResponse = z.infer<typeof verifyResponseSchema>;

export const completeResponseSchema = z.object({
	success: z.boolean(),
	message: z.string()
});
export type CompleteResponse = z.infer<typeof completeResponseSchema>;

export const updateThemeResponseSchema = z.object({
	success: z.literal(true),
	theme: z.string()
});
export type UpdateThemeResponse = z.infer<typeof updateThemeResponseSchema>;

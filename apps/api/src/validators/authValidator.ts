import { z } from "zod";

export const RegisterSchema = z.object({
	email: z.string().email()
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const VerifySchema = z.object({
	token: z.string().min(10)
});
export type VerifyInput = z.infer<typeof VerifySchema>;

export const CompleteSchema = z.object({
	token: z.string().min(10),
	name: z.string().min(1),
	password: z.string().min(8)
});
export type CompleteInput = z.infer<typeof CompleteSchema>;

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export type LoginInput = z.infer<typeof LoginSchema>;

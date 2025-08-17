import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
	email: z.string().email()
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifySchema = z.object({ token: z.string().min(10) });
export type VerifyInput = z.infer<typeof verifySchema>;

export const completeSchema = z.object({
	token: z.string().min(10),
	name: z.string().min(1),
	password: z.string().min(6)
});
export type CompleteInput = z.infer<typeof completeSchema>;

// HTTP API用のスキーマ（バリデーター統合）
export const RegisterSchema = z.object({
	email: z.string().email()
});

export const VerifySchema = z.object({
	token: z.string().min(10)
});

export const CompleteSchema = z.object({
	token: z.string().min(10),
	name: z.string().min(1),
	password: z.string().min(8)
});

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

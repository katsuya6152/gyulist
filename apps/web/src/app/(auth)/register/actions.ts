"use server";

import {
	type RegisterInput,
	register as registerUser,
} from "@/services/authService";
import { z } from "zod";

const RegisterSchema = z.object({
	email: z.string().email("正しいメールアドレスを入力してください"),
});

type FormState = {
	success: boolean;
	message: string;
};

export async function register(
	prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const email = formData.get("email");
	const parsed = RegisterSchema.safeParse({ email });

	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "不正な入力です",
		};
	}

	const registerData: RegisterInput = { email: parsed.data.email };
	const result = await registerUser(registerData);

	return {
		success: result.success,
		message: result.message,
	};
}

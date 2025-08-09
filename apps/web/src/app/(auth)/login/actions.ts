"use server";

import {
	type LoginInput,
	clearAuthCookie,
	login,
	setAuthCookie,
} from "@/services/authService";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
	email: z
		.string()
		.nonempty("メールアドレスを入力してください。")
		.email("有効なメールアドレスを入力してください。"),
	password: z
		.string()
		.nonempty("パスワードを入力してください。")
		.min(6, "パスワードは6文字以上である必要があります。"),
});

export type LoginActionResult =
	| { success: false; message: string }
	| { success: true; message: string };

export async function loginAction(
	prevState: LoginActionResult | null,
	formData: FormData,
): Promise<LoginActionResult> {
	const data = {
		email: formData.get("email"),
		password: formData.get("password"),
	};

	const parseResult = loginSchema.safeParse(data);

	if (!parseResult.success) {
		const firstError =
			parseResult.error.errors[0]?.message || "入力エラーが発生しました。";
		return { success: false, message: firstError };
	}

	const loginData: LoginInput = parseResult.data;
	const result = await login(loginData);

	if (result.success && result.token) {
		// Cookieを設定
		await setAuthCookie(result.token);
	}

	return {
		success: result.success,
		message: result.message,
	};
}

export async function logoutAction() {
	await clearAuthCookie();
	redirect("/login");
}

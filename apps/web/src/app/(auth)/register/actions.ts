"use server";

import { client } from "@/lib/rpc";
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

	try {
		const res = await client.api.v1.auth.register.$post({
			json: { email: parsed.data.email },
		});
		const data = await res.json();

		return {
			success: true,
			message: data.message ?? "確認メールを送信しました",
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: "サーバーエラーが発生しました",
		};
	}
}

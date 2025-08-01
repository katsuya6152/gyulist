"use server";

import { client } from "@/lib/rpc";
import { cookies } from "next/headers";
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

	try {
		const res = await client.api.v1.auth.login.$post({
			json: parseResult.data,
		});

		if (!res.ok) {
			if (res.status === 401) {
				return {
					success: false,
					message: "メールアドレスまたはパスワードが正しくありません。",
				};
			}
			return { success: false, message: "エラーが発生しました:不明なエラー" };
		}

		const resData = await res.json();
		if (!resData.token) {
			return { success: false, message: "トークンの取得に失敗しました" };
		}

		// Cookieを設定
		const cookieStore = await cookies();
		cookieStore.set("token", resData.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});

		// 成功を返す（クライアントサイドでリダイレクト）
		return { success: true, message: "ログインに成功しました" };
	} catch (error) {
		console.error("ログイン処理中にエラー:", error);
		return {
			success: false,
			message: "通信エラーが発生しました。もう一度お試しください。",
		};
	}
}

export async function logoutAction() {
	const cookieStore = await cookies();
	cookieStore.delete("token");
	redirect("/login");
}

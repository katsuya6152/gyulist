import { client } from "@/lib/rpc";
import type { InferRequestType, InferResponseType } from "hono";
import { cookies } from "next/headers";

// 🎯 Hono RPCからの型推論
export type LoginInput = InferRequestType<
	typeof client.api.v1.auth.login.$post
>["json"];

export type RegisterInput = InferRequestType<
	typeof client.api.v1.auth.register.$post
>["json"];

export type LoginResponseType = InferResponseType<
	typeof client.api.v1.auth.login.$post,
	200
>;

export type RegisterResponseType = InferResponseType<
	typeof client.api.v1.auth.register.$post,
	200
>;

// 🔄 フロントエンド用のラッパー型
export type LoginResult = {
	success: boolean;
	message: string;
	token?: string;
};

export type RegisterResult = {
	success: boolean;
	message: string;
};

export async function login(data: LoginInput): Promise<LoginResult> {
	try {
		const res = await client.api.v1.auth.login.$post({
			json: data
		});

		if (!res.ok) {
			if (res.status === 401) {
				return {
					success: false,
					message: "メールアドレスまたはパスワードが正しくありません。"
				};
			}
			return {
				success: false,
				message: "エラーが発生しました:不明なエラー"
			};
		}

		const resData = (await res.json()) as { token?: string };
		if (!resData.token) {
			return {
				success: false,
				message: "トークンの取得に失敗しました"
			};
		}

		return {
			success: true,
			message: "ログインに成功しました",
			token: resData.token
		};
	} catch (error) {
		console.error("ログイン処理中にエラー:", error);
		return {
			success: false,
			message: "通信エラーが発生しました。もう一度お試しください。"
		};
	}
}

export async function register(data: RegisterInput): Promise<RegisterResult> {
	try {
		const res = await client.api.v1.auth.register.$post({
			json: data
		});
		const responseData = (await res.json()) as { message?: string };

		return {
			success: true,
			message: responseData.message ?? "確認メールを送信しました"
		};
	} catch (error) {
		console.error("登録処理中にエラー:", error);
		return {
			success: false,
			message: "サーバーエラーが発生しました"
		};
	}
}

export async function setAuthCookie(token: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/"
	});
}

export async function clearAuthCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete("token");
}

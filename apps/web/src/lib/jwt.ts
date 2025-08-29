import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface JWTPayload {
	userId: number;
	exp: number;
	[key: string]: unknown;
}

export async function verifyAndGetUserId(): Promise<number> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	// 簡易JWT形式のトークンをデコード（署名検証なし）
	// APIサーバーで生成される簡易JWT形式: header.payload.signature
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			console.error("Invalid JWT format: expected 3 parts, got", parts.length);
			redirect("/login");
		}

		const payload = JSON.parse(atob(parts[1])) as JWTPayload;

		// 有効期限をチェック
		if (payload.exp && payload.exp < Date.now() / 1000) {
			console.error("JWT expired:", new Date(payload.exp * 1000));
			redirect("/login");
		}

		return payload.userId;
	} catch (error) {
		console.error("Failed to decode JWT:", error);
		redirect("/login");
	}
}

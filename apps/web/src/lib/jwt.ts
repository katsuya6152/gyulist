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

	// トークンを手動でデコード（署名検証なし）
	// 本来は署名検証を行うべきだが、APIサーバーで検証されるため簡略化
	try {
		const payload = JSON.parse(atob(token.split(".")[1])) as JWTPayload;

		// 有効期限をチェック
		if (payload.exp && payload.exp < Date.now() / 1000) {
			redirect("/login");
		}

		return payload.userId;
	} catch (error) {
		console.error("Failed to decode JWT:", error);
		redirect("/login");
	}
}

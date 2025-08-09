"use server";

import { verifyAndGetUserId } from "@/lib/jwt";
import { updateTheme } from "@/services/themeService";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction as originalLogoutAction } from "../../app/(auth)/login/actions";

export async function updateThemeAction(theme: "light" | "dark" | "system") {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	try {
		// JWTからユーザーIDを取得
		const userId = await verifyAndGetUserId();
		if (userId === 1) {
			return { success: true, message: "demo" };
		}

		// テーマを更新
		await updateTheme(userId, theme);

		return { success: true };
	} catch (error) {
		console.error("Failed to update theme:", error);
		return { success: false, error: "テーマの更新に失敗しました" };
	}
}

export async function logoutAction() {
	await originalLogoutAction();
}

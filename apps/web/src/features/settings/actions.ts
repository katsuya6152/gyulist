"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
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
		if (isDemo(userId)) {
			return createDemoResponse(true);
		}

		// テーマを更新（systemをautoに変換）
		const apiTheme = theme === "system" ? "auto" : theme;
		await updateTheme(userId, apiTheme);

		return { success: true };
	} catch (error) {
		console.error("Failed to update theme:", error);
		return { success: false, error: "テーマの更新に失敗しました" };
	}
}

export async function logoutAction() {
	await originalLogoutAction();
}

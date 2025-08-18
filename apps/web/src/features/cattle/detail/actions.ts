"use server";

import type { Status } from "@/features/cattle/constants";
import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { DeleteCattle, updateStatus } from "@/services/cattleService";
import { redirect } from "next/navigation";

export async function deleteCattleAction(cattleId: number) {
	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return createDemoResponse(true);
		}

		await DeleteCattle(cattleId);

		return {
			success: true
		};
	} catch (error) {
		console.error("Failed to delete cattle:", error);

		// 認証エラーの場合はリダイレクト
		if (error instanceof Error && error.message.includes("401")) {
			redirect("/login");
		}

		return {
			success: false,
			error: "牛の削除に失敗しました"
		};
	}
}

export async function updateStatusAction(
	cattleId: number,
	status: Status,
	reason?: string
) {
	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return createDemoResponse(true);
		}

		await updateStatus(cattleId, status, reason);
		return { success: true };
	} catch (error) {
		console.error("Failed to update cattle status:", error);
		if (error instanceof Error && error.message.includes("401")) {
			redirect("/login");
		}
		return {
			success: false,
			error: "ステータスの更新に失敗しました"
		};
	}
}

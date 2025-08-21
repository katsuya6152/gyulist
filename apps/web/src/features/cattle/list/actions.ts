"use server";

import { isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { UpdateAlertMemo, UpdateAlertStatus } from "@/services/alertsService";

type ActionResult = {
	success: boolean;
	message: string;
	error?: string;
};

export type UpdateAlertMemoResult = ActionResult;
export type UpdateAlertStatusResult = ActionResult;

const handleActionError = (
	error: unknown,
	defaultMessage: string
): ActionResult => {
	console.error("Action error:", error);

	if (error instanceof Error && error.message.includes("401")) {
		return {
			success: false,
			message: "認証が必要です",
			error: "認証エラー"
		};
	}

	return {
		success: false,
		message: defaultMessage,
		error: error instanceof Error ? error.message : "不明なエラー"
	};
};

export async function updateAlertMemoAction(
	alertId: string,
	memo: string
): Promise<UpdateAlertMemoResult> {
	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return { success: true, message: "demo" };
		}

		const response = await UpdateAlertMemo(alertId, memo);
		return { success: true, message: response.message };
	} catch (error) {
		return handleActionError(error, "メモの更新に失敗しました");
	}
}

export async function updateAlertStatusAction(
	alertId: string,
	status: "acknowledged" | "resolved" | "dismissed"
): Promise<UpdateAlertStatusResult> {
	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return { success: true, message: "demo" };
		}

		const response = await UpdateAlertStatus(alertId, status);
		return { success: true, message: response.message };
	} catch (error) {
		return handleActionError(error, "ステータスの更新に失敗しました");
	}
}

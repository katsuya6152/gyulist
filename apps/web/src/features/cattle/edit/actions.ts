"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { UpdateCattleDetailed } from "@/services/cattleService";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { updateCattleSchema } from "./schema";

export async function updateCattleAction(
	prevState: unknown,
	formData: FormData
) {
	const submission = parseWithZod(formData, {
		schema: updateCattleSchema
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return createDemoResponse("success");
		}

		const data = submission.value;

		// 牛のIDを取得
		const cattleId = formData.get("cattleId") as string;
		if (!cattleId) {
			return submission.reply({
				formErrors: ["牛のIDが見つかりません"]
			});
		}

		// APIに送信するデータを準備（updateCattleSchemaに合わせて）
		const apiData = {
			name: data.name,
			breed: data.breed || undefined,
			producerName: data.producerName ?? undefined,
			barn: data.barn ?? undefined,
			notes: data.notes || undefined,
			...(data.weight != null ? { weight: Number(data.weight) } : {}),
			...(data.score != null ? { score: Number(data.score) } : {})
		};

		await UpdateCattleDetailed(cattleId, apiData);

		// 成功時のレスポンス
		return submission.reply();
	} catch (error) {
		console.error("Failed to update cattle:", error);

		// 認証エラーの場合はリダイレクト
		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		return submission.reply({
			formErrors: ["牛の更新に失敗しました"]
		});
	}
}

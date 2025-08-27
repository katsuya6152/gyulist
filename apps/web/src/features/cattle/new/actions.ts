"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { CreateCattle } from "@/services/cattleService";
import { parseWithZod } from "@conform-to/zod";
import type { createCattleSchema as ApiCreateCattleSchema } from "@repo/api";
import { redirect } from "next/navigation";
import { createCattleSchema } from "./schema";

export async function createCattleAction(
	prevState: unknown,
	formData: FormData
) {
	const submission = parseWithZod(formData, {
		schema: createCattleSchema
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

		await CreateCattle(data as typeof ApiCreateCattleSchema._type);

		// 成功時のレスポンス
		return submission.reply();
	} catch (error) {
		console.error("Failed to create cattle:", error);

		// 認証エラーの場合はリダイレクト
		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		return submission.reply({
			formErrors: ["牛の登録に失敗しました"]
		});
	}
}

"use server";

import { client } from "@/lib/rpc";
import { parseWithZod } from "@conform-to/zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createCattleSchema } from "./schema";

export async function createCattleAction(
	prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: createCattleSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			redirect("/not-found");
		}

		// APIリクエスト用のデータを整形
		const apiData = {
			identificationNumber: Number(submission.value.identificationNumber),
			earTagNumber: Number(submission.value.earTagNumber),
			name: submission.value.name,
			gender: submission.value.gender,
			birthDate: submission.value.birthDate,
			growthStage: submission.value.growthStage,
			breed: submission.value.breed || null,
			notes: submission.value.notes || null,
		};

		const response = await client.api.v1.cattle.$post(
			{
				json: apiData,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (response.status !== 201) {
			const error = await response.text();
			return submission.reply({
				formErrors: [error || "牛の登録に失敗しました"],
			});
		}

		// 成功時のレスポンス
		return submission.reply();
	} catch (error) {
		console.error("Failed to create cattle:", error);
		return submission.reply({
			formErrors: ["牛の登録に失敗しました"],
		});
	}
}

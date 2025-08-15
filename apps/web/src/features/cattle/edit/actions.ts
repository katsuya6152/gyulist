"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import {
	UpdateCattleDetailed,
	type UpdateCattleInput
} from "@/services/cattleService";
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

		// APIに送信するデータを準備（新規任意項目も含めて送信）
		const apiData: UpdateCattleInput = {
			identificationNumber: data.identificationNumber,
			earTagNumber: data.earTagNumber,
			name: data.name,
			gender: data.gender as UpdateCattleInput["gender"],
			birthday: data.birthday,
			growthStage: data.growthStage as UpdateCattleInput["growthStage"],
			...(data.weight != null ? { weight: data.weight } : {}),
			score: data.score ?? null,
			breed: data.breed || null,
			producerName: data.producerName ?? null,
			barn: data.barn ?? null,
			breedingValue: data.breedingValue ?? null,
			notes: data.notes || null,
			// 血統情報
			bloodline: data.bloodline
				? {
						fatherCattleName: data.bloodline.fatherCattleName || null,
						motherFatherCattleName:
							data.bloodline.motherFatherCattleName || null,
						motherGrandFatherCattleName:
							data.bloodline.motherGrandFatherCattleName || null,
						motherGreatGrandFatherCattleName:
							data.bloodline.motherGreatGrandFatherCattleName || null
					}
				: undefined,
			// 繁殖状態（手動入力項目のみ）
			breedingStatus: data.breedingStatus
				? {
						parity: null,
						expectedCalvingDate:
							data.breedingStatus.expectedCalvingDate || null,
						scheduledPregnancyCheckDate:
							data.breedingStatus.scheduledPregnancyCheckDate || null,
						daysAfterCalving: null,
						daysOpen: null,
						pregnancyDays: null,
						daysAfterInsemination: null,
						inseminationCount: null,
						breedingMemo: data.breedingStatus.breedingMemo || null,
						isDifficultBirth: data.breedingStatus.isDifficultBirth ?? null
					}
				: undefined
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

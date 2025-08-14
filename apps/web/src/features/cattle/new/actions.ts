"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { CreateCattle, type CreateCattleInput } from "@/services/cattleService";
import { parseWithZod } from "@conform-to/zod";
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
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return createDemoResponse("success");
		}

		const data = submission.value;

		// APIに送信するデータを準備
		const apiData: CreateCattleInput = {
			identificationNumber: data.identificationNumber,
			earTagNumber: data.earTagNumber,
			name: data.name,
			gender: data.gender,
			birthday: data.birthday,
			growthStage: data.growthStage as CreateCattleInput["growthStage"],
			score: data.score ?? null,
			breed: data.breed || null,
			producerName: data.producerName ?? null,
			barn: data.barn ?? null,
			breedingValue: data.breedingValue ?? null,
			notes: data.notes || null,
			status: "HEALTHY", // デフォルトで健康ステータスを設定
			...(data.weight != null ? { weight: data.weight } : {}),
		};

		// 血統情報/繁殖状態のキーは、テスト互換のため常に存在させる
		(apiData as CreateCattleInput).bloodline = data.bloodline
			? {
					fatherCattleName: data.bloodline.fatherCattleName || null,
					motherFatherCattleName: data.bloodline.motherFatherCattleName || null,
					motherGrandFatherCattleName:
						data.bloodline.motherGrandFatherCattleName || null,
					motherGreatGrandFatherCattleName:
						data.bloodline.motherGreatGrandFatherCattleName || null,
				}
			: undefined;
		(apiData as CreateCattleInput).breedingStatus = data.breedingStatus
			? {
					parity: null,
					expectedCalvingDate: data.breedingStatus.expectedCalvingDate || null,
					scheduledPregnancyCheckDate:
						data.breedingStatus.scheduledPregnancyCheckDate || null,
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: null,
					breedingMemo: data.breedingStatus.breedingMemo || null,
					isDifficultBirth: data.breedingStatus.isDifficultBirth ?? null,
				}
			: undefined;

		await CreateCattle(apiData);

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
			formErrors: ["牛の登録に失敗しました"],
		});
	}
}

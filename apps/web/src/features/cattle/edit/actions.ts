"use server";

import { client } from "@/lib/rpc";
import { parseWithZod } from "@conform-to/zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateCattleSchema } from "./schema";

export async function updateCattleAction(
	prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: updateCattleSchema,
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

		const data = submission.value;

		// APIに送信するデータを準備
		const apiData = {
			identificationNumber: data.identificationNumber,
			earTagNumber: data.earTagNumber,
			name: data.name,
			gender: data.gender,
			birthday: data.birthday,
			growthStage: data.growthStage,
			breed: data.breed || null,
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
							data.bloodline.motherGreatGrandFatherCattleName || null,
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
						isDifficultBirth: data.breedingStatus.isDifficultBirth ?? null,
					}
				: undefined,
		};

		// 牛のIDを取得（URLから取得する必要があります）
		const cattleId = formData.get("cattleId") as string;
		if (!cattleId) {
			return submission.reply({
				formErrors: ["牛のIDが見つかりません"],
			});
		}

		const response = await client.api.v1.cattle[":id"].$patch(
			{
				param: { id: cattleId },
				json: apiData,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (response.status !== 200) {
			const error = await response.text();
			return submission.reply({
				formErrors: [error || "牛の更新に失敗しました"],
			});
		}

		// 成功時のレスポンス
		return submission.reply();
	} catch (error) {
		console.error("Failed to update cattle:", error);
		return submission.reply({
			formErrors: ["牛の更新に失敗しました"],
		});
	}
}

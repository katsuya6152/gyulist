"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import { CreateEvent, type CreateEventInput } from "@/services/eventService";
import { parseWithZod } from "@conform-to/zod";
import { parseISO } from "date-fns";
import { type CreateEventFormData, createEventSchema } from "./schema";

export async function createEventAction(
	prevState: unknown,
	formData: FormData
) {
	const submission = parseWithZod(formData, {
		schema: createEventSchema
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	try {
		const userId = await verifyAndGetUserId();
		if (isDemo(userId)) {
			return {
				status: "success" as const,
				message: "demo"
			};
		}

		const { cattleId, eventType, eventDate, eventTime, notes } =
			submission.value as CreateEventFormData;

		// 日付と時刻を結合してISO形式に変換
		// eventDate: YYYY-MM-DD形式、eventTime: HH:MM形式
		// 結合後: YYYY-MM-DDTHH:MM:00.000Z（ISO 8601形式）
		const eventDatetime = parseISO(`${eventDate}T${eventTime}`).toISOString();

		await CreateEvent({
			cattleId,
			eventType: eventType as CreateEventInput["eventType"],
			eventDatetime,
			notes
		});

		return {
			status: "success" as const,
			message: "イベントが正常に登録されました"
		};
	} catch (error) {
		console.error("Event creation error:", error);
		return {
			status: "error" as const,
			message: "イベントの登録中にエラーが発生しました"
		};
	}
}

"use server";

import { verifyAndGetUserId } from "@/lib/jwt";
import { CreateEvent } from "@/services/eventService";
import { parseWithZod } from "@conform-to/zod";
import { format, parseISO } from "date-fns";
import { redirect } from "next/navigation";
import { createEventSchema } from "./schema";
export async function createEventAction(
	prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: createEventSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const userId = await verifyAndGetUserId();
	if (userId === 1) {
		return { status: "success" as const, message: "demo" };
	}

	try {
		const { cattleId, eventType, eventDate, eventTime, notes } =
			submission.value;

		// 日付と時刻を結合してISO形式に変換（タイムゾーンを考慮）
		const eventDatetime = parseISO(`${eventDate}T${eventTime}`).toISOString();

		await CreateEvent({
			cattleId,
			eventType,
			eventDatetime,
			notes,
		});

		return {
			status: "success" as const,
			message: "イベントが正常に登録されました",
		};
	} catch (error) {
		console.error("Event creation error:", error);
		return {
			status: "error" as const,
			message: "イベントの登録中にエラーが発生しました",
		};
	}
}

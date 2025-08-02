"use server";

import { SearchEvents } from "@/services/eventService";
import type { SearchEventsQuery } from "@/services/eventService";
import { addDays, endOfDay, startOfDay } from "date-fns";

export type DateFilter =
	| "all"
	| "today"
	| "tomorrow"
	| "dayAfterTomorrow"
	| "custom";

export async function getFilteredEvents(
	filter: DateFilter = "all",
	customDate?: string,
) {
	try {
		let searchParams: SearchEventsQuery = { limit: 50 };

		if (filter !== "all") {
			const today = new Date();
			let targetDate: Date;

			switch (filter) {
				case "today":
					targetDate = today;
					break;
				case "tomorrow":
					targetDate = addDays(today, 1);
					break;
				case "dayAfterTomorrow":
					targetDate = addDays(today, 2);
					break;
				case "custom":
					if (!customDate) {
						throw new Error("カスタム日付が指定されていません");
					}
					targetDate = new Date(customDate);
					break;
				default:
					targetDate = today;
			}

			// 指定日の開始時刻と終了時刻を設定
			const startDate = startOfDay(targetDate).toISOString();
			const endDate = endOfDay(targetDate).toISOString();

			searchParams = {
				...searchParams,
				startDate,
				endDate,
			};
		}

		const eventsData = await SearchEvents(searchParams);
		return {
			success: true,
			events: eventsData.results,
			filter,
			customDate,
		};
	} catch (error) {
		console.error("Failed to fetch filtered events:", error);
		return {
			success: false,
			events: [],
			filter,
			customDate,
			error: "イベントの取得に失敗しました",
		};
	}
}

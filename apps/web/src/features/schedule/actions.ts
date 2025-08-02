"use server";

import { SearchEvents } from "@/services/eventService";
import type { SearchEventsQuery } from "@/services/eventService";
import { addDays, endOfDay, startOfDay } from "date-fns";

export type DateFilter = "all" | "today" | "tomorrow" | "dayAfterTomorrow";

export async function getFilteredEvents(filter: DateFilter = "all") {
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
		};
	} catch (error) {
		console.error("Failed to fetch filtered events:", error);
		return {
			success: false,
			events: [],
			filter,
			error: "イベントの取得に失敗しました",
		};
	}
}

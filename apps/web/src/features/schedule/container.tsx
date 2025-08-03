import { SearchEvents } from "@/services/eventService";
import type { SearchEventsQuery } from "@/services/eventService";
import { endOfDay, startOfDay } from "date-fns";
import { SchedulePresentation } from "./presentational";
import { type DateFilter, getTargetDate } from "./utils";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ScheduleContainer({ searchParams }: Props) {
	const params = await searchParams;
	const filter = Array.isArray(params.filter)
		? params.filter[0]
		: params.filter;
	const customDate = Array.isArray(params.date) ? params.date[0] : params.date;

	// フィルターの型安全性を確保
	const validFilter: DateFilter =
		filter === "today" ||
		filter === "tomorrow" ||
		filter === "dayAfterTomorrow" ||
		filter === "all" ||
		filter === "custom"
			? filter
			: "all";

	// SearchEventsQuery を構築
	const searchQuery: SearchEventsQuery = {
		limit: 50,
	};

	const targetDate = getTargetDate(validFilter, customDate);
	if (targetDate) {
		searchQuery.startDate = startOfDay(targetDate).toISOString();
		searchQuery.endDate = endOfDay(targetDate).toISOString();
	}

	try {
		// eventService.ts の SearchEvents を使用
		const eventsData = await SearchEvents(searchQuery);

		return (
			<SchedulePresentation
				events={eventsData.results || []}
				currentFilter={validFilter}
				customDate={customDate}
				error={undefined}
			/>
		);
	} catch (error) {
		console.error("Failed to fetch events:", error);

		return (
			<SchedulePresentation
				events={[]}
				currentFilter={validFilter}
				customDate={customDate}
				error="イベントの取得に失敗しました"
			/>
		);
	}
}

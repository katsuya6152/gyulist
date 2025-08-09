import { SearchEvents } from "@/services/eventService";
import type { SearchEventsQuery } from "@/services/eventService";
import { endOfDay, startOfDay } from "date-fns";
import type { DateFilter } from "./constants";
import { SchedulePresentation } from "./presentational";

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

	// カスタム日付の場合のみ日付フィルタリングを適用
	if (validFilter === "custom" && customDate) {
		const targetDate = new Date(customDate);
		searchQuery.startDate = startOfDay(targetDate).toISOString();
		searchQuery.endDate = endOfDay(targetDate).toISOString();
	}
	// それ以外の場合は全てのイベントを取得し、プレゼンテーション層でフィルタリング

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

		// エラーの種類に応じて適切なメッセージを表示
		let errorMessage = "イベントの取得に失敗しました";

		if (error instanceof Error) {
			if (error.message.includes("401") || error.message.includes("403")) {
				errorMessage = "認証が必要です。ログインしてください。";
			} else if (error.message.includes("Network")) {
				errorMessage = "ネットワーク接続を確認してください。";
			} else if (error.message.includes("timeout")) {
				errorMessage =
					"リクエストがタイムアウトしました。しばらく経ってから再試行してください。";
			}
		}

		return (
			<SchedulePresentation
				events={[]}
				currentFilter={validFilter}
				customDate={customDate}
				error={errorMessage}
			/>
		);
	}
}

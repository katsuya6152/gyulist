import { SearchEvents } from "@/services/eventService";
import { endOfDay, startOfDay } from "date-fns";
import { HomePresentation } from "./presentational";

export default async function HomeContainer() {
	const today = new Date();
	const start = startOfDay(today).toISOString();
	const end = endOfDay(today).toISOString();

	try {
		const eventsData = await SearchEvents({
			startDate: start,
			endDate: end,
			limit: 100,
		});
		return (
			<HomePresentation
				todayEvents={eventsData.results || []}
				error={undefined}
			/>
		);
	} catch (error) {
		console.error("Failed to fetch today's events:", error);
		return (
			<HomePresentation
				todayEvents={[]}
				error="今日のイベント取得に失敗しました"
			/>
		);
	}
}

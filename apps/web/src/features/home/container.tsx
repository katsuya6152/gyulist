import { GetAlerts } from "@/services/alertsService";
import { GetCattleStatusCounts } from "@/services/cattleService";
import { SearchEvents } from "@/services/eventService";
import { endOfDay, startOfDay } from "date-fns";
import { HomePresentation } from "./presentational";

export default async function HomeContainer() {
	const today = new Date();
	const start = startOfDay(today).toISOString();
	const end = endOfDay(today).toISOString();

	try {
		const [eventsData, statusCounts, alerts] = await Promise.all([
			SearchEvents({ startDate: start, endDate: end, limit: 100 }),
			GetCattleStatusCounts(),
			GetAlerts(),
		]);
		return (
			<HomePresentation
				todayEvents={eventsData.results || []}
				statusCounts={statusCounts.counts}
				alerts={alerts.results}
				error={undefined}
			/>
		);
	} catch (error) {
		console.error("Failed to fetch data for home:", error);
		return (
			<HomePresentation
				todayEvents={[]}
				statusCounts={{
					HEALTHY: 0,
					PREGNANT: 0,
					RESTING: 0,
					TREATING: 0,
					SHIPPED: 0,
					DEAD: 0,
				}}
				alerts={[]}
				error="データ取得に失敗しました"
			/>
		);
	}
}

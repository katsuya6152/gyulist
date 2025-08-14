import { GetAlerts } from "@/services/alertsService";
import { GetBreedingKpi } from "@/services/breedingKpiService";
import { GetCattleStatusCounts } from "@/services/cattleService";
import { SearchEvents } from "@/services/eventService";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { HomePresentation } from "./presentational";

export default async function HomeContainer() {
	const today = new Date();
	const start = startOfDay(today).toISOString();
	const end = endOfDay(today).toISOString();
	// KPIは当月で集計
	const monthStart = startOfMonth(today).toISOString();
	const monthEnd = endOfMonth(today).toISOString();

	try {
		const [eventsData, statusCounts, alerts, kpi] = await Promise.all([
			SearchEvents({ startDate: start, endDate: end, limit: 100 }),
			GetCattleStatusCounts(),
			GetAlerts(),
			GetBreedingKpi({ from: monthStart, to: monthEnd }),
		]);
		return (
			<HomePresentation
				todayEvents={eventsData.results || []}
				statusCounts={statusCounts.counts}
				alerts={alerts.results}
				breedingKpi={kpi.metrics}
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
				breedingKpi={{
					conceptionRate: null,
					avgDaysOpen: null,
					avgCalvingInterval: null,
					aiPerConception: null,
				}}
				error="データ取得に失敗しました"
			/>
		);
	}
}

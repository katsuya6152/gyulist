import { GetAlerts } from "@/services/alertsService";
import { GetBreedingKpiDelta } from "@/services/breedingKpiDeltaService";
import { GetBreedingKpi } from "@/services/breedingKpiService";
import { GetStatusCounts } from "@/services/cattleService";
import { SearchEvents } from "@/services/eventService";
import {
	endOfDay,
	endOfMonth,
	format,
	startOfDay,
	startOfMonth
} from "date-fns";
import { HomePresentation } from "./presentational";

export default async function HomeContainer() {
	const today = new Date();
	const start = startOfDay(today).toISOString();
	const end = endOfDay(today).toISOString();
	// KPIは当月で集計
	const monthStart = startOfMonth(today).toISOString();
	const monthEnd = endOfMonth(today).toISOString();

	// ダミートレンド生成は廃止（APIのデルタのみ使用）

	try {
		const [eventsData, statusCounts, alerts, kpi, kpiDelta] =
			await Promise.allSettled([
				SearchEvents({ startDate: start, endDate: end, limit: 100 }),
				GetStatusCounts(),
				GetAlerts(),
				GetBreedingKpi({ from: monthStart, to: monthEnd }),
				// 前月比のみ必要なので delta API を利用
				GetBreedingKpiDelta({ month: format(today, "yyyy-MM") })
			]);

		return (
			<HomePresentation
				todayEvents={
					eventsData.status === "fulfilled" ? eventsData.value.results : []
				}
				statusCounts={
					statusCounts.status === "fulfilled"
						? statusCounts.value
						: {
								HEALTHY: 0,
								PREGNANT: 0,
								RESTING: 0,
								TREATING: 0,
								SHIPPED: 0,
								DEAD: 0
							}
				}
				alerts={
					alerts.status === "fulfilled"
						? alerts.value.results.map((alert) => ({
								alertId: alert.id,
								type: alert.type,
								severity: alert.severity as "high" | "medium" | "low",
								cattleId: alert.cattleId,
								cattleName: alert.cattleName,
								cattleEarTagNumber: String(alert.cattleEarTagNumber),
								dueAt: alert.dueAt,
								message: alert.message
							}))
						: []
				}
				breedingKpi={
					kpi.status === "fulfilled"
						? kpi.value.metrics
						: {
								conceptionRate: null,
								avgDaysOpen: null,
								avgCalvingInterval: null,
								aiPerConception: null
							}
				}
				// KPIトレンドは前月比のみ使用
				kpiTrendDeltas={
					kpiDelta.status === "fulfilled" && kpiDelta.value.month
						? [{ month: kpiDelta.value.month, metrics: kpiDelta.value.delta }]
						: []
				}
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
					DEAD: 0
				}}
				alerts={[]}
				breedingKpi={{
					conceptionRate: null,
					avgDaysOpen: null,
					avgCalvingInterval: null,
					aiPerConception: null
				}}
				kpiTrendDeltas={[]}
				error="データ取得に失敗しました"
			/>
		);
	}
}

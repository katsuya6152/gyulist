"use client";

import { AlertsCard } from "./components/AlertsCard";
import { BreedingKpiCard } from "./components/BreedingKpiCard";
import { StatusCountsCard } from "./components/StatusCountsCard";
import { TodayEventsCard } from "./components/TodayEventsCard";
import type { HomePresentationProps } from "./types";

export function HomePresentation({
	todayEvents,
	statusCounts,
	alerts,
	breedingKpi,
	error
}: HomePresentationProps) {
	return (
		<div className="container mx-auto px-4 py-4 space-y-3">
			<TodayEventsCard todayEvents={todayEvents} error={error} />
			<AlertsCard alerts={alerts} />
			<StatusCountsCard statusCounts={statusCounts} />
			<BreedingKpiCard breedingKpi={breedingKpi} />
		</div>
	);
}

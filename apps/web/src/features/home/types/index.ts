export interface TodayEvent {
	eventId: number;
	cattleId: number;
	eventType: string;
	eventDatetime: string;
	notes: string | null;
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
}

export interface StatusCounts {
	HEALTHY: number;
	PREGNANT: number;
	RESTING: number;
	TREATING: number;
	SHIPPED: number;
	DEAD: number;
}

export interface Alert {
	alertId: string;
	type: string;
	severity: "high" | "medium" | "low";
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
	message: string;
}

export interface BreedingKpi {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
}

export interface HomePresentationProps {
	todayEvents: TodayEvent[];
	statusCounts: StatusCounts;
	alerts: Alert[];
	breedingKpi: BreedingKpi;
	error?: string;
}

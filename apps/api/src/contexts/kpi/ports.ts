import type { Result } from "../../shared/result";

export type RawEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
};

export type TrendPoint = {
	month: string;
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
	counts: Record<string, number>;
};

export type TrendDelta = {
	month: string;
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
};

export interface KpiRepoPort {
	findEventsForBreedingKpi(
		ownerUserId: number,
		fromIso?: string,
		toIso?: string
	): Promise<RawEvent[]>;
	getBreedingKpiTrends(
		ownerUserId: number,
		params: {
			toMonth?: string;
			months?: number;
			fromMonth?: string;
		}
	): Promise<{ series: TrendPoint[]; deltas: TrendDelta[] }>;
}

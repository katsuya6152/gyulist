/**
 * KPI Database Mapper
 * Provides mapping functions between database records and KPI domain entities
 */

import type {
	BreedingMetrics,
	KpiEvent,
	TrendDelta,
	TrendPoint
} from "../../../domain/types/kpi";
import type {
	AIPerConception,
	AverageCalvingInterval,
	AverageDaysOpen,
	BreedingEventType,
	ConceptionRate,
	MonthPeriod,
	TrendCounts
} from "../../../domain/types/kpi/KpiTypes";
import type { KpiEventId } from "../../../domain/types/kpi/KpiTypes";
import type { CattleId } from "../../../shared/brand";

/**
 * Raw event data from database
 */
export type RawKpiEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
	eventId?: number;
};

/**
 * Raw trend point data from database calculations
 */
export type RawTrendPoint = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
	counts: Record<string, number>;
};

/**
 * Raw trend delta data from database calculations
 */
export type RawTrendDelta = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
};

/**
 * Maps raw database event to KpiEvent domain entity
 */
export function mapRawEventToKpiEvent(raw: RawKpiEvent): KpiEvent {
	return {
		eventId: (raw.eventId ?? 0) as unknown as KpiEventId,
		cattleId: raw.cattleId as CattleId,
		eventType: raw.eventType as BreedingEventType,
		eventDatetime: new Date(raw.eventDatetime),
		metadata: {},
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

/**
 * Maps array of raw database events to KpiEvent domain entities
 */
export function mapRawEventsToKpiEvents(rawEvents: RawKpiEvent[]): KpiEvent[] {
	return rawEvents.map(mapRawEventToKpiEvent);
}

/**
 * Maps raw trend point to TrendPoint domain entity
 */
export function mapRawTrendPointToTrendPoint(raw: RawTrendPoint): TrendPoint {
	return {
		period: raw.month as unknown as MonthPeriod,
		metrics: {
			conceptionRate: raw.metrics.conceptionRate as ConceptionRate | null,
			averageDaysOpen: raw.metrics
				.avgDaysOpen as unknown as AverageDaysOpen | null,
			averageCalvingInterval: raw.metrics
				.avgCalvingInterval as unknown as AverageCalvingInterval | null,
			aiPerConception: raw.metrics.aiPerConception as AIPerConception | null
		},
		counts: {
			inseminations: raw.counts.inseminations ?? 0,
			conceptions: raw.counts.conceptions ?? 0,
			calvings: raw.counts.calvings ?? 0,
			pairsForDaysOpen: raw.counts.pairsForDaysOpen ?? 0,
			totalEvents: raw.counts.totalEvents ?? 0
		} as TrendCounts,
		periodString: raw.month
	};
}

/**
 * Maps array of raw trend points to TrendPoint domain entities
 */
export function mapRawTrendPointsToTrendPoints(
	rawTrendPoints: RawTrendPoint[]
): TrendPoint[] {
	return rawTrendPoints.map(mapRawTrendPointToTrendPoint);
}

/**
 * Maps raw trend delta to TrendDelta domain entity
 */
export function mapRawTrendDeltaToTrendDelta(raw: RawTrendDelta): TrendDelta {
	return {
		period: raw.month as unknown as MonthPeriod,
		metrics: {
			conceptionRate: raw.metrics.conceptionRate as ConceptionRate | null,
			averageDaysOpen: raw.metrics
				.avgDaysOpen as unknown as AverageDaysOpen | null,
			averageCalvingInterval: raw.metrics
				.avgCalvingInterval as unknown as AverageCalvingInterval | null,
			aiPerConception: raw.metrics.aiPerConception as AIPerConception | null
		},
		periodString: raw.month,
		changes: {
			conceptionRate: "stable" as const,
			averageDaysOpen: "stable" as const,
			averageCalvingInterval: "stable" as const,
			aiPerConception: "stable" as const
		}
	};
}

/**
 * Maps array of raw trend deltas to TrendDelta domain entities
 */
export function mapRawTrendDeltasToTrendDeltas(
	rawTrendDeltas: RawTrendDelta[]
): TrendDelta[] {
	return rawTrendDeltas.map(mapRawTrendDeltaToTrendDelta);
}

/**
 * Maps breeding metrics calculation result to BreedingMetrics domain entity
 */
export function mapCalculationToBreedingMetrics(
	conceptionRate: number | null,
	avgDaysOpen: number | null,
	avgCalvingInterval: number | null,
	aiPerConception: number | null
): BreedingMetrics {
	return {
		conceptionRate: conceptionRate as ConceptionRate | null,
		averageDaysOpen: avgDaysOpen as unknown as AverageDaysOpen | null,
		averageCalvingInterval:
			avgCalvingInterval as unknown as AverageCalvingInterval | null,
		aiPerConception: aiPerConception as AIPerConception | null
	};
}

/**
 * Normalizes KPI data for calculation
 * Handles null values and NaN values appropriately
 */
export function normalizeKpiData(
	data: Record<string, unknown>
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		// null値を0に変換（KPI計算では0として扱う）
		if (value === null || value === undefined) {
			result[key] = 0;
		} else if (typeof value === "number" && Number.isNaN(value)) {
			result[key] = 0;
		} else {
			result[key] = value;
		}
	}

	return result;
}

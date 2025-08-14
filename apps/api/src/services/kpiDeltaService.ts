import type { AnyD1Database } from "drizzle-orm/d1";
import { getBreedingKpiTrends } from "./kpiTrendsService";

export async function getBreedingKpiDelta(
	db: AnyD1Database,
	ownerUserId: number,
	params: { month?: string },
): Promise<{
	month: string | null;
	delta: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
}> {
	const toMonth = params.month;
	const trends = await getBreedingKpiTrends(db, ownerUserId, {
		toMonth,
		months: 2,
	});
	const last = trends.deltas.at(-1);
	if (!last) {
		return {
			month: null,
			delta: {
				conceptionRate: null,
				avgDaysOpen: null,
				avgCalvingInterval: null,
				aiPerConception: null,
			},
		};
	}
	return { month: last.month, delta: last.metrics };
}

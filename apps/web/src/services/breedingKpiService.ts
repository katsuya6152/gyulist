import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";

export type BreedingKpiMetrics = {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
};

export type GetBreedingKpiRes = {
	metrics: BreedingKpiMetrics;
	counts: {
		inseminations: number;
		conceptions: number;
		calvings: number;
		totalEvents: number;
	};
	period: {
		from: string;
		to: string;
	};
	summary: {
		totalEvents: number;
		dataQuality: string;
		calculatedAt: string;
	};
};

export async function GetBreedingKpi(params?: {
	from?: string;
	to?: string;
}): Promise<GetBreedingKpiRes> {
	return fetchWithAuth<{ data: GetBreedingKpiRes }>((token) =>
		client.api.v1.kpi.breeding.$get(
			{
				query: {
					from: params?.from,
					to: params?.to
				}
			},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	).then((r) => r.data);
}

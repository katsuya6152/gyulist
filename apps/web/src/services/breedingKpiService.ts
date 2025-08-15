import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { BreedingKpiResponse } from "@repo/api";

export type BreedingKpiMetrics = {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
};

export type GetBreedingKpiRes = BreedingKpiResponse;

export async function GetBreedingKpi(params?: {
	from?: string;
	to?: string;
}): Promise<GetBreedingKpiRes> {
	return fetchWithAuth<GetBreedingKpiRes>((token) =>
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
	);
}

import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { BreedingKpiDeltaResponse } from "@repo/api";

export type BreedingKpiDeltaRes = BreedingKpiDeltaResponse;

export async function GetBreedingKpiDelta(params?: {
	month?: string; // YYYY-MM
}): Promise<BreedingKpiDeltaRes> {
	return fetchWithAuth<BreedingKpiDeltaRes>((token) =>
		client.api.v1.kpi.breeding.delta.$get(
			{
				query: {
					month: params?.month
				}
			},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	);
}

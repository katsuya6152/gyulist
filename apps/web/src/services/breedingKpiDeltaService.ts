import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";

export type BreedingKpiDeltaRes = {
	month: string | null;
	delta: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
};

export async function GetBreedingKpiDelta(params?: {
	month?: string; // YYYY-MM
}): Promise<BreedingKpiDeltaRes> {
	return fetchWithAuth<BreedingKpiDeltaRes>((token) =>
		client.api.v1.kpi.breeding.delta.$get(
			{
				query: {
					month: params?.month,
				},
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		),
	);
}

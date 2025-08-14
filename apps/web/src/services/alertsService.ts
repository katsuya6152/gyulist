import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";

export type Alert = {
	alertId: string;
	type:
		| "OPEN_DAYS_OVER60_NO_AI"
		| "CALVING_WITHIN_60"
		| "CALVING_OVERDUE"
		| "ESTRUS_OVER20_NOT_PREGNANT";
	severity: "high" | "medium" | "low";
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
	message: string;
};

export type GetAlertsRes = { results: Alert[] };

export async function GetAlerts(): Promise<GetAlertsRes> {
	return fetchWithAuth<GetAlertsRes>((token) =>
		client.api.v1.alerts.$get(
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		),
	);
}

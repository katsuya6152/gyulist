import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { AlertsResponse } from "@repo/api";
import type { InferResponseType } from "hono";

// 🎯 Hono RPCからの型推論
export type GetAlertsRes = AlertsResponse;

export type Alert = GetAlertsRes;

// 🔄 共通型の再エクスポート
export type { AlertType, AlertSeverity } from "@repo/api";

export async function GetAlerts(): Promise<GetAlertsRes> {
	return fetchWithAuth<{ data: GetAlertsRes }>((token) =>
		client.api.v1.alerts.$get(
			{},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	).then((r) => r.data);
}

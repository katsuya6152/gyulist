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

// メモ更新用の関数
export async function UpdateAlertMemo(
	alertId: string,
	memo: string
): Promise<{ message: string }> {
	return fetchWithAuth<{ message: string }>((token) =>
		client.api.v1.alerts[":id"].memo.$put(
			{
				param: { id: alertId },
				json: { memo }
			},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	);
}

// アラートステータス更新用の関数
export async function UpdateAlertStatus(
	alertId: string,
	status: "acknowledged" | "resolved" | "dismissed"
): Promise<{ message: string }> {
	return fetchWithAuth<{ message: string }>((token) =>
		client.api.v1.alerts[":id"].status.$put(
			{
				param: { id: alertId },
				json: { status }
			},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	);
}

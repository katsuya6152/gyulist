import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type {
	Status,
	cattleListResponseSchema,
	cattleResponseSchema,
	cattleStatusCountsResponseSchema,
	createCattleSchema,
	updateCattleSchema
} from "@repo/api";

export type GetCattleListResType = typeof cattleListResponseSchema._type.data;
export type GetCattleDetailResType = typeof cattleResponseSchema._type;

export type CattleListQueryParams = {
	cursor?: string;
	limit?: string;
	sort_by?: string;
	sort_order?: string;
	search?: string;
	growth_stage?: string;
	gender?: string;
	status?: string;
	has_alert?: string;
};

export async function GetCattleList(
	queryParams: CattleListQueryParams = {}
): Promise<GetCattleListResType> {
	return fetchWithAuth<{ data: GetCattleListResType }>((token) =>
		client.api.v1.cattle.$get(
			{
				query: {
					cursor: queryParams.cursor,
					limit: queryParams.limit,
					sort_by: queryParams.sort_by,
					sort_order: queryParams.sort_order,
					search: queryParams.search,
					growth_stage: queryParams.growth_stage,
					gender: queryParams.gender,
					status: queryParams.status,
					has_alert: queryParams.has_alert
				} as Record<string, string | undefined>
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	).then((r) => r.data);
}

export async function GetCattleDetail(
	id: number | string
): Promise<GetCattleDetailResType> {
	return fetchWithAuth<GetCattleDetailResType>((token) =>
		client.api.v1.cattle[":id"].$get(
			{
				param: { id: id.toString() }
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

export async function DeleteCattle(id: number | string): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].$delete(
			{
				param: { id: id.toString() }
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

export async function updateStatus(
	id: number | string,
	status: Status,
	reason?: string
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].$patch(
			{
				param: { id: id.toString() },
				json: { notes: reason } // Use notes field instead of status
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

export async function UpdateCattle(
	id: number | string,
	data: {
		name?: string;
		breed?: string;
		producerName?: string;
		barn?: string;
		notes?: string;
		weight?: number;
		score?: number;
	}
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].$patch(
			{
				param: { id: id.toString() },
				json: data
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

// 型は @repo/api の共有型を使用する

export async function CreateCattle(
	data: typeof createCattleSchema._type
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle.$post(
			{
				json: data
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

export async function UpdateCattleDetailed(
	id: number | string,
	data: typeof updateCattleSchema._type
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].$patch(
			{
				param: { id: id.toString() },
				json: data
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

// ステータス別頭数取得
export type GetStatusCountsRes = typeof cattleStatusCountsResponseSchema._type;

export async function GetStatusCounts(): Promise<GetStatusCountsRes> {
	return fetchWithAuth<{ data: GetStatusCountsRes }>((token) =>
		client.api.v1.cattle["status-counts"].$get(
			{},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	).then((r) => r.data);
}

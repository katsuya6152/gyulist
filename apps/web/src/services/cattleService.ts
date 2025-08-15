import type { CattleStatus } from "@/features/cattle/constants";
import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type {
	CattleListResponse,
	CattleResponse,
	CattleStatusCountsResponse,
	CreateCattleInput,
	UpdateCattleInput
} from "@repo/api";

export type GetCattleListResType = CattleListResponse;

export type GetCattleDetailResType = CattleResponse;

export type CattleListQueryParams = {
	cursor?: string;
	limit?: string;
	sort_by?: string;
	sort_order?: string;
	search?: string;
	growth_stage?: string;
	gender?: string;
	status?: string;
};

export async function GetCattleList(
	queryParams: CattleListQueryParams = {}
): Promise<GetCattleListResType> {
	return fetchWithAuth<GetCattleListResType>((token) =>
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
					status: queryParams.status
				}
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
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

export async function updateCattleStatus(
	id: number | string,
	status: CattleStatus,
	reason?: string
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].status.$patch(
			{
				param: { id: id.toString() },
				json: { status, reason }
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
		identificationNumber: number;
		earTagNumber: number;
		name: string;
		gender: "オス" | "メス";
		birthday: string;
		growthStage:
			| "CALF"
			| "GROWING"
			| "FATTENING"
			| "FIRST_CALVED"
			| "MULTI_PAROUS";
		breed?: string | null;
		notes?: string | null;
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

export async function CreateCattle(data: CreateCattleInput): Promise<void> {
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
	data: UpdateCattleInput
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
export type GetCattleStatusCountsRes = CattleStatusCountsResponse;

export async function GetCattleStatusCounts(): Promise<GetCattleStatusCountsRes> {
	return fetchWithAuth<GetCattleStatusCountsRes>((token) =>
		client.api.v1.cattle["status-counts"].$get(
			{},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	);
}

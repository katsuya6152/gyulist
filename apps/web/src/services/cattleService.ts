import type { CattleStatus } from "@/features/cattle/constants";
import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";

export type GetCattleListResType = InferResponseType<
	typeof client.api.v1.cattle.$get,
	200
>;

export type GetCattleDetailResType = InferResponseType<
	(typeof client.api.v1.cattle)[":id"]["$get"],
	200
>;

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
		gender: string;
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

export type CreateCattleInput = {
	identificationNumber: number;
	earTagNumber: number;
	name: string;
	gender: string;
	birthday: string;
	growthStage:
		| "CALF"
		| "GROWING"
		| "FATTENING"
		| "FIRST_CALVED"
		| "MULTI_PAROUS";
	weight?: number | null;
	score?: number | null;
	breed: string | null;
	producerName?: string | null;
	barn?: string | null;
	breedingValue?: string | null;
	notes: string | null;
	status?: "HEALTHY" | "PREGNANT" | "RESTING" | "TREATING" | "SHIPPED" | "DEAD";
	bloodline?: {
		fatherCattleName: string | null;
		motherFatherCattleName: string | null;
		motherGrandFatherCattleName: string | null;
		motherGreatGrandFatherCattleName: string | null;
	};
	breedingStatus?: {
		parity: number | null;
		expectedCalvingDate: string | null;
		scheduledPregnancyCheckDate: string | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number | null;
		breedingMemo: string | null;
		isDifficultBirth: boolean | null;
	};
	breedingSummary?: {
		totalInseminationCount: number | null;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number | null;
		pregnancyHeadCount: number | null;
		pregnancySuccessRate: number | null;
	};
};

export type UpdateCattleInput = CreateCattleInput;

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
export type GetCattleStatusCountsRes = {
	counts: Record<
		"HEALTHY" | "PREGNANT" | "RESTING" | "TREATING" | "SHIPPED" | "DEAD",
		number
	>;
};

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

import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type {
	CattleListResponse,
	CattleResponse,
	CattleStatusCountsResponse,
	CreateCattleInput,
	Status,
	UpdateCattleInput
} from "@repo/api";

export type GetCattleListResType = CattleListResponse;

// CattleResponseではなく、cattleResponseSchemaの型を使用
export type GetCattleDetailResType = CattleResponse & {
	breedingSummary?: {
		breedingSummaryId: number;
		cattleId: number;
		totalInseminationCount: number | null;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number | null;
		pregnancyHeadCount: number | null;
		pregnancySuccessRate: number | null;
		createdAt: string;
		updatedAt: string;
	} | null;
	bloodline?: {
		bloodlineId: number;
		cattleId: number;
		fatherCattleName: string | null;
		motherFatherCattleName: string | null;
		motherGrandFatherCattleName: string | null;
		motherGreatGrandFatherCattleName: string | null;
	} | null;
	motherInfo?: {
		motherInfoId: number;
		cattleId: number;
		motherCattleId: number;
		motherName: string | null;
		motherIdentificationNumber: string | null;
		motherScore: number | null;
	} | null;
	breedingStatus?: {
		breedingStatusId: number;
		cattleId: number;
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
		createdAt: string;
		updatedAt: string;
	} | null;
	events?: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		createdAt: string;
		updatedAt: string;
	}>;
	daysOpen?: number | null;
};

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
	return fetchWithAuth<{ data: GetCattleDetailResType }>((token) =>
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
	).then((r) => r.data);
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
		gender: "雄" | "去勢" | "雌";
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
export type GetStatusCountsRes = CattleStatusCountsResponse;

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

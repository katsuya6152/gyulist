import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";

/**
 * 出荷実績作成のリクエスト型
 */
export type CreateShipmentRequest = {
	cattleId: number;
	shipmentDate: string;
	price: number;
	weight?: number;
	ageAtShipment?: number;
	buyer?: string;
	notes?: string;
};

/**
 * 出荷予定作成のリクエスト型
 */
export type CreateShipmentPlanRequest = {
	cattleId: number;
	plannedShipmentMonth: string;
};

/**
 * 出荷実績更新のリクエスト型
 */
export type UpdateShipmentRequest = {
	shipmentDate: string;
	price: number;
	weight?: number;
	ageAtShipment?: number;
	buyer?: string;
	notes?: string;
};

/**
 * 出荷予定更新のリクエスト型
 */
export type UpdateShipmentPlanRequest = {
	plannedShipmentMonth: string;
};

/**
 * 母牛別出荷実績一覧のクエリパラメータ
 */
export type MotherShipmentsListParams = {
	page?: number;
	limit?: number;
	sortBy?:
		| "motherName"
		| "totalRevenue"
		| "averagePrice"
		| "shipmentCount"
		| "shipmentDate";
	sortOrder?: "asc" | "desc";
	filterBy?: "year" | "motherName" | "priceRange";
	filterValue?: string;
};

/**
 * 出荷予定一覧のクエリパラメータ
 */
export type ShipmentPlansParams = {
	month?: string;
	page?: number;
	limit?: number;
};

/**
 * 出荷実績一覧のクエリパラメータ
 */
export type ShipmentsParams = {
	from?: string;
	to?: string;
	cattleId?: number;
	page?: number;
	limit?: number;
};

/**
 * 母牛別出荷実績詳細型
 */
export type MotherShipmentDetail = {
	motherId: number;
	motherName: string;
	motherEarTag: string | null;
	calfId: number;
	calfName: string | null;
	sex: string | null;
	pedigree: {
		father: string | null;
		motherFather: string | null;
		motherGrandfather: string | null;
		motherMotherGrandfather: string | null;
	};
	breedingDate: string | null;
	expectedBirthDate: string | null;
	birthDate: string | null;
	shipmentDate: string | null;
	shipmentWeight: number | null;
	ageAtShipment: number | null;
	price: number | null;
	buyer: string | null;
	notes: string | null;
};

/**
 * 出荷統計型
 */
export type ShipmentStatistics = {
	totalShipments: number;
	totalRevenue: number;
	averagePrice: number;
	averageWeight: number;
	averageAge: number;
};

/**
 * ページネーション型
 */
export type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

/**
 * 母牛別出荷実績一覧レスポンス型
 */
export type MotherShipmentListResponse = {
	data: MotherShipmentDetail[];
	pagination: Pagination;
	summary: ShipmentStatistics;
};

/**
 * 出荷実績を作成
 */
export async function createShipment(
	request: CreateShipmentRequest
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments.$post(
			{
				json: request
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷実績を更新
 */
export async function updateShipment(
	shipmentId: string,
	request: UpdateShipmentRequest
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments[":shipmentId"].$put(
			{
				param: {
					shipmentId: shipmentId
				},
				json: request
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷実績を削除
 */
export async function deleteShipment(shipmentId: string): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments[":shipmentId"].$delete(
			{
				param: {
					shipmentId: shipmentId
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

/**
 * 出荷実績一覧を取得
 */
export async function getShipments(
	params: {
		from?: string;
		to?: string;
		cattleId?: number;
		page?: number;
		limit?: number;
	} = {}
): Promise<ShipmentListResponse> {
	return fetchWithAuth<ShipmentListResponse>((token) =>
		client.api.v1.shipments.$get(
			{
				query: {
					from: params.from,
					to: params.to,
					cattleId: params.cattleId?.toString(),
					page: params.page?.toString(),
					limit: params.limit?.toString()
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

/**
 * 母牛別出荷実績一覧を取得
 */
export async function getMotherShipmentsList(
	params: MotherShipmentsListParams = {}
): Promise<MotherShipmentListResponse> {
	return fetchWithAuth<MotherShipmentListResponse>((token) =>
		client.api.v1.shipments.mothers.list.$get(
			{
				query: {
					page: params.page?.toString(),
					limit: params.limit?.toString(),
					sortBy: params.sortBy,
					sortOrder: params.sortOrder,
					filterBy: params.filterBy,
					filterValue: params.filterValue
				} as Record<string, string | undefined>
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷予定を作成
 */
export async function createShipmentPlan(
	request: CreateShipmentPlanRequest
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments.plans.$post(
			{
				json: request
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷予定エンティティ型
 */
export type ShipmentPlan = {
	planId: string;
	cattleId: number;
	cattleName: string | null;
	identificationNumber?: string | null;
	gender?: string | null;
	growthStage?: string | null;
	plannedShipmentMonth: string;
	createdAt: string;
	updatedAt: string;
};

/**
 * 出荷予定一覧レスポンス型
 */
export type ShipmentPlanListResponse = {
	data: ShipmentPlan[];
	pagination: Pagination;
};

/**
 * 出荷予定一覧を取得
 */
export async function getShipmentPlans(
	params: ShipmentPlansParams = {}
): Promise<ShipmentPlanListResponse> {
	return fetchWithAuth<ShipmentPlanListResponse>((token) =>
		client.api.v1.shipments.plans.$get(
			{
				query: {
					month: params.month,
					page: params.page?.toString(),
					limit: params.limit?.toString()
				} as Record<string, string | undefined>
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷予定を更新
 */
export async function updateShipmentPlan(
	cattleId: number,
	request: UpdateShipmentPlanRequest
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments.plans[":cattleId"].$put(
			{
				param: {
					cattleId: cattleId.toString()
				},
				json: request
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

/**
 * 出荷予定を削除
 */
export async function deleteShipmentPlan(
	cattleId: number | string
): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.shipments.plans[":cattleId"].$delete(
			{
				param: {
					cattleId: cattleId.toString()
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

/**
 * 出荷実績一覧レスポンス型
 */
export type ShipmentListResponse = {
	data: Array<{
		shipmentId: string;
		cattleId: number;
		cattleName: string | null;
		shipmentDate: string;
		price: number;
		weight: number | null;
		ageAtShipment: number | null;
		buyer: string | null;
		notes: string | null;
	}>;
	pagination: Pagination;
	summary: ShipmentStatistics;
};

/**
 * 価格統計レスポンス型
 */
export type PriceStatsResponse = {
	totalShipments: number;
	totalRevenue: number;
	averagePrice: number;
	maxPrice: number;
	minPrice: number;
	monthlyStats: Record<string, ShipmentStatistics>;
};

/**
 * 価格統計を取得
 */
export async function getPriceStats(
	params: {
		from?: string;
		to?: string;
	} = {}
): Promise<PriceStatsResponse> {
	return fetchWithAuth<PriceStatsResponse>((token) =>
		client.api.v1.shipments["price-stats"].$get(
			{
				query: {
					from: params.from,
					to: params.to
				} as Record<string, string | undefined>
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

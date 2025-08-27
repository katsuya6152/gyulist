/**
 * 出荷管理ドメイン - リポジトリポート定義
 *
 * 出荷管理のデータアクセスに関するインターフェースを定義します。
 */

import type { CattleId, UserId } from "../../../shared/brand";
import type { ShipmentResult } from "../../errors/shipments/ShipmentErrors";
import type {
	MotherShipmentDetail,
	MotherShipmentListResponse,
	MotherShipmentSummary,
	Shipment,
	ShipmentId,
	ShipmentPlan,
	ShipmentPlanId
} from "../../types/shipments";

/**
 * 出荷検索パラメータ
 */
export type SearchShipmentsParams = {
	userId: UserId;
	from?: string; // YYYY-MM-DD
	to?: string; // YYYY-MM-DD
	cattleId?: CattleId;
	page?: number;
	limit?: number;
};

/**
 * 母牛別出荷実績検索パラメータ
 */
export type SearchMotherShipmentsParams = {
	userId: UserId;
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
 * 出荷予定検索パラメータ
 */
export type SearchShipmentPlansParams = {
	userId: UserId;
	month?: string; // YYYY-MM
	page?: number;
	limit?: number;
};

/**
 * 出荷リポジトリインターフェース
 */
export interface ShipmentRepository {
	/**
	 * 出荷実績を保存
	 */
	save(shipment: Shipment): Promise<ShipmentResult<Shipment>>;

	/**
	 * 出荷実績をIDで取得
	 */
	findById(shipmentId: string): Promise<ShipmentResult<Shipment | null>>;

	/**
	 * 出荷実績を検索
	 */
	search(params: SearchShipmentsParams): Promise<
		ShipmentResult<{
			data: {
				shipmentId: string;
				cattleId: number;
				cattleName: string | null;
				shipmentDate: string;
				price: number;
				weight: number | null;
				ageAtShipment: number | null;
				buyer: string | null;
				notes: string | null;
			}[];
			pagination: {
				page: number;
				limit: number;
				total: number;
				totalPages: number;
			};
			summary: {
				totalShipments: number;
				totalRevenue: number;
				averagePrice: number;
				averageWeight: number;
				averageAge: number;
			};
		}>
	>;

	/**
	 * 出荷実績を更新
	 */
	update(
		shipmentId: string,
		updateData: Partial<Shipment>
	): Promise<ShipmentResult<Shipment>>;

	/**
	 * 出荷実績を削除
	 */
	delete(shipmentId: string): Promise<ShipmentResult<void>>;

	/**
	 * 母牛別出荷実績一覧を取得
	 */
	findMotherShipmentsList(
		params: SearchMotherShipmentsParams
	): Promise<ShipmentResult<MotherShipmentListResponse>>;

	/**
	 * 母牛別出荷実績詳細を取得
	 */
	findMotherShipmentDetails(
		motherId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<MotherShipmentSummary | null>>;
}

/**
 * 出荷予定リポジトリインターフェース
 */
export interface ShipmentPlanRepository {
	/**
	 * 出荷予定を保存
	 */
	save(plan: ShipmentPlan): Promise<ShipmentResult<ShipmentPlan>>;

	/**
	 * 出荷予定をIDで取得
	 */
	findById(
		planId: ShipmentPlanId,
		userId: UserId
	): Promise<ShipmentResult<ShipmentPlan | null>>;

	/**
	 * 牛IDで出荷予定を取得
	 */
	findByCattleId(
		cattleId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<ShipmentPlan | null>>;

	/**
	 * 出荷予定を検索
	 */
	search(
		params: SearchShipmentPlansParams
	): Promise<ShipmentResult<ShipmentPlan[]>>;

	/**
	 * 出荷予定を更新
	 */
	update(plan: ShipmentPlan): Promise<ShipmentResult<ShipmentPlan>>;

	/**
	 * 出荷予定を削除
	 */
	delete(planId: ShipmentPlanId, userId: UserId): Promise<ShipmentResult<void>>;

	/**
	 * 牛IDで出荷予定を削除
	 */
	deleteByCattleId(
		cattleId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<void>>;
}

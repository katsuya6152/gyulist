/**
 * 出荷管理ドメイン - 出荷サマリー型定義
 *
 * 母牛別出荷実績の集計情報を定義しています。
 */

import type { CattleId } from "../../../shared/brand";
import type { Shipment } from "./Shipment";
import type { ShipmentPlan } from "./ShipmentPlan";

/**
 * 母牛別出荷実績詳細
 */
export type MotherShipmentDetail = Readonly<{
	// 母牛情報
	motherId: CattleId;
	motherName: string;
	motherEarTag: string | null;

	// 子牛情報
	calfId: CattleId;
	calfName: string | null;
	sex: string | null;

	// 血統情報
	pedigree: Readonly<{
		father: string | null;
		motherFather: string | null;
		motherGrandfather: string | null;
		motherMotherGrandfather: string | null;
	}>;

	// 繁殖情報
	breedingDate: string | null;
	expectedBirthDate: string | null;
	birthDate: string | null;

	// 出荷情報
	shipmentDate: string | null;
	shipmentWeight: number | null;
	ageAtShipment: number | null;
	price: number | null;
	buyer: string | null;
	notes: string | null;
}>;

/**
 * 母牛別出荷実績サマリー
 */
export type MotherShipmentSummary = Readonly<{
	motherId: CattleId;
	motherName: string;
	motherEarTag: string | null;
	calves: ReadonlyArray<{
		calfId: CattleId;
		calfName: string | null;
		sex: string | null;
		pedigree: Readonly<{
			father: string | null;
			motherFather: string | null;
			motherGrandfather: string | null;
			motherMotherGrandfather: string | null;
		}>;
		breedingDate: string | null;
		expectedBirthDate: string | null;
		birthDate: string | null;
		shipment: Shipment | null;
	}>;
}>;

/**
 * 出荷統計情報
 */
export type ShipmentStatistics = Readonly<{
	totalShipments: number;
	totalRevenue: number;
	averagePrice: number;
	averageWeight: number;
	averageAge: number;
}>;

/**
 * ページネーション情報
 */
export type ShipmentPagination = Readonly<{
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}>;

/**
 * 母牛別出荷実績一覧レスポンス
 */
export type MotherShipmentListResponse = Readonly<{
	data: ReadonlyArray<MotherShipmentDetail>;
	pagination: ShipmentPagination;
	summary: ShipmentStatistics;
}>;

/**
 * 出荷予定一覧レスポンス
 */
export type ShipmentPlanListResponse = Readonly<{
	data: ReadonlyArray<ShipmentPlan>;
	pagination: ShipmentPagination;
}>;

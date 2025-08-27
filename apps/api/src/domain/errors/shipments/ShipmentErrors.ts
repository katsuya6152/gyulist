/**
 * 出荷管理ドメイン - エラー定義
 *
 * 出荷管理機能で発生する可能性のあるドメインエラーを定義しています。
 */

import type { CattleId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { ShipmentId, ShipmentPlanId } from "../../types/shipments";

/**
 * 出荷が見つからないエラー
 */
export type ShipmentNotFoundError = {
	type: "SHIPMENT_NOT_FOUND";
	message: string;
	shipmentId: ShipmentId;
};

export const createShipmentNotFoundError = (
	shipmentId: ShipmentId
): ShipmentNotFoundError => ({
	type: "SHIPMENT_NOT_FOUND",
	message: `Shipment with ID ${shipmentId} not found`,
	shipmentId
});

/**
 * 出荷予定が見つからないエラー
 */
export type ShipmentPlanNotFoundError = {
	type: "SHIPMENT_PLAN_NOT_FOUND";
	message: string;
	planId?: ShipmentPlanId;
	cattleId?: CattleId;
};

export const createShipmentPlanNotFoundError = (
	planId?: ShipmentPlanId,
	cattleId?: CattleId
): ShipmentPlanNotFoundError => ({
	type: "SHIPMENT_PLAN_NOT_FOUND",
	message: planId
		? `Shipment plan with ID ${planId} not found`
		: `Shipment plan for cattle ${cattleId} not found`,
	planId,
	cattleId
});

/**
 * 牛が見つからないエラー
 */
export type CattleNotFoundError = {
	type: "CATTLE_NOT_FOUND";
	message: string;
	cattleId: CattleId;
};

export const createCattleNotFoundError = (
	cattleId: CattleId
): CattleNotFoundError => ({
	type: "CATTLE_NOT_FOUND",
	message: `Cattle with ID ${cattleId} not found`,
	cattleId
});

/**
 * 無効な出荷データエラー
 */
export type InvalidShipmentDataError = {
	type: "INVALID_SHIPMENT_DATA";
	message: string;
	field: string;
	value?: unknown;
};

export const createInvalidShipmentDataError = (
	field: string,
	message: string,
	value?: unknown
): InvalidShipmentDataError => ({
	type: "INVALID_SHIPMENT_DATA",
	message,
	field,
	value
});

/**
 * 重複する出荷予定エラー
 */
export type DuplicateShipmentPlanError = {
	type: "DUPLICATE_SHIPMENT_PLAN";
	message: string;
	cattleId: CattleId;
};

export const createDuplicateShipmentPlanError = (
	cattleId: CattleId
): DuplicateShipmentPlanError => ({
	type: "DUPLICATE_SHIPMENT_PLAN",
	message: `Shipment plan for cattle ${cattleId} already exists`,
	cattleId
});

/**
 * 出荷管理ドメインエラーの統合型
 */
export type ShipmentDomainError =
	| ShipmentNotFoundError
	| ShipmentPlanNotFoundError
	| CattleNotFoundError
	| InvalidShipmentDataError
	| DuplicateShipmentPlanError;

/**
 * 出荷管理ドメイン結果型
 */
export type ShipmentResult<T> = Result<T, ShipmentDomainError>;

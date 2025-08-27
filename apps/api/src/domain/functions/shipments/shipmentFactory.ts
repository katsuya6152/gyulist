/**
 * 出荷管理ドメイン - ファクトリー関数
 *
 * 出荷エンティティの作成・更新を行うファクトリー関数を提供します。
 */

// UUID生成関数（Web Crypto API使用）
function generateUUID(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);

	// Version 4 UUID format
	bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant bits

	const hex = Array.from(bytes, (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");

	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20, 32)
	].join("-");
}
import type { CattleId } from "../../../shared/brand";
import { err, ok } from "../../../shared/result";
import type { ShipmentResult } from "../../errors/shipments/ShipmentErrors";
import type {
	NewShipmentPlanProps,
	NewShipmentProps,
	Shipment,
	ShipmentId,
	ShipmentPlan,
	ShipmentPlanId,
	UpdateShipmentPlanProps,
	UpdateShipmentProps
} from "../../types/shipments";
import {
	validateShipmentData,
	validateShipmentPlanData,
	validateShipmentPlanUpdate,
	validateShipmentUpdate
} from "./shipmentValidation";

/**
 * 新規出荷エンティティを作成
 */
export const createShipment = (
	props: NewShipmentProps
): ShipmentResult<Shipment> => {
	// バリデーション
	const validationResult = validateShipmentData(props);
	if (!validationResult.ok) {
		return validationResult;
	}

	const now = new Date();
	const shipment: Shipment = {
		shipmentId: generateUUID() as ShipmentId,
		cattleId: props.cattleId,
		shipmentDate: props.shipmentDate,
		price: props.price,
		weight: props.weight ?? null,
		ageAtShipment: props.ageAtShipment ?? null,
		buyer: props.buyer ?? null,
		notes: props.notes ?? null,
		createdAt: now,
		updatedAt: now
	};

	return ok(shipment);
};

/**
 * 出荷エンティティを更新
 */
export const updateShipment = (
	existing: Shipment,
	props: UpdateShipmentProps
): ShipmentResult<Shipment> => {
	// バリデーション
	const validationResult = validateShipmentUpdate(props);
	if (!validationResult.ok) {
		return validationResult;
	}

	const updated: Shipment = {
		...existing,
		...props,
		updatedAt: new Date()
	};

	return ok(updated);
};

/**
 * 新規出荷予定エンティティを作成
 */
export const createShipmentPlan = (
	props: NewShipmentPlanProps
): ShipmentResult<ShipmentPlan> => {
	// バリデーション
	const validationResult = validateShipmentPlanData(props);
	if (!validationResult.ok) {
		return validationResult;
	}

	const now = new Date();
	const shipmentPlan: ShipmentPlan = {
		planId: generateUUID() as ShipmentPlanId,
		cattleId: props.cattleId,
		plannedShipmentMonth: props.plannedShipmentMonth,
		createdAt: now,
		updatedAt: now
	};

	return ok(shipmentPlan);
};

/**
 * 出荷予定エンティティを更新
 */
export const updateShipmentPlan = (
	existing: ShipmentPlan,
	props: UpdateShipmentPlanProps
): ShipmentResult<ShipmentPlan> => {
	// バリデーション
	const validationResult = validateShipmentPlanUpdate(props);
	if (!validationResult.ok) {
		return validationResult;
	}

	const updated: ShipmentPlan = {
		...existing,
		...props,
		updatedAt: new Date()
	};

	return ok(updated);
};

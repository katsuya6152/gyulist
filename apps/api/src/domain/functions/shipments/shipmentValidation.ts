/**
 * 出荷管理ドメイン - バリデーション関数
 *
 * 出荷データのバリデーションルールを定義します。
 */

import { err, ok } from "../../../shared/result";
import type { ShipmentResult } from "../../errors/shipments/ShipmentErrors";
import { createInvalidShipmentDataError } from "../../errors/shipments/ShipmentErrors";
import type {
	NewShipmentPlanProps,
	NewShipmentProps,
	UpdateShipmentPlanProps,
	UpdateShipmentProps
} from "../../types/shipments";

/**
 * 出荷データのバリデーション
 */
export const validateShipmentData = (
	props: NewShipmentProps
): ShipmentResult<void> => {
	// 出荷日のバリデーション（過去の日付のみ）
	const shipmentDate = new Date(props.shipmentDate);
	const today = new Date();
	today.setHours(23, 59, 59, 999); // 今日の終わりまでOK

	if (shipmentDate > today) {
		return err(
			createInvalidShipmentDataError(
				"shipmentDate",
				"Shipment date must be in the past or today",
				props.shipmentDate
			)
		);
	}

	// 価格のバリデーション（正の整数）
	if (props.price <= 0) {
		return err(
			createInvalidShipmentDataError(
				"price",
				"Price must be a positive number",
				props.price
			)
		);
	}

	// 体重のバリデーション（正の数）
	if (
		props.weight !== undefined &&
		props.weight !== null &&
		props.weight <= 0
	) {
		return err(
			createInvalidShipmentDataError(
				"weight",
				"Weight must be a positive number",
				props.weight
			)
		);
	}

	// 日齢のバリデーション（正の整数）
	if (
		props.ageAtShipment !== undefined &&
		props.ageAtShipment !== null &&
		props.ageAtShipment <= 0
	) {
		return err(
			createInvalidShipmentDataError(
				"ageAtShipment",
				"Age at shipment must be a positive integer",
				props.ageAtShipment
			)
		);
	}

	return ok(void 0);
};

/**
 * 出荷更新データのバリデーション
 */
export const validateShipmentUpdate = (
	props: UpdateShipmentProps
): ShipmentResult<void> => {
	// 出荷日のバリデーション
	if (props.shipmentDate !== undefined) {
		const shipmentDate = new Date(props.shipmentDate);
		const today = new Date();
		today.setHours(23, 59, 59, 999);

		if (shipmentDate > today) {
			return err(
				createInvalidShipmentDataError(
					"shipmentDate",
					"Shipment date must be in the past or today",
					props.shipmentDate
				)
			);
		}
	}

	// 価格のバリデーション
	if (props.price !== undefined && props.price <= 0) {
		return err(
			createInvalidShipmentDataError(
				"price",
				"Price must be a positive number",
				props.price
			)
		);
	}

	// 体重のバリデーション
	if (
		props.weight !== undefined &&
		props.weight !== null &&
		props.weight <= 0
	) {
		return err(
			createInvalidShipmentDataError(
				"weight",
				"Weight must be a positive number",
				props.weight
			)
		);
	}

	// 日齢のバリデーション
	if (
		props.ageAtShipment !== undefined &&
		props.ageAtShipment !== null &&
		props.ageAtShipment <= 0
	) {
		return err(
			createInvalidShipmentDataError(
				"ageAtShipment",
				"Age at shipment must be a positive integer",
				props.ageAtShipment
			)
		);
	}

	return ok(void 0);
};

/**
 * 出荷予定データのバリデーション
 */
export const validateShipmentPlanData = (
	props: NewShipmentPlanProps
): ShipmentResult<void> => {
	// 出荷予定月のフォーマットバリデーション（YYYY-MM形式）
	const monthRegex = /^\d{4}-\d{2}$/;
	if (!monthRegex.test(props.plannedShipmentMonth)) {
		return err(
			createInvalidShipmentDataError(
				"plannedShipmentMonth",
				"Planned shipment month must be in YYYY-MM format",
				props.plannedShipmentMonth
			)
		);
	}

	// 未来の月かチェック
	const [year, month] = props.plannedShipmentMonth.split("-").map(Number);
	const plannedDate = new Date(year, month - 1, 1);
	const currentMonth = new Date();
	currentMonth.setDate(1);
	currentMonth.setHours(0, 0, 0, 0);

	if (plannedDate < currentMonth) {
		return err(
			createInvalidShipmentDataError(
				"plannedShipmentMonth",
				"Planned shipment month must be in the future or current month",
				props.plannedShipmentMonth
			)
		);
	}

	return ok(void 0);
};

/**
 * 出荷予定更新データのバリデーション
 */
export const validateShipmentPlanUpdate = (
	props: UpdateShipmentPlanProps
): ShipmentResult<void> => {
	// 出荷予定月のフォーマットバリデーション
	const monthRegex = /^\d{4}-\d{2}$/;
	if (!monthRegex.test(props.plannedShipmentMonth)) {
		return err(
			createInvalidShipmentDataError(
				"plannedShipmentMonth",
				"Planned shipment month must be in YYYY-MM format",
				props.plannedShipmentMonth
			)
		);
	}

	// 未来の月かチェック
	const [year, month] = props.plannedShipmentMonth.split("-").map(Number);
	const plannedDate = new Date(year, month - 1, 1);
	const currentMonth = new Date();
	currentMonth.setDate(1);
	currentMonth.setHours(0, 0, 0, 0);

	if (plannedDate < currentMonth) {
		return err(
			createInvalidShipmentDataError(
				"plannedShipmentMonth",
				"Planned shipment month must be in the future or current month",
				props.plannedShipmentMonth
			)
		);
	}

	return ok(void 0);
};

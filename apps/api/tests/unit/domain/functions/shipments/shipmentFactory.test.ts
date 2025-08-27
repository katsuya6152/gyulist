/**
 * Shipment Factory Tests
 *
 * 出荷ファクトリー関数のテスト
 */

import { describe, expect, it } from "vitest";
import {
	createShipment,
	createShipmentPlan
} from "../../../../../src/domain/functions/shipments/shipmentFactory";
import type {
	NewShipmentPlanProps,
	NewShipmentProps
} from "../../../../../src/domain/types/shipments";
import type {
	Buyer,
	PlannedShipmentMonth,
	ShipmentAge,
	ShipmentDate,
	ShipmentNotes,
	ShipmentPrice,
	ShipmentWeight
} from "../../../../../src/domain/types/shipments/ShipmentTypes";
import type { CattleId } from "../../../../../src/shared/brand";

describe("shipmentFactory", () => {
	describe("createShipment", () => {
		const validShipmentProps: NewShipmentProps = {
			cattleId: 1 as CattleId,
			shipmentDate: "2024-01-15" as ShipmentDate,
			price: 150000 as ShipmentPrice,
			weight: 450.5 as ShipmentWeight,
			ageAtShipment: 300 as ShipmentAge,
			buyer: "JA○○" as Buyer,
			notes: "市場Aで販売" as ShipmentNotes
		};

		it("should create a valid shipment entity", () => {
			const result = createShipment(validShipmentProps);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const shipment = result.value;
				expect(shipment.cattleId).toBe(validShipmentProps.cattleId);
				expect(shipment.shipmentDate).toBe(validShipmentProps.shipmentDate);
				expect(shipment.price).toBe(validShipmentProps.price);
				expect(shipment.weight).toBe(validShipmentProps.weight);
				expect(shipment.ageAtShipment).toBe(validShipmentProps.ageAtShipment);
				expect(shipment.buyer).toBe(validShipmentProps.buyer);
				expect(shipment.notes).toBe(validShipmentProps.notes);
				expect(shipment.shipmentId).toBeDefined();
				expect(shipment.createdAt).toBeInstanceOf(Date);
				expect(shipment.updatedAt).toBeInstanceOf(Date);
			}
		});

		it("should handle optional fields as null", () => {
			const minimalProps = {
				cattleId: 1 as CattleId,
				shipmentDate: "2024-01-15" as ShipmentDate,
				price: 150000 as ShipmentPrice
			};

			const result = createShipment(minimalProps);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const shipment = result.value;
				expect(shipment.weight).toBeNull();
				expect(shipment.ageAtShipment).toBeNull();
				expect(shipment.buyer).toBeNull();
				expect(shipment.notes).toBeNull();
			}
		});

		it("should fail with invalid data", () => {
			const invalidProps = {
				...validShipmentProps,
				price: -1000 as ShipmentPrice
			};

			const result = createShipment(invalidProps);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});
	});

	describe("createShipmentPlan", () => {
		// 来月の日付を動的に生成
		const nextMonth = new Date();
		nextMonth.setMonth(nextMonth.getMonth() + 1);
		const nextMonthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

		const validPlanProps: NewShipmentPlanProps = {
			cattleId: 1 as CattleId,
			plannedShipmentMonth: nextMonthString as PlannedShipmentMonth
		};

		it("should create a valid shipment plan entity", () => {
			const result = createShipmentPlan(validPlanProps);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const plan = result.value;
				expect(plan.cattleId).toBe(validPlanProps.cattleId);
				expect(plan.plannedShipmentMonth).toBe(
					validPlanProps.plannedShipmentMonth
				);
				expect(plan.planId).toBeDefined();
				expect(plan.createdAt).toBeInstanceOf(Date);
				expect(plan.updatedAt).toBeInstanceOf(Date);
			}
		});

		it("should fail with invalid data", () => {
			const invalidProps = {
				...validPlanProps,
				plannedShipmentMonth: "invalid-format" as PlannedShipmentMonth
			};

			const result = createShipmentPlan(invalidProps);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});
	});
});

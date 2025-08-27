/**
 * Shipment Validation Tests
 *
 * 出荷バリデーション関数のテスト
 */

import { describe, expect, it } from "vitest";
import {
	validateShipmentData,
	validateShipmentPlanData
} from "../../../../../src/domain/functions/shipments/shipmentValidation";
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

describe("shipmentValidation", () => {
	describe("validateShipmentData", () => {
		const validShipmentData: NewShipmentProps = {
			cattleId: 1 as CattleId,
			shipmentDate: "2024-01-15" as ShipmentDate,
			price: 150000 as ShipmentPrice,
			weight: 450.5 as ShipmentWeight,
			ageAtShipment: 300 as ShipmentAge,
			buyer: "JA○○" as Buyer,
			notes: "市場Aで販売" as ShipmentNotes
		};

		it("should validate valid shipment data", () => {
			const result = validateShipmentData(validShipmentData);
			expect(result.ok).toBe(true);
		});

		it("should reject future shipment date", () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);

			const invalidData = {
				...validShipmentData,
				shipmentDate: futureDate.toISOString().split("T")[0] as ShipmentDate
			};

			const result = validateShipmentData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should reject negative price", () => {
			const invalidData = {
				...validShipmentData,
				price: -1000 as ShipmentPrice
			};

			const result = validateShipmentData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should reject negative weight", () => {
			const invalidData = {
				...validShipmentData,
				weight: -10 as ShipmentWeight
			};

			const result = validateShipmentData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should reject negative age", () => {
			const invalidData = {
				...validShipmentData,
				ageAtShipment: -10 as ShipmentAge
			};

			const result = validateShipmentData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should allow null optional fields", () => {
			const dataWithNulls = {
				cattleId: 1 as CattleId,
				shipmentDate: "2024-01-15" as ShipmentDate,
				price: 150000 as ShipmentPrice,
				weight: null,
				ageAtShipment: null,
				buyer: null,
				notes: null
			};

			const result = validateShipmentData(dataWithNulls);
			expect(result.ok).toBe(true);
		});
	});

	describe("validateShipmentPlanData", () => {
		// 未来の月を動的に設定
		const futureDate = new Date();
		futureDate.setMonth(futureDate.getMonth() + 2);
		const futureMonth = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}`;

		const validPlanData: NewShipmentPlanProps = {
			cattleId: 1 as CattleId,
			plannedShipmentMonth: futureMonth as PlannedShipmentMonth
		};

		it("should validate valid shipment plan data", () => {
			const result = validateShipmentPlanData(validPlanData);
			expect(result.ok).toBe(true);
		});

		it("should reject invalid month format", () => {
			const invalidData = {
				...validPlanData,
				plannedShipmentMonth: "2025-3" as PlannedShipmentMonth // 正しくは "2025-03"
			};

			const result = validateShipmentPlanData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should reject past month", () => {
			const pastMonth = new Date();
			pastMonth.setMonth(pastMonth.getMonth() - 2);
			const pastMonthStr = `${pastMonth.getFullYear()}-${String(pastMonth.getMonth() + 1).padStart(2, "0")}`;

			const invalidData = {
				...validPlanData,
				plannedShipmentMonth: pastMonthStr as PlannedShipmentMonth
			};

			const result = validateShipmentPlanData(invalidData);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INVALID_SHIPMENT_DATA");
			}
		});

		it("should accept current month", () => {
			const currentMonth = new Date();
			const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

			const validData = {
				...validPlanData,
				plannedShipmentMonth: currentMonthStr as PlannedShipmentMonth
			};

			const result = validateShipmentPlanData(validData);
			expect(result.ok).toBe(true);
		});
	});
});

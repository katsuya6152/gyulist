/**
 * Shipment Calculation Tests
 *
 * 出荷計算関数のテスト
 */

import { describe, expect, it } from "vitest";
import {
	calculateAgeAtShipment,
	calculateShipmentStatistics
} from "../../../../../src/domain/functions/shipments/shipmentCalculation";
import type { MotherShipmentDetail } from "../../../../../src/domain/types/shipments";
import type { CattleId } from "../../../../../src/shared/brand";

describe("shipmentCalculation", () => {
	describe("calculateAgeAtShipment", () => {
		it("should calculate correct age in days", () => {
			const birthDate = new Date("2023-01-01");
			const shipmentDate = new Date("2023-12-01");

			const age = calculateAgeAtShipment(birthDate, shipmentDate);
			expect(age).toBe(334); // 約11ヶ月
		});

		it("should handle same day", () => {
			const date = new Date("2023-01-01");

			const age = calculateAgeAtShipment(date, date);
			expect(age).toBe(0);
		});

		it("should handle leap year", () => {
			const birthDate = new Date("2024-01-01");
			const shipmentDate = new Date("2024-12-31");

			const age = calculateAgeAtShipment(birthDate, shipmentDate);
			expect(age).toBe(365); // 2024年は閏年
		});
	});

	describe("calculateShipmentStatistics", () => {
		const sampleData: MotherShipmentDetail[] = [
			{
				motherId: 1 as CattleId,
				motherName: "母牛A",
				motherEarTag: "001",
				calfId: 2 as CattleId,
				calfName: "子牛A1",
				sex: "male",
				pedigree: {
					father: "父A",
					motherFather: "母の父A",
					motherGrandfather: "母の祖父A",
					motherMotherGrandfather: "母の母の祖父A"
				},
				breedingDate: "2023-03-15",
				expectedBirthDate: "2023-12-20",
				birthDate: "2023-12-18",
				shipmentDate: "2024-10-15",
				shipmentWeight: 450.5,
				ageAtShipment: 301,
				price: 150000,
				buyer: "JA○○",
				notes: "市場Aで販売"
			},
			{
				motherId: 1 as CattleId,
				motherName: "母牛A",
				motherEarTag: "001",
				calfId: 3 as CattleId,
				calfName: "子牛A2",
				sex: "female",
				pedigree: {
					father: "父A",
					motherFather: "母の父A",
					motherGrandfather: "母の祖父A",
					motherMotherGrandfather: "母の母の祖父A"
				},
				breedingDate: "2022-03-15",
				expectedBirthDate: "2022-12-20",
				birthDate: "2022-12-18",
				shipmentDate: "2023-10-15",
				shipmentWeight: 420.0,
				ageAtShipment: 301,
				price: 140000,
				buyer: "JA○○",
				notes: "市場Bで販売"
			}
		];

		it("should calculate correct statistics", () => {
			const stats = calculateShipmentStatistics(sampleData);

			expect(stats.totalShipments).toBe(2);
			expect(stats.totalRevenue).toBe(290000);
			expect(stats.averagePrice).toBe(145000);
			expect(stats.averageWeight).toBe(435.3); // (450.5 + 420.0) / 2 = 435.25 → 435.3
			expect(stats.averageAge).toBe(301);
		});

		it("should handle empty data", () => {
			const stats = calculateShipmentStatistics([]);

			expect(stats.totalShipments).toBe(0);
			expect(stats.totalRevenue).toBe(0);
			expect(stats.averagePrice).toBe(0);
			expect(stats.averageWeight).toBe(0);
			expect(stats.averageAge).toBe(0);
		});

		it("should filter out null values", () => {
			const dataWithNulls: MotherShipmentDetail[] = [
				{
					...sampleData[0],
					price: null,
					shipmentWeight: null,
					ageAtShipment: null
				},
				sampleData[1]
			];

			const stats = calculateShipmentStatistics(dataWithNulls);

			expect(stats.totalShipments).toBe(1); // null値の行は除外される
			expect(stats.totalRevenue).toBe(140000);
			expect(stats.averagePrice).toBe(140000);
			expect(stats.averageWeight).toBe(420.0);
			expect(stats.averageAge).toBe(301);
		});
	});
});

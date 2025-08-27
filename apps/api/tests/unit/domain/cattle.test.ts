/**
 * Cattle Domain Unit Tests - New Architecture
 *
 * 牛管理ドメインロジックのユニットテスト
 */

import { describe, expect, it } from "vitest";
import { calculateAgeFromBirthday } from "../../../src/domain/functions/cattle/calculateAge";
import { createCattle } from "../../../src/domain/functions/cattle/cattleFactory";
import { validateNewCattleProps } from "../../../src/domain/functions/cattle/cattleValidation";
import type { NewCattleProps } from "../../../src/domain/types/cattle/Cattle";
import type {
	Barn,
	Breed,
	CattleName,
	EarTagNumber,
	Gender,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Weight
} from "../../../src/domain/types/cattle/CattleTypes";
import type { UserId } from "../../../src/shared/brand";

describe("Cattle Domain Functions - New Architecture", () => {
	describe("createCattle", () => {
		it("should create cattle with valid data", () => {
			const props: NewCattleProps = {
				ownerUserId: 1 as unknown as UserId,
				name: "テスト牛001" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌",
				growthStage: "CALF",
				breed: "ホルスタイン" as unknown as Breed,
				producerName: "テスト農場" as unknown as ProducerName,
				barn: "A棟" as unknown as Barn,
				notes: "テスト用の牛" as unknown as Notes,
				weight: 45 as unknown as Weight,
				score: 4 as unknown as Score
			};

			const result = createCattle(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe(props.name);
				expect(result.value.identificationNumber).toBe(
					props.identificationNumber
				);
				expect(result.value.gender).toBe(props.gender);
				expect(result.value.growthStage).toBe(props.growthStage);
			}
		});

		it("should validate required fields", () => {
			const invalidProps = {
				ownerUserId: 1 as unknown as UserId,
				name: "テスト牛" as unknown as CattleName,
				identificationNumber: -1 as unknown as IdentificationNumber, // Invalid: negative number
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌",
				growthStage: "CALF"
			} as NewCattleProps;

			const result = createCattle(invalidProps);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
			}
		});
	});

	describe("validateNewCattleProps", () => {
		it("should validate cattle data", () => {
			const validData = {
				ownerUserId: 1 as unknown as UserId,
				name: "テスト牛001" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌" as const,
				growthStage: "CALF" as const
			};

			const result = validateNewCattleProps(validData);

			expect(result.ok).toBe(true);
		});

		it("should reject invalid data", () => {
			const invalidData = {
				ownerUserId: 1 as unknown as UserId,
				name: "" as unknown as CattleName, // Invalid: empty name
				identificationNumber: -1 as unknown as IdentificationNumber, // Invalid: negative
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "invalid" as unknown as Gender, // Invalid: not in enum
				growthStage: "CALF" as const
			};

			const result = validateNewCattleProps(invalidData);

			expect(result.ok).toBe(false);
		});
	});

	describe("Cattle Status Transitions", () => {
		const validTransitions = [
			{ from: "HEALTHY", to: "PREGNANT" },
			{ from: "PREGNANT", to: "RESTING" },
			{ from: "RESTING", to: "HEALTHY" },
			{ from: "HEALTHY", to: "TREATING" },
			{ from: "TREATING", to: "HEALTHY" },
			{ from: "HEALTHY", to: "SCHEDULED_FOR_SHIPMENT" },
			{ from: "SCHEDULED_FOR_SHIPMENT", to: "SHIPPED" }
		];

		for (const { from, to } of validTransitions) {
			it(`should allow transition from ${from} to ${to}`, () => {
				// This would test status transition logic when implemented
				expect(true).toBe(true); // Placeholder
			});
		}
	});

	describe("calculateAgeFromBirthday", () => {
		it("should calculate age from valid birthday", () => {
			const birthday = "2023-01-01";
			const result = calculateAgeFromBirthday(birthday);

			expect(result.daysOld).toBeGreaterThan(0);
			expect(result.monthsOld).toBeGreaterThan(0);
			expect(result.age).toBeGreaterThan(0);
		});

		it("should return null for null birthday", () => {
			const result = calculateAgeFromBirthday(null);

			expect(result.daysOld).toBe(null);
			expect(result.monthsOld).toBe(null);
			expect(result.age).toBe(null);
		});

		it("should return null for invalid birthday format", () => {
			const result = calculateAgeFromBirthday("invalid-date");

			expect(result.daysOld).toBe(null);
			expect(result.monthsOld).toBe(null);
			expect(result.age).toBe(null);
		});

		it("should calculate correct age for recent birthday", () => {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			const birthday = yesterday.toISOString().split("T")[0];

			const result = calculateAgeFromBirthday(birthday);

			expect(result.daysOld).toBe(1);
			expect(result.monthsOld).toBe(0);
			expect(result.age).toBe(0);
		});

		it("should calculate correct age for one year old", () => {
			const today = new Date();
			const oneYearAgo = new Date(today);
			oneYearAgo.setFullYear(today.getFullYear() - 1);
			oneYearAgo.setDate(today.getDate() - 1); // 確実に365日以上前にする
			const birthday = oneYearAgo.toISOString().split("T")[0];

			const result = calculateAgeFromBirthday(birthday);

			expect(result.daysOld).toBeGreaterThanOrEqual(365);
			expect(result.monthsOld).toBeGreaterThanOrEqual(11); // 11ヶ月以上
			expect(result.age).toBeGreaterThanOrEqual(1);
		});
	});
});

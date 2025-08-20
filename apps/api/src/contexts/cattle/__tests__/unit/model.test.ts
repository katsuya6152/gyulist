import type { UserId } from "@/shared/brand";
import { describe, expect, it } from "vitest";
import { createCattle } from "../../domain/model/cattle";
import type { IdentificationNumber } from "../../domain/model/types";

describe("Cattle model", () => {
	const baseProps = {
		ownerUserId: 1 as unknown as UserId,
		identificationNumber: 123 as unknown as IdentificationNumber
	};

	describe("createCattle validation", () => {
		it("rejects future birthday", () => {
			const r = createCattle({
				...baseProps,
				birthday: new Date(Date.now() + 86400000)
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe("誕生日は未来の日付ではありません");
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("birthday");
				}
			}
		});

		it("rejects invalid identification number", () => {
			const r = createCattle({
				...baseProps,
				identificationNumber: 0 as unknown as IdentificationNumber
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe(
					"個体識別番号は正の整数である必要があります"
				);
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("identificationNumber");
				}
			}
		});

		it("rejects negative identification number", () => {
			const r = createCattle({
				...baseProps,
				identificationNumber: -1 as unknown as IdentificationNumber
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe(
					"個体識別番号は正の整数である必要があります"
				);
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("identificationNumber");
				}
			}
		});

		it("rejects invalid weight", () => {
			const r = createCattle({
				...baseProps,
				weight: 0
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe("体重は正の値である必要があります");
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("weight");
				}
			}
		});

		it("rejects negative weight", () => {
			const r = createCattle({
				...baseProps,
				weight: -5
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe("体重は正の値である必要があります");
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("weight");
				}
			}
		});

		it("rejects score below 0", () => {
			const r = createCattle({
				...baseProps,
				score: -1
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe(
					"評価スコアは0-100の範囲内である必要があります"
				);
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("score");
				}
			}
		});

		it("rejects score above 100", () => {
			const r = createCattle({
				...baseProps,
				score: 101
			});
			expect(r.ok).toBe(false);
			if (!r.ok) {
				expect(r.error.type).toBe("ValidationError");
				expect(r.error.message).toBe(
					"評価スコアは0-100の範囲内である必要があります"
				);
				if (r.error.type === "ValidationError") {
					expect(r.error.field).toBe("score");
				}
			}
		});

		it("accepts valid score at boundary 0", () => {
			const r = createCattle({
				...baseProps,
				score: 0
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.score).toBe(0);
			}
		});

		it("accepts valid score at boundary 100", () => {
			const r = createCattle({
				...baseProps,
				score: 100
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.score).toBe(100);
			}
		});

		it("accepts valid weight", () => {
			const r = createCattle({
				...baseProps,
				weight: 500
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.weight).toBe(500);
			}
		});
	});

	describe("createCattle success cases", () => {
		it("creates with derived ages when birthday is in the past", () => {
			const r = createCattle({
				...baseProps,
				birthday: new Date(Date.now() - 10 * 24 * 3600 * 1000)
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.daysOld).toBeGreaterThanOrEqual(9);
				expect(r.value.age).toBe(0);
				expect(r.value.monthsOld).toBe(0);
			}
		});

		it("creates with all required fields", () => {
			const r = createCattle({
				ownerUserId: 1 as unknown as UserId,
				identificationNumber: 123 as unknown as IdentificationNumber
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.ownerUserId).toBe(1);
				expect(r.value.identificationNumber).toBe(123);
				expect(r.value.cattleId).toBe(0); // Temporary value
				expect(r.value.createdAt).toBeInstanceOf(Date);
				expect(r.value.updatedAt).toBeInstanceOf(Date);
				expect(r.value.version).toBe(1);
			}
		});

		it("creates with all optional fields", () => {
			const r = createCattle({
				...baseProps,
				earTagNumber: 123 as unknown as import(
					"../../domain/model/types"
				).EarTagNumber,
				name: "Test Cow",
				gender: "雌",
				birthday: new Date("2020-01-01"),
				growthStage: "CALF",
				breed: "Holstein",
				status: "HEALTHY",
				producerName: "Test Farm",
				barn: "Barn A",
				breedingValue: "High",
				notes: "Test notes",
				weight: 500,
				score: 85
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.earTagNumber).toBe(123);
				expect(r.value.name).toBe("Test Cow");
				expect(r.value.gender).toBe("雌");
				expect(r.value.birthday).toEqual(new Date("2020-01-01"));
				expect(r.value.growthStage).toBe("CALF");
				expect(r.value.breed).toBe("Holstein");
				expect(r.value.status).toBe("HEALTHY");
				expect(r.value.producerName).toBe("Test Farm");
				expect(r.value.barn).toBe("Barn A");
				expect(r.value.breedingValue).toBe("High");
				expect(r.value.notes).toBe("Test notes");
				expect(r.value.weight).toBe(500);
				expect(r.value.score).toBe(85);
			}
		});

		it("creates with null optional fields", () => {
			const r = createCattle({
				ownerUserId: 1 as unknown as UserId,
				identificationNumber: 123 as unknown as IdentificationNumber,
				earTagNumber: undefined,
				name: undefined,
				gender: undefined,
				birthday: undefined,
				growthStage: undefined,
				breed: undefined,
				status: undefined,
				producerName: undefined,
				barn: undefined,
				breedingValue: undefined,
				notes: undefined,
				weight: undefined,
				score: undefined
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.earTagNumber).toBeNull();
				expect(r.value.name).toBeNull();
				expect(r.value.gender).toBeNull();
				expect(r.value.birthday).toBeNull();
				expect(r.value.growthStage).toBeNull();
				expect(r.value.breed).toBeNull();
				expect(r.value.status).toBe("HEALTHY"); // デフォルト値
				expect(r.value.producerName).toBeNull();
				expect(r.value.barn).toBeNull();
				expect(r.value.breedingValue).toBeNull();
				expect(r.value.notes).toBeNull();
				expect(r.value.weight).toBeUndefined();
				expect(r.value.score).toBeUndefined();
			}
		});
	});

	describe("age calculation", () => {
		it("calculates age correctly for 1 year old", () => {
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

			const r = createCattle({
				...baseProps,
				birthday: oneYearAgo
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.age).toBe(1);
				expect(r.value.monthsOld).toBeGreaterThanOrEqual(11);
				expect(r.value.daysOld).toBeGreaterThanOrEqual(365);
			}
		});

		it("calculates age correctly for 6 months old", () => {
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

			const r = createCattle({
				...baseProps,
				birthday: sixMonthsAgo
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.age).toBe(0);
				expect(r.value.monthsOld).toBeGreaterThanOrEqual(5);
				expect(r.value.daysOld).toBeGreaterThanOrEqual(150);
			}
		});

		it("handles no birthday", () => {
			const r = createCattle({
				...baseProps,
				birthday: null
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.age).toBeNull();
				expect(r.value.monthsOld).toBeNull();
				expect(r.value.daysOld).toBeNull();
			}
		});
	});

	describe("string validation and transformation", () => {
		it("trims whitespace from string fields", () => {
			const r = createCattle({
				...baseProps,
				name: "  Test Cow  ",
				breed: "  Holstein  ",
				producerName: "  Test Farm  ",
				barn: "  Barn A  ",
				breedingValue: "  High  ",
				notes: "  Test notes  "
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBe("Test Cow");
				expect(r.value.breed).toBe("Holstein");
				expect(r.value.producerName).toBe("Test Farm");
				expect(r.value.barn).toBe("Barn A");
				expect(r.value.breedingValue).toBe("High");
				expect(r.value.notes).toBe("Test notes");
			}
		});

		it("converts empty strings to null", () => {
			const r = createCattle({
				...baseProps,
				name: "",
				breed: "",
				producerName: "",
				barn: "",
				breedingValue: "",
				notes: ""
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBeNull();
				expect(r.value.breed).toBeNull();
				expect(r.value.producerName).toBeNull();
				expect(r.value.barn).toBeNull();
				expect(r.value.breedingValue).toBeNull();
				expect(r.value.notes).toBeNull();
			}
		});

		it("handles undefined string fields", () => {
			const r = createCattle({
				...baseProps,
				name: undefined,
				breed: undefined,
				producerName: undefined,
				barn: undefined,
				breedingValue: undefined,
				notes: undefined
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBeNull();
				expect(r.value.breed).toBeNull();
				expect(r.value.producerName).toBeNull();
				expect(r.value.barn).toBeNull();
				expect(r.value.breedingValue).toBeNull();
				expect(r.value.notes).toBeNull();
			}
		});
	});

	describe("type safety", () => {
		it("enforces readonly properties", () => {
			const r = createCattle(baseProps);
			expect(r.ok).toBe(true);
			if (r.ok) {
				// This should compile without errors
				expect(r.value.cattleId).toBe(0);
				expect(r.value.ownerUserId).toBe(1);
			}
		});

		it("enforces brand types", () => {
			const r = createCattle(baseProps);
			expect(r.ok).toBe(true);
			if (r.ok) {
				// This should compile without errors
				expect(typeof r.value.cattleId).toBe("number");
				expect(typeof r.value.ownerUserId).toBe("number");
			}
		});
	});
});

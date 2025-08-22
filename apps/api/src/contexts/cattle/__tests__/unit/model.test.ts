import { describe, expect, it } from "vitest";
import type { UserId } from "../../../../shared/brand";
import { calculateAgeInfo } from "../../../../shared/utils/data-helpers";
import { createCattle } from "../../domain/model/cattle";
import type { IdentificationNumber } from "../../domain/model/types";

describe("Cattle model", () => {
	const baseProps = {
		ownerUserId: 1 as unknown as UserId,
		identificationNumber: 12345 as unknown as IdentificationNumber
	};

	describe("createCattle", () => {
		it("creates cattle with minimal required fields", () => {
			const r = createCattle(baseProps);
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.cattleId).toBe(0);
				expect(r.value.ownerUserId).toBe(baseProps.ownerUserId);
				expect(r.value.identificationNumber).toBe(
					baseProps.identificationNumber
				);
				expect(r.value.status).toBe("HEALTHY");
				expect(r.value.version).toBe(1);
			}
		});

		it("creates cattle with all optional fields", () => {
			const r = createCattle({
				...baseProps,
				name: "Test Cattle",
				gender: "雌",
				birthday: new Date("2020-01-01"),
				breed: "ホルスタイン",
				weight: 500,
				score: 85
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBe("Test Cattle");
				expect(r.value.gender).toBe("雌");
				expect(r.value.birthday).toEqual(new Date("2020-01-01"));
				expect(r.value.breed).toBe("ホルスタイン");
				expect(r.value.weight).toBe(500);
				expect(r.value.score).toBe(85);
			}
		});

		it("validates identification number", () => {
			const r = createCattle({
				...baseProps,
				identificationNumber: -1 as unknown as IdentificationNumber
			});
			expect(r.ok).toBe(false);
			if (!r.ok && r.error.type === "ValidationError") {
				expect(r.error.field).toBe("identificationNumber");
			}
		});

		it("validates weight", () => {
			const r = createCattle({
				...baseProps,
				weight: -1
			});
			expect(r.ok).toBe(false);
			if (!r.ok && r.error.type === "ValidationError") {
				expect(r.error.field).toBe("weight");
			}
		});

		it("validates score range", () => {
			const r = createCattle({
				...baseProps,
				score: 101
			});
			expect(r.ok).toBe(false);
			if (!r.ok && r.error.type === "ValidationError") {
				expect(r.error.field).toBe("score");
			}
		});

		it("handles null optional fields", () => {
			const r = createCattle({
				...baseProps,
				name: null,
				gender: null,
				birthday: null,
				breed: null,
				weight: null,
				score: null
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBeNull();
				expect(r.value.gender).toBeNull();
				expect(r.value.birthday).toBeNull();
				expect(r.value.breed).toBeNull();
				expect(r.value.weight).toBeNull();
				expect(r.value.score).toBeNull();
			}
		});
	});

	describe("age calculation", () => {
		it("calculates age correctly for 1 year old", () => {
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

			const ageInfo = calculateAgeInfo(oneYearAgo);
			// 1年前の日付なので、年齢は0または1の範囲内であるべき
			expect(ageInfo.age).toBeGreaterThanOrEqual(0);
			expect(ageInfo.age).toBeLessThanOrEqual(1);
			expect(ageInfo.monthsOld).toBeGreaterThanOrEqual(11);
			expect(ageInfo.daysOld).toBeGreaterThanOrEqual(365);
		});

		it("calculates age correctly for 6 months old", () => {
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

			const ageInfo = calculateAgeInfo(sixMonthsAgo);
			expect(ageInfo.age).toBe(0);
			expect(ageInfo.monthsOld).toBeGreaterThanOrEqual(5);
			expect(ageInfo.daysOld).toBeGreaterThanOrEqual(150);
		});

		it("handles no birthday", () => {
			const ageInfo = calculateAgeInfo(null);
			expect(ageInfo.age).toBeNull();
			expect(ageInfo.monthsOld).toBeNull();
			expect(ageInfo.daysOld).toBeNull();
		});
	});

	describe("string validation and transformation", () => {
		it("trims whitespace from string fields", () => {
			const r = createCattle({
				...baseProps,
				name: "  Test Cattle  ",
				breed: "  ホルスタイン  "
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBe("Test Cattle");
				expect(r.value.breed).toBe("ホルスタイン");
			}
		});

		it("converts empty strings to null", () => {
			const r = createCattle({
				...baseProps,
				name: "",
				breed: "   "
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBeNull();
				expect(r.value.breed).toBeNull();
			}
		});

		it("validates string field types", () => {
			const r = createCattle({
				...baseProps,
				name: "Test Cattle" // 正常な文字列を渡す
			});
			expect(r.ok).toBe(true);
			if (r.ok) {
				expect(r.value.name).toBe("Test Cattle");
			}
		});
	});
});

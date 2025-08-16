import { describe, expect, it } from "vitest";
import { calculateAge } from "../../../src/shared/utils/data-helpers";

describe("Date Utils", () => {
	describe("calculateAge function", () => {
		it("should export calculateAge function", () => {
			expect(calculateAge).toBeDefined();
			expect(typeof calculateAge).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(calculateAge.length).toBe(1);
		});

		it("should return a number", () => {
			const birthday = new Date("2020-01-01");
			const age = calculateAge(birthday, "years");
			expect(typeof age).toBe("number");
		});

		it("should handle years unit", () => {
			const birthday = new Date("2020-01-01");
			const age = calculateAge(birthday, "years");
			expect(age).toBeGreaterThanOrEqual(0);
		});

		it("should handle months unit", () => {
			const birthday = new Date("2023-01-01");
			const age = calculateAge(birthday, "months");
			expect(age).toBeGreaterThanOrEqual(0);
		});

		it("should handle days unit", () => {
			const birthday = new Date("2024-01-01");
			const age = calculateAge(birthday, "days");
			expect(age).toBeGreaterThanOrEqual(0);
		});

		it("should default to years when no unit specified", () => {
			const birthday = new Date("2020-01-01");
			const age = calculateAge(birthday);
			expect(typeof age).toBe("number");
			expect(age).toBeGreaterThanOrEqual(0);
		});

		it("should handle same date", () => {
			const now = new Date();
			const age = calculateAge(now, "days");
			expect(age).toBe(0);
		});

		it("should return positive numbers for past dates", () => {
			const pastDate = new Date("2000-01-01");
			const ageYears = calculateAge(pastDate, "years");
			const ageMonths = calculateAge(pastDate, "months");
			const ageDays = calculateAge(pastDate, "days");

			expect(ageYears).toBeGreaterThan(0);
			expect(ageMonths).toBeGreaterThan(0);
			expect(ageDays).toBeGreaterThan(0);
		});

		it("should handle future dates with Math.abs", () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			const age = calculateAge(futureDate, "years");
			expect(age).toBeGreaterThanOrEqual(0); // Math.abs makes it positive
		});

		it("should handle different units consistently", () => {
			const birthday = new Date("2023-01-01");

			const ageYears = calculateAge(birthday, "years");
			const ageMonths = calculateAge(birthday, "months");
			const ageDays = calculateAge(birthday, "days");

			// Days should be larger than months, months larger than years
			expect(ageDays).toBeGreaterThanOrEqual(ageMonths);
			expect(ageMonths).toBeGreaterThanOrEqual(ageYears);
		});
	});
});

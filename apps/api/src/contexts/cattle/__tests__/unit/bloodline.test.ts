import { describe, expect, it } from "vitest";
import {
	type Bloodline,
	createBloodline,
	getBloodlineDepth,
	hasBloodlineData
} from "../../domain/model/bloodline";
import type {
	FatherName,
	MotherFatherName,
	MotherGrandFatherName,
	MotherGreatGrandFatherName
} from "../../domain/model/types";

describe("Bloodline Domain Model", () => {
	describe("createBloodline", () => {
		it("should create bloodline with all names", () => {
			const result = createBloodline({
				fatherName: "Father Bull",
				motherFatherName: "Mother's Father",
				motherGrandFatherName: "Mother's Grandfather",
				motherGreatGrandFatherName: "Mother's Great Grandfather"
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBe("Father Bull");
				expect(bloodline.motherFatherName).toBe("Mother's Father");
				expect(bloodline.motherGrandFatherName).toBe("Mother's Grandfather");
				expect(bloodline.motherGreatGrandFatherName).toBe(
					"Mother's Great Grandfather"
				);
			}
		});

		it("should create bloodline with partial names", () => {
			const result = createBloodline({
				fatherName: "Father Bull",
				motherFatherName: "Mother's Father"
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBe("Father Bull");
				expect(bloodline.motherFatherName).toBe("Mother's Father");
				expect(bloodline.motherGrandFatherName).toBeNull();
				expect(bloodline.motherGreatGrandFatherName).toBeNull();
			}
		});

		it("should create bloodline with no names", () => {
			const result = createBloodline({});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBeNull();
				expect(bloodline.motherFatherName).toBeNull();
				expect(bloodline.motherGrandFatherName).toBeNull();
				expect(bloodline.motherGreatGrandFatherName).toBeNull();
			}
		});

		it("should handle null values", () => {
			const result = createBloodline({
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBeNull();
				expect(bloodline.motherFatherName).toBeNull();
				expect(bloodline.motherGrandFatherName).toBeNull();
				expect(bloodline.motherGreatGrandFatherName).toBeNull();
			}
		});

		it("should trim whitespace from names", () => {
			const result = createBloodline({
				fatherName: "  Father Bull  ",
				motherFatherName: "  Mother's Father  "
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBe("Father Bull");
				expect(bloodline.motherFatherName).toBe("Mother's Father");
			}
		});

		it("should convert empty strings to null", () => {
			const result = createBloodline({
				fatherName: "",
				motherFatherName: "   ",
				motherGrandFatherName: "\t\n",
				motherGreatGrandFatherName: ""
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBeNull();
				expect(bloodline.motherFatherName).toBeNull();
				expect(bloodline.motherGrandFatherName).toBeNull();
				expect(bloodline.motherGreatGrandFatherName).toBeNull();
			}
		});

		it("should handle undefined values", () => {
			const result = createBloodline({
				fatherName: undefined,
				motherFatherName: undefined
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				const bloodline = result.value;
				expect(bloodline.fatherName).toBeNull();
				expect(bloodline.motherFatherName).toBeNull();
			}
		});

		it("should return error for invalid type", () => {
			const result = createBloodline({
				fatherName: 123 as unknown as string,
				motherFatherName: "Valid Name"
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toContain("fatherName must be a string");
			}
		});

		it("should return error for multiple invalid types", () => {
			const result = createBloodline({
				fatherName: "Valid Name",
				motherFatherName: 456 as unknown as string,
				motherGrandFatherName: true as unknown as string
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toContain(
					"motherFatherName must be a string"
				);
			}
		});
	});

	describe("hasBloodlineData", () => {
		it("should return true when any name is present", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(hasBloodlineData(bloodline)).toBe(true);
		});

		it("should return true when multiple names are present", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: "Mother's Father" as MotherFatherName,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(hasBloodlineData(bloodline)).toBe(true);
		});

		it("should return false when no names are present", () => {
			const bloodline: Bloodline = {
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(hasBloodlineData(bloodline)).toBe(false);
		});

		it("should return true when only mother's great grandfather is present", () => {
			const bloodline: Bloodline = {
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName:
					"Great Grandfather" as MotherGreatGrandFatherName
			};

			expect(hasBloodlineData(bloodline)).toBe(true);
		});
	});

	describe("getBloodlineDepth", () => {
		it("should return 0 for no bloodline data", () => {
			const bloodline: Bloodline = {
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(getBloodlineDepth(bloodline)).toBe(0);
		});

		it("should return 1 for father only", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(getBloodlineDepth(bloodline)).toBe(1);
		});

		it("should return 2 for father and mother's father", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: "Mother's Father" as MotherFatherName,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			expect(getBloodlineDepth(bloodline)).toBe(2);
		});

		it("should return 3 for father, mother's father, and mother's grandfather", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: "Mother's Father" as MotherFatherName,
				motherGrandFatherName: "Mother's Grandfather" as MotherGrandFatherName,
				motherGreatGrandFatherName: null
			};

			expect(getBloodlineDepth(bloodline)).toBe(3);
		});

		it("should return 4 for complete bloodline", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: "Mother's Father" as MotherFatherName,
				motherGrandFatherName: "Mother's Grandfather" as MotherGrandFatherName,
				motherGreatGrandFatherName:
					"Mother's Great Grandfather" as MotherGreatGrandFatherName
			};

			expect(getBloodlineDepth(bloodline)).toBe(4);
		});

		it("should return maximum depth when not all levels are filled", () => {
			const bloodline: Bloodline = {
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: "Mother's Grandfather" as MotherGrandFatherName,
				motherGreatGrandFatherName: null
			};

			expect(getBloodlineDepth(bloodline)).toBe(3);
		});

		it("should return maximum depth when only mother's great grandfather is present", () => {
			const bloodline: Bloodline = {
				fatherName: null,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName:
					"Mother's Great Grandfather" as MotherGreatGrandFatherName
			};

			expect(getBloodlineDepth(bloodline)).toBe(4);
		});
	});

	describe("Type safety", () => {
		it("should enforce readonly properties", () => {
			const bloodline: Bloodline = {
				fatherName: "Father Bull" as FatherName,
				motherFatherName: null,
				motherGrandFatherName: null,
				motherGreatGrandFatherName: null
			};

			// This should compile without errors
			expect(bloodline.fatherName).toBe("Father Bull");
			expect(bloodline.motherFatherName).toBeNull();
		});

		it("should enforce brand types", () => {
			// These should compile without errors
			const fatherName: FatherName = "Father Bull" as FatherName;
			const motherFatherName: MotherFatherName =
				"Mother's Father" as MotherFatherName;
			const motherGrandFatherName: MotherGrandFatherName =
				"Mother's Grandfather" as MotherGrandFatherName;
			const motherGreatGrandFatherName: MotherGreatGrandFatherName =
				"Mother's Great Grandfather" as MotherGreatGrandFatherName;

			expect(typeof fatherName).toBe("string");
			expect(typeof motherFatherName).toBe("string");
			expect(typeof motherGrandFatherName).toBe("string");
			expect(typeof motherGreatGrandFatherName).toBe("string");
		});
	});
});

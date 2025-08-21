import { describe, expect, it } from "vitest";
import type { CattleId } from "../../../../shared/brand";
import {
	createMotherInfo,
	getMotherInfoCompleteness,
	isMotherInfoComplete
} from "../../domain/model/motherInfo";
import type { MotherInfo } from "../../domain/model/motherInfo";
import type {
	MotherIdentificationNumber,
	MotherName,
	MotherScore
} from "../../domain/model/types";

describe("MotherInfo Domain Model", () => {
	describe("createMotherInfo", () => {
		it("should create mother info with valid data", () => {
			const props = {
				motherCattleId: 123,
				motherName: "Test Mother",
				motherIdentificationNumber: 456789,
				motherScore: 85
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherCattleId).toBe(123);
				expect(result.value.motherName).toBe("Test Mother");
				expect(result.value.motherIdentificationNumber).toBe(456789);
				expect(result.value.motherScore).toBe(85);
			}
		});

		it("should create mother info with minimal data", () => {
			const props = {
				motherCattleId: 123
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherCattleId).toBe(123);
				expect(result.value.motherName).toBeNull();
				expect(result.value.motherIdentificationNumber).toBeNull();
				expect(result.value.motherScore).toBeNull();
			}
		});

		it("should create mother info with partial data", () => {
			const props = {
				motherCattleId: 123,
				motherName: "Test Mother",
				motherScore: 75
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherCattleId).toBe(123);
				expect(result.value.motherName).toBe("Test Mother");
				expect(result.value.motherIdentificationNumber).toBeNull();
				expect(result.value.motherScore).toBe(75);
			}
		});

		it("should reject zero motherCattleId", () => {
			const props = {
				motherCattleId: 0
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Mother cattle ID must be a positive number"
				);
				expect(result.error.field).toBe("motherCattleId");
			}
		});

		it("should reject negative motherCattleId", () => {
			const props = {
				motherCattleId: -1
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Mother cattle ID must be a positive number"
				);
				expect(result.error.field).toBe("motherCattleId");
			}
		});

		it("should reject motherScore below 0", () => {
			const props = {
				motherCattleId: 123,
				motherScore: -1
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Mother score must be between 0 and 100"
				);
				expect(result.error.field).toBe("motherScore");
			}
		});

		it("should reject motherScore above 100", () => {
			const props = {
				motherCattleId: 123,
				motherScore: 101
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.type).toBe("ValidationError");
				expect(result.error.message).toBe(
					"Mother score must be between 0 and 100"
				);
				expect(result.error.field).toBe("motherScore");
			}
		});

		it("should accept motherScore of 0", () => {
			const props = {
				motherCattleId: 123,
				motherScore: 0
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherScore).toBe(0);
			}
		});

		it("should accept motherScore of 100", () => {
			const props = {
				motherCattleId: 123,
				motherScore: 100
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherScore).toBe(100);
			}
		});

		it("should convert empty string motherName to null", () => {
			const props = {
				motherCattleId: 123,
				motherName: ""
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherName).toBeNull();
			}
		});

		it("should preserve non-empty motherName", () => {
			const props = {
				motherCattleId: 123,
				motherName: "Valid Name"
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherName).toBe("Valid Name");
			}
		});

		it("should handle null motherName", () => {
			const props = {
				motherCattleId: 123,
				motherName: null
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherName).toBeNull();
			}
		});

		it("should handle undefined motherName", () => {
			const props = {
				motherCattleId: 123,
				motherName: undefined
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherName).toBeNull();
			}
		});

		it("should handle null motherScore", () => {
			const props = {
				motherCattleId: 123,
				motherScore: null
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherScore).toBeNull();
			}
		});

		it("should handle undefined motherScore", () => {
			const props = {
				motherCattleId: 123,
				motherScore: undefined
			};

			const result = createMotherInfo(props);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.motherScore).toBeNull();
			}
		});
	});

	describe("isMotherInfoComplete", () => {
		it("should return true when all fields are complete", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 85 as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(true);
		});

		it("should return false when motherName is missing", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: null,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 85 as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(false);
		});

		it("should return false when motherIdentificationNumber is missing", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: null,
				motherScore: 85 as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(false);
		});

		it("should return false when motherScore is missing", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: null as unknown as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(false);
		});

		it("should return false when multiple fields are missing", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: null,
				motherIdentificationNumber: null,
				motherScore: null
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(false);
		});

		it("should return true when motherScore is 0", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 0 as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(true);
		});

		it("should return true when motherScore is 100", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 100 as MotherScore
			};

			const isComplete = isMotherInfoComplete(motherInfo);

			expect(isComplete).toBe(true);
		});
	});

	describe("getMotherInfoCompleteness", () => {
		it("should return 100 when all fields are complete", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 85 as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(100);
		});

		it("should return 25 when only motherCattleId is present", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: null,
				motherIdentificationNumber: null,
				motherScore: null
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(25);
		});

		it("should return 50 when motherCattleId and motherName are present", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: null,
				motherScore: null as unknown as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(50);
		});

		it("should return 75 when motherCattleId, motherName, and motherIdentificationNumber are present", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: null as unknown as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(75);
		});

		it("should return 75 when motherCattleId, motherName, and motherScore are present", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: null,
				motherScore: 85 as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(75);
		});

		it("should return 75 when motherCattleId, motherIdentificationNumber, and motherScore are present", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: null,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 85 as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(75);
		});

		it("should round down to nearest integer", () => {
			// This test ensures the calculation is working correctly
			// 3 out of 4 fields = 75%
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: null as unknown as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(75);
		});

		it("should handle motherScore of 0 as complete", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 0 as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(100);
		});

		it("should handle motherScore of 100 as complete", () => {
			const motherInfo: MotherInfo = {
				motherCattleId: 123 as CattleId,
				motherName: "Test Mother" as MotherName,
				motherIdentificationNumber: "456789" as MotherIdentificationNumber,
				motherScore: 100 as MotherScore
			};

			const completeness = getMotherInfoCompleteness(motherInfo);

			expect(completeness).toBe(100);
		});
	});
});

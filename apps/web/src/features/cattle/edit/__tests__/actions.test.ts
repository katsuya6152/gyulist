import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCattleAction } from "../actions";

// Mock the cattle service
vi.mock("@/services/cattleService", () => ({
	UpdateCattleDetailed: vi.fn(),
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

describe("updateCattleAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createValidFormData = (cattleId = "1") => {
		const formData = new FormData();
		formData.append("cattleId", cattleId);
		formData.append("identificationNumber", "12345");
		formData.append("earTagNumber", "54321");
		formData.append("name", "更新テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "MULTI_PAROUS");
		formData.append("breed", "ホルスタイン");
		formData.append("notes", "更新テスト用の牛");

		// 血統情報
		formData.append("bloodline.fatherCattleName", "更新父牛");
		formData.append("bloodline.motherFatherCattleName", "更新母父牛");
		formData.append("bloodline.motherGrandFatherCattleName", "更新母祖父牛");
		formData.append(
			"bloodline.motherGreatGrandFatherCattleName",
			"更新母曾祖父牛",
		);

		// 繁殖状態
		formData.append("breedingStatus.expectedCalvingDate", "2024-12-01");
		formData.append("breedingStatus.scheduledPregnancyCheckDate", "2024-11-01");
		formData.append("breedingStatus.breedingMemo", "更新繁殖メモ");
		formData.append("breedingStatus.isDifficultBirth", "true");

		return formData;
	};

	it("should update cattle successfully with valid data", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock successful JWT verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);

		// Mock successful service call
		vi.mocked(UpdateCattleDetailed).mockResolvedValue(undefined);

		const formData = createValidFormData("123");
		const result = await updateCattleAction(null, formData);

		// 成功時のレスポンス確認
		expect(result.status).toBe("success");
		expect(UpdateCattleDetailed).toHaveBeenCalledWith("123", {
			identificationNumber: 12345,
			earTagNumber: 54321,
			name: "更新テスト牛",
			gender: "FEMALE",
			birthday: "2020-01-01",
			growthStage: "MULTI_PAROUS",
			breed: "ホルスタイン",
			notes: "更新テスト用の牛",
			bloodline: {
				fatherCattleName: "更新父牛",
				motherFatherCattleName: "更新母父牛",
				motherGrandFatherCattleName: "更新母祖父牛",
				motherGreatGrandFatherCattleName: "更新母曾祖父牛",
			},
			breedingStatus: {
				parity: null,
				expectedCalvingDate: "2024-12-01",
				scheduledPregnancyCheckDate: "2024-11-01",
				daysAfterCalving: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: null,
				breedingMemo: "更新繁殖メモ",
				isDifficultBirth: true,
			},
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const formData = createValidFormData();
		const result = await updateCattleAction(null, formData);

		expect(result).toEqual({
			status: "success",
			message: "demo",
		});
	});

	it("should update cattle successfully with minimal required data", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.append("cattleId", "456");
		formData.append("identificationNumber", "67890");
		formData.append("earTagNumber", "09876");
		formData.append("name", "最小データ牛");
		formData.append("gender", "MALE");
		formData.append("birthday", "2021-05-15");
		formData.append("growthStage", "GROWING");

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(UpdateCattleDetailed).toHaveBeenCalledWith("456", {
			identificationNumber: 67890,
			earTagNumber: 9876,
			name: "最小データ牛",
			gender: "MALE",
			birthday: "2021-05-15",
			growthStage: "GROWING",
			breed: null,
			notes: null,
		});
	});

	it("should return validation error for missing required fields", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		// 必須フィールドを設定しない

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
	});

	it("should return error when cattleId is missing", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);

		const formData = new FormData();
		formData.append("identificationNumber", "12345");
		formData.append("earTagNumber", "54321");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");
		// cattleId を設定しない

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		if (result.status === "error") {
			expect(result.error).toEqual({
				"": ["牛のIDが見つかりません"],
			});
		}
	});

	it("should return validation error for invalid data types", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("identificationNumber", "invalid"); // 数値が必要
		formData.append("earTagNumber", "54321");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
	});

	it("should redirect to login on 401 response", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized"),
		);

		const formData = createValidFormData();
		await updateCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should redirect to login on 403 response", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockRejectedValue(
			new Error("API request failed: 403 Forbidden"),
		);

		const formData = createValidFormData();
		await updateCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should return form error on API error", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockRejectedValue(
			new Error("API request failed: 400 Bad Request"),
		);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = createValidFormData();
		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		if (result.status === "error") {
			expect(result.error).toEqual({
				"": ["牛の更新に失敗しました"],
			});
		}

		consoleSpy.mockRestore();
	});

	it("should handle network errors", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockRejectedValue(
			new Error("Network error"),
		);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = createValidFormData();
		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		if (result.status === "error") {
			expect(result.error).toEqual({
				"": ["牛の更新に失敗しました"],
			});
		}

		consoleSpy.mockRestore();
	});

	it("should handle boolean conversion for isDifficultBirth", async () => {
		const { UpdateCattleDetailed } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(UpdateCattleDetailed).mockResolvedValue(undefined);

		const booleanValues = [
			{ input: "true", expected: true },
			{ input: "false", expected: false },
			{ input: "", expected: null },
		];

		for (const { input, expected } of booleanValues) {
			const formData = createValidFormData();
			formData.set("breedingStatus.isDifficultBirth", input);

			const result = await updateCattleAction(null, formData);

			expect(result.status).toBe("success");
		}
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCattleAction } from "../actions";

// Mock the cattle service
vi.mock("@/services/cattleService", () => ({
	CreateCattle: vi.fn(),
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

// Mock api-client
vi.mock("@/lib/api-client", () => ({
	isDemo: vi.fn(),
	createDemoResponse: vi.fn(),
}));

describe("createCattleAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createValidFormData = () => {
		const formData = new FormData();
		formData.append("identificationNumber", "12345");
		formData.append("earTagNumber", "54321");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");
		return formData;
	};

	it("should create cattle successfully with valid data", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		// Mock successful JWT verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);

		// Mock successful service call
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		// 成功時のレスポンス確認
		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith({
			identificationNumber: 12345,
			earTagNumber: 54321,
			name: "テスト牛",
			gender: "FEMALE",
			birthday: "2020-01-01",
			growthStage: "CALF",
			breed: null,
			notes: null,
			status: "HEALTHY",
			bloodline: undefined,
			breedingStatus: undefined,
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo, createDemoResponse } = await import("@/lib/api-client");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);
		vi.mocked(isDemo).mockReturnValue(true);
		vi.mocked(createDemoResponse).mockReturnValue({
			success: true,
			message: "demo",
		});

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		expect(result).toEqual({
			success: true,
			message: "demo",
		});
	});

	it("should create cattle with optional fields", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		formData.append("breed", "和牛");
		formData.append("notes", "テスト用のメモ");

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith({
			identificationNumber: 12345,
			earTagNumber: 54321,
			name: "テスト牛",
			gender: "FEMALE",
			birthday: "2020-01-01",
			growthStage: "CALF",
			breed: "和牛",
			notes: "テスト用のメモ",
			status: "HEALTHY",
			bloodline: undefined,
			breedingStatus: undefined,
		});
	});

	it("should create cattle with bloodline information", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		formData.append("bloodline.fatherCattleName", "父牛");
		formData.append("bloodline.motherFatherCattleName", "母父牛");
		formData.append("bloodline.motherGrandFatherCattleName", "母祖父牛");
		formData.append("bloodline.motherGreatGrandFatherCattleName", "母曽祖父牛");

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith({
			identificationNumber: 12345,
			earTagNumber: 54321,
			name: "テスト牛",
			gender: "FEMALE",
			birthday: "2020-01-01",
			growthStage: "CALF",
			breed: null,
			notes: null,
			status: "HEALTHY",
			bloodline: {
				fatherCattleName: "父牛",
				motherFatherCattleName: "母父牛",
				motherGrandFatherCattleName: "母祖父牛",
				motherGreatGrandFatherCattleName: "母曽祖父牛",
			},
			breedingStatus: undefined,
		});
	});

	it("should create cattle with partial bloodline information", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		formData.append("bloodline.fatherCattleName", "父牛");
		// 他の血統情報は空

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith(
			expect.objectContaining({
				bloodline: {
					fatherCattleName: "父牛",
					motherFatherCattleName: null,
					motherGrandFatherCattleName: null,
					motherGreatGrandFatherCattleName: null,
				},
				status: "HEALTHY",
				breedingStatus: undefined,
			}),
		);
	});

	it("should create cattle with breeding status information", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		formData.append("breedingStatus.expectedCalvingDate", "2024-12-01");
		formData.append("breedingStatus.scheduledPregnancyCheckDate", "2024-06-01");
		formData.append("breedingStatus.breedingMemo", "繁殖メモ");
		formData.append("breedingStatus.isDifficultBirth", "true");

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith(
			expect.objectContaining({
				breedingStatus: {
					parity: null,
					expectedCalvingDate: "2024-12-01",
					scheduledPregnancyCheckDate: "2024-06-01",
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: null,
					breedingMemo: "繁殖メモ",
					isDifficultBirth: true,
				},
				status: "HEALTHY",
				bloodline: undefined,
			}),
		);
	});

	it("should return validation error for missing required fields", async () => {
		const formData = new FormData();
		// 必須フィールドを設定しない

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
	});

	it("should return validation error for invalid data types", async () => {
		const formData = new FormData();
		formData.append("identificationNumber", "invalid"); // 数値が必要
		formData.append("earTagNumber", "54321");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
	});

	it("should handle all growth stages correctly", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const growthStages = [
			"CALF",
			"GROWING",
			"FATTENING",
			"FIRST_CALVED",
			"MULTI_PAROUS",
		];

		for (const growthStage of growthStages) {
			const formData = createValidFormData();
			formData.set("growthStage", growthStage);

			const result = await createCattleAction(null, formData);

			expect(result.status).toBe("success");
		}
	});

	it("should handle all genders correctly", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const genders = ["MALE", "FEMALE"];

		for (const gender of genders) {
			const formData = createValidFormData();
			formData.set("gender", gender);

			const result = await createCattleAction(null, formData);

			expect(result.status).toBe("success");
		}
	});

	it("should handle service errors", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockRejectedValue(new Error("Service error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
		if (result.status === "error") {
			expect(result.error).toEqual({
				"": ["牛の登録に失敗しました"],
			});
		}

		consoleSpy.mockRestore();
	});

	it("should redirect to login on 401 error", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized"),
		);

		const formData = createValidFormData();
		await createCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should redirect to login on 403 error", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockRejectedValue(
			new Error("API request failed: 403 Forbidden"),
		);

		const formData = createValidFormData();
		await createCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle JWT verification error", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockRejectedValue(new Error("JWT error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
		if (result.status === "error") {
			expect(result.error).toEqual({
				"": ["牛の登録に失敗しました"],
			});
		}

		consoleSpy.mockRestore();
	});

	it("should handle empty optional string fields as null", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(CreateCattle).mockResolvedValue(undefined);

		const formData = createValidFormData();
		formData.append("breed", ""); // 空文字列
		formData.append("notes", ""); // 空文字列

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("success");
		expect(CreateCattle).toHaveBeenCalledWith(
			expect.objectContaining({
				breed: null,
				notes: null,
				status: "HEALTHY",
				bloodline: undefined,
				breedingStatus: undefined,
			}),
		);
	});
});

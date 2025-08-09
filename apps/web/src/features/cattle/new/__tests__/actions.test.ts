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

		// Mock successful JWT verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);

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
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		expect(result).toEqual({
			status: "success",
			message: "demo",
		});
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

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
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

	it("should handle service errors", async () => {
		const { CreateCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
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

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(CreateCattle).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized"),
		);

		const formData = createValidFormData();
		await createCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});
});

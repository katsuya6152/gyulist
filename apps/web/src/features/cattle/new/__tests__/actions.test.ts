import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCattleAction } from "../actions";

// Mock the RPC client
vi.mock("@/lib/rpc", () => ({
	client: {
		api: {
			v1: {
				cattle: {
					$post: vi.fn(),
				},
			},
		},
	},
}));

// Mock next/headers
vi.mock("next/headers", () => ({
	cookies: vi.fn(),
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
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// Mock successful response
		vi.mocked(client.api.v1.cattle.$post).mockResolvedValue({
			ok: true,
		} as never);

		// Mock cookies
		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		} as never);

		const formData = createValidFormData();
		const result = await createCattleAction(null, formData);

		// 成功時のレスポンス確認
		expect(result.status).toBe("success");
	});

	it("should return validation error for missing required fields", async () => {
		const formData = new FormData();
		formData.append("name", "テスト牛");
		// identificationNumber, earTagNumber等の必須フィールドを省略

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toBeDefined();
	});

	it("should return validation error for invalid data types", async () => {
		const formData = new FormData();
		formData.append("identificationNumber", "invalid-number");
		formData.append("earTagNumber", "invalid-number");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");

		const result = await createCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toBeDefined();
	});

	it("should handle all growth stages correctly", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		vi.mocked(client.api.v1.cattle.$post).mockResolvedValue({
			ok: true,
		} as never);

		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		} as never);

		const growthStages = [
			"CALF",
			"GROWING",
			"FATTENING",
			"FIRST_CALVED",
			"MULTI_PAROUS",
		];

		for (const growthStage of growthStages) {
			const formData = new FormData();
			formData.append("identificationNumber", "12345");
			formData.append("earTagNumber", "54321");
			formData.append("name", "テスト牛");
			formData.append("gender", "FEMALE");
			formData.append("birthday", "2020-01-01");
			formData.append("growthStage", growthStage);

			const result = await createCattleAction(null, formData);

			expect(result.status).toBe("success");
		}
	});
});

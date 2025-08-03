import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCattleAction } from "../actions";

// Mock the RPC client
vi.mock("@/lib/rpc", () => ({
	client: {
		api: {
			v1: {
				cattle: {
					":id": {
						$patch: vi.fn(),
					},
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

		// 繁殖情報
		formData.append("breedingStatus.expectedCalvingDate", "2024-08-01");
		formData.append("breedingStatus.scheduledPregnancyCheckDate", "2024-07-01");
		formData.append("breedingStatus.breedingMemo", "更新繁殖メモ");
		formData.append("breedingStatus.isDifficultBirth", "true");

		return formData;
	};

	it("should update cattle successfully with valid data", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// Mock successful response
		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: true,
		});

		// Mock cookies
		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = createValidFormData("123");
		const result = await updateCattleAction(null, formData);

		// API呼び出しの確認
		expect(client.api.v1.cattle[":id"].$patch).toHaveBeenCalledWith(
			{
				param: { id: "123" },
				json: {
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
						motherGreatGrandFatherCattleName: null,
					},
					breedingStatus: {
						parity: null,
						expectedCalvingDate: "2024-08-01",
						scheduledPregnancyCheckDate: "2024-07-01",
						daysAfterCalving: null,
						daysOpen: null,
						pregnancyDays: null,
						daysAfterInsemination: null,
						inseminationCount: null,
						breedingMemo: "更新繁殖メモ",
						isDifficultBirth: true,
					},
				},
			},
			{
				headers: {
					Authorization: "Bearer valid-token",
				},
			},
		);

		// 成功時のレスポンス確認
		expect(result.status).toBe("success");
	});

	it("should update cattle successfully with minimal required data", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: true,
		});

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		// 最小限の必須データのみ
		const formData = new FormData();
		formData.append("cattleId", "456");
		formData.append("identificationNumber", "67890");
		formData.append("earTagNumber", "09876");
		formData.append("name", "最小テスト牛");
		formData.append("gender", "MALE");
		formData.append("birthday", "2021-01-01");
		formData.append("growthStage", "GROWING");

		const result = await updateCattleAction(null, formData);

		expect(client.api.v1.cattle[":id"].$patch).toHaveBeenCalledWith(
			{
				param: { id: "456" },
				json: {
					identificationNumber: 67890,
					earTagNumber: 9876,
					name: "最小テスト牛",
					gender: "MALE",
					birthday: "2021-01-01",
					growthStage: "GROWING",
					breed: null,
					notes: null,
					bloodline: undefined,
					breedingStatus: undefined,
				},
			},
			{
				headers: {
					Authorization: "Bearer valid-token",
				},
			},
		);

		expect(result.status).toBe("success");
	});

	it("should return validation error for missing required fields", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("name", "テスト牛");
		// identificationNumber, earTagNumber等の必須フィールドを省略

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toBeDefined();
	});

	it("should return error when cattleId is missing", async () => {
		const { cookies } = await import("next/headers");

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = new FormData();
		formData.append("identificationNumber", "12345");
		formData.append("earTagNumber", "54321");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");
		// cattleIdを省略

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toEqual({
			"": ["牛のIDが見つかりません"],
		});
	});

	it("should return validation error for invalid data types", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("identificationNumber", "invalid-number");
		formData.append("earTagNumber", "invalid-number");
		formData.append("name", "テスト牛");
		formData.append("gender", "FEMALE");
		formData.append("birthday", "2020-01-01");
		formData.append("growthStage", "CALF");

		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toBeDefined();
	});

	it("should redirect to login when no token", async () => {
		const { cookies } = await import("next/headers");
		const { redirect } = await import("next/navigation");

		const mockCookieStore = {
			get: vi.fn().mockReturnValue(undefined),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = createValidFormData();
		await updateCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should redirect to login on 401 response", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");
		const { redirect } = await import("next/navigation");

		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: false,
			status: 401,
			body: null,
			bodyUsed: false,
			statusText: "Unauthorized",
			headers: new Headers(),
			url: "",
			redirected: false,
			type: "basic" as ResponseType,
			clone: vi.fn(),
			arrayBuffer: vi.fn(),
			blob: vi.fn(),
			formData: vi.fn(),
			json: vi.fn(),
			text: vi.fn().mockResolvedValue("Unauthorized"),
		});

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "invalid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = createValidFormData();
		await updateCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should redirect to login on 403 response", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");
		const { redirect } = await import("next/navigation");

		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: false,
			status: 403,
			body: null,
			bodyUsed: false,
			statusText: "Forbidden",
			headers: new Headers(),
			url: "",
			redirected: false,
			type: "basic" as ResponseType,
			clone: vi.fn(),
			arrayBuffer: vi.fn(),
			blob: vi.fn(),
			formData: vi.fn(),
			json: vi.fn(),
			text: vi.fn().mockResolvedValue("Forbidden"),
		});

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = createValidFormData();
		await updateCattleAction(null, formData);

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should return form error on API error", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: false,
			status: 400,
			body: null,
			bodyUsed: false,
			statusText: "Bad Request",
			headers: new Headers(),
			url: "",
			redirected: false,
			type: "basic" as ResponseType,
			clone: vi.fn(),
			arrayBuffer: vi.fn(),
			blob: vi.fn(),
			formData: vi.fn(),
			json: vi.fn(),
			text: vi.fn().mockResolvedValue("Bad Request"),
		});

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const formData = createValidFormData();
		const result = await updateCattleAction(null, formData);

		expect(result.status).toBe("error");
		expect(result.error).toEqual({
			"": ["Bad Request"],
		});
	});

	it("should handle network errors", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		vi.mocked(client.api.v1.cattle[":id"].$patch).mockRejectedValue(
			new Error("Network error"),
		);

		const mockCookieStore = {
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		};
		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue(mockCookieStore);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = createValidFormData();
		const result = await updateCattleAction(null, formData);

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to update cattle:",
			expect.any(Error),
		);
		expect(result.status).toBe("error");
		expect(result.error).toEqual({
			"": ["牛の更新に失敗しました"],
		});

		consoleSpy.mockRestore();
	});

	it("should handle boolean conversion for isDifficultBirth", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// @ts-expect-error
		vi.mocked(client.api.v1.cattle[":id"].$patch).mockResolvedValue({
			ok: true,
		});

		// @ts-ignore
		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		});

		// Boolean変換のテスト
		const testCases = [
			{ input: "true", expected: true },
			{ input: "false", expected: false },
		];

		for (const testCase of testCases) {
			const formData = new FormData();
			formData.append("cattleId", "1");
			formData.append("identificationNumber", "12345");
			formData.append("earTagNumber", "54321");
			formData.append("name", "テスト牛");
			formData.append("gender", "FEMALE");
			formData.append("birthday", "2020-01-01");
			formData.append("growthStage", "CALF");
			formData.append("breedingStatus.isDifficultBirth", testCase.input);

			const result = await updateCattleAction(null, formData);

			expect(result.status).toBe("success");
		}
	});
});

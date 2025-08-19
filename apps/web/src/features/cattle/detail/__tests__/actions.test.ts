import type { GetCattleDetailResType } from "@/services/cattleService";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	deleteCattleAction,
	updateNotesAction,
	updateStatusAction
} from "../actions";

// Mock the cattle service
vi.mock("@/services/cattleService", () => ({
	DeleteCattle: vi.fn(),
	updateStatus: vi.fn(),
	UpdateCattle: vi.fn(),
	GetCattleDetail: vi.fn()
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn()
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	redirect: vi.fn()
}));

describe("deleteCattleAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should delete cattle successfully", async () => {
		const { DeleteCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock successful JWT verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);

		// Mock successful service call
		vi.mocked(DeleteCattle).mockResolvedValue(undefined);

		const result = await deleteCattleAction(123);

		expect(DeleteCattle).toHaveBeenCalledWith(123);
		expect(result).toEqual({
			success: true
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const result = await deleteCattleAction(123);

		expect(result).toEqual({
			success: true,
			message: "demo"
		});
	});

	it("should handle network errors", async () => {
		const { DeleteCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(DeleteCattle).mockRejectedValue(new Error("Network error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await deleteCattleAction(789);

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to delete cattle:",
			expect.any(Error)
		);
		expect(result).toEqual({
			success: false,
			error: "牛の削除に失敗しました"
		});

		consoleSpy.mockRestore();
	});

	it("should redirect to login on 401 error", async () => {
		const { DeleteCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(DeleteCattle).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized")
		);

		await deleteCattleAction(123);

		expect(redirect).toHaveBeenCalledWith("/login");
	});
});

describe("updateStatusAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should update status successfully", async () => {
		const { updateStatus } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(updateStatus).mockResolvedValue(undefined);

		const result = await updateStatusAction(1, "HEALTHY", "test");

		expect(updateStatus).toHaveBeenCalledWith(1, "HEALTHY", "test");
		expect(result).toEqual({ success: true });
	});

	it("should handle errors", async () => {
		const { updateStatus } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(updateStatus).mockRejectedValue(new Error("error"));

		const result = await updateStatusAction(1, "HEALTHY");

		expect(result).toEqual({
			success: false,
			error: "ステータスの更新に失敗しました"
		});
	});
});

describe("updateNotesAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockCattle = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "雌" as const,
		birthday: "2020-01-01",
		growthStage: "MULTI_PAROUS" as const,
		breed: "ホルスタイン",
		notes: "元のメモ",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		ownerUserId: 1,
		age: 4,
		monthsOld: 48,
		daysOld: 1460,
		score: 85,
		producerName: "テスト生産者",
		barn: "A棟",
		breedingValue: "120",
		weight: null,
		bloodline: null,
		breedingStatus: null,
		motherInfo: null,
		breedingSummary: null,
		events: [],
		status: "HEALTHY" as const,
		healthStatus: "健康"
	} as GetCattleDetailResType;

	it("should update notes successfully", async () => {
		const { UpdateCattle, GetCattleDetail } = await import(
			"@/services/cattleService"
		);
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);
		vi.mocked(UpdateCattle).mockResolvedValue(undefined);

		const result = await updateNotesAction(1, "新しいメモ");

		expect(GetCattleDetail).toHaveBeenCalledWith(1);
		expect(UpdateCattle).toHaveBeenCalledWith(1, {
			identificationNumber: 12345,
			earTagNumber: 54321,
			name: "テスト牛",
			gender: "雌",
			birthday: "2020-01-01",
			growthStage: "MULTI_PAROUS",
			breed: "ホルスタイン",
			notes: "新しいメモ"
		});
		expect(result).toEqual({ success: true });
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const result = await updateNotesAction(1, "新しいメモ");

		expect(result).toEqual({
			success: true,
			message: "demo"
		});
	});

	it("should handle null values in cattle data", async () => {
		const { UpdateCattle, GetCattleDetail } = await import(
			"@/services/cattleService"
		);
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		const cattleWithNulls = {
			...mockCattle,
			identificationNumber: undefined,
			earTagNumber: null,
			name: null,
			gender: null,
			birthday: null,
			growthStage: null,
			breed: null
		};

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(GetCattleDetail).mockResolvedValue(cattleWithNulls);
		vi.mocked(UpdateCattle).mockResolvedValue(undefined);

		const result = await updateNotesAction(1, "新しいメモ");

		expect(UpdateCattle).toHaveBeenCalledWith(1, {
			identificationNumber: 0,
			earTagNumber: 0,
			name: "",
			gender: "雌",
			birthday: "",
			growthStage: "CALF",
			breed: null,
			notes: "新しいメモ"
		});
		expect(result).toEqual({ success: true });
	});

	it("should handle errors", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(GetCattleDetail).mockRejectedValue(new Error("Network error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await updateNotesAction(1, "新しいメモ");

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to update cattle notes:",
			expect.any(Error)
		);
		expect(result).toEqual({
			success: false,
			error: "メモの更新に失敗しました"
		});

		consoleSpy.mockRestore();
	});

	it("should redirect to login on 401 error", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(GetCattleDetail).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized")
		);

		await updateNotesAction(1, "新しいメモ");

		expect(redirect).toHaveBeenCalledWith("/login");
	});
});

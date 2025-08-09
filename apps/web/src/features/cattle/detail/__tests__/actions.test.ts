import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCattleAction } from "../actions";

// Mock the cattle service
vi.mock("@/services/cattleService", () => ({
	DeleteCattle: vi.fn(),
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
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
			success: true,
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const result = await deleteCattleAction(123);

		expect(result).toEqual({
			success: true,
			message: "demo",
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
			expect.any(Error),
		);
		expect(result).toEqual({
			success: false,
			error: "牛の削除に失敗しました",
		});

		consoleSpy.mockRestore();
	});

	it("should redirect to login on 401 error", async () => {
		const { DeleteCattle } = await import("@/services/cattleService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { redirect } = await import("next/navigation");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(DeleteCattle).mockRejectedValue(
			new Error("API request failed: 401 Unauthorized"),
		);

		await deleteCattleAction(123);

		expect(redirect).toHaveBeenCalledWith("/login");
	});
});

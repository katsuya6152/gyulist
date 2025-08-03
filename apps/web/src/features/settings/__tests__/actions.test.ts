import { describe, expect, it, vi } from "vitest";
import { logoutAction } from "../actions";

// Mock the original logout action
vi.mock("../../../app/(auth)/login/actions", () => ({
	logoutAction: vi.fn(),
}));

describe("logoutAction", () => {
	it("should call the original logout action", async () => {
		const { logoutAction: originalLogoutAction } = await import(
			"../../../app/(auth)/login/actions"
		);

		await logoutAction();

		expect(originalLogoutAction).toHaveBeenCalledTimes(1);
	});

	it("should handle errors from original logout action", async () => {
		const { logoutAction: originalLogoutAction } = await import(
			"../../../app/(auth)/login/actions"
		);
		const mockError = new Error("Original logout failed");
		vi.mocked(originalLogoutAction).mockRejectedValue(mockError);

		await expect(logoutAction()).rejects.toThrow("Original logout failed");
	});
});

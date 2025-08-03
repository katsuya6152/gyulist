import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCattleAction } from "../actions";

// Mock the RPC client
vi.mock("@/lib/rpc", () => ({
	client: {
		api: {
			v1: {
				cattle: {
					":id": {
						$delete: vi.fn(),
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

describe("deleteCattleAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should delete cattle successfully", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		// Mock successful response
		vi.mocked(client.api.v1.cattle[":id"].$delete).mockResolvedValue({
			ok: true,
		} as never);

		// Mock cookies
		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		} as never);

		const result = await deleteCattleAction("123");

		expect(result).toEqual({
			success: true,
		});
	});

	it("should redirect to login when no token", async () => {
		const { cookies } = await import("next/headers");
		const { redirect } = await import("next/navigation");

		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue(undefined),
		} as never);

		await deleteCattleAction("123");

		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle network errors", async () => {
		const { client } = await import("@/lib/rpc");
		const { cookies } = await import("next/headers");

		vi.mocked(client.api.v1.cattle[":id"].$delete).mockRejectedValue(
			new Error("Network error"),
		);

		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "valid-token" }),
		} as never);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await deleteCattleAction("789");

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
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-client", () => ({
	fetchWithAuth: vi.fn((fn) => fn("token")),
}));

const patchMock = vi
	.fn()
	.mockResolvedValue(new Response(null, { status: 200 }));

vi.mock("@/lib/rpc", () => ({
	client: {
		api: {
			v1: {
				cattle: {
					":id": {
						status: {
							$patch: patchMock,
						},
					},
				},
			},
		},
	},
}));

import { updateCattleStatus } from "@/services/cattleService";

describe("updateCattleStatus", () => {
	it("should call patch endpoint with correct params", async () => {
		await updateCattleStatus(1, "HEALTHY", "reason");
		expect(patchMock).toHaveBeenCalledWith(
			{
				param: { id: "1" },
				json: { status: "HEALTHY", reason: "reason" },
			},
			{ headers: { Authorization: "Bearer token" } },
		);
	});
});

import { updateCattleStatus } from "@/services/cattleService";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-client", () => ({
	fetchWithAuth: vi.fn((cb: (token: string) => unknown) => cb("token")),
}));

let patchMock: ReturnType<typeof vi.fn>;
vi.mock("@/lib/rpc", () => {
	patchMock = vi.fn();
	return {
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
	};
});

describe("updateCattleStatus", () => {
	it("should call PATCH /cattle/:id/status with token", async () => {
		await updateCattleStatus(1, "ACTIVE", "test");
		expect(patchMock).toHaveBeenCalledWith(
			{
				param: { id: "1" },
				json: { status: "ACTIVE", reason: "test" },
			},
			{ headers: { Authorization: "Bearer token" } },
		);
	});
});

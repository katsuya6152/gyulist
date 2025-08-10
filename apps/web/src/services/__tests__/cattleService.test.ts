import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-client", () => ({
	fetchWithAuth: (cb: (token: string) => Promise<unknown>) => cb("test-token"),
}));
vi.mock("@/lib/rpc", () => {
	const patchMock = vi.fn();
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
		patchMock,
	};
});

describe("updateCattleStatus", () => {
	it("calls PATCH with correct parameters", async () => {
		const { updateCattleStatus } = await import("../cattleService");
		const { patchMock } = await import("@/lib/rpc");
		vi.mocked(patchMock).mockResolvedValueOnce(undefined);
		await updateCattleStatus(1, "HEALTHY", "test");
		expect(patchMock).toHaveBeenCalledWith(
			{
				param: { id: "1" },
				json: { status: "HEALTHY", reason: "test" },
			},
			{ headers: { Authorization: "Bearer test-token" } },
		);
	});
});

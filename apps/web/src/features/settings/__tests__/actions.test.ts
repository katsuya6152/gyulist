import { beforeEach, describe, expect, it, vi } from "vitest";
// NOTE: Import actions dynamically in each test to ensure mocks take effect before module evaluation.

vi.mock("next/headers", () => ({
	cookies: vi.fn().mockResolvedValue({ get: () => ({ value: "token" }) })
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn()
}));

vi.mock("@/lib/api-client", () => ({
	createDemoResponse: vi.fn((success: boolean) => ({
		success,
		message: "demo" as const
	})),
	isDemo: vi.fn(() => false)
}));

vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn(async () => 2)
}));

vi.mock("@/services/themeService", () => ({
	updateTheme: vi.fn(async () => {})
}));

vi.mock("../../../app/(auth)/login/actions", () => ({
	logoutAction: vi.fn(async () => {})
}));

describe("settings actions", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { isDemo } = await import("@/lib/api-client");
		vi.mocked(isDemo).mockReturnValue(false);
	});

	it("updates theme when authenticated", async () => {
		const { updateThemeAction } = await import("../actions");
		const { updateTheme } = await import("@/services/themeService");
		const res = await updateThemeAction("dark");
		expect(res).toEqual({ success: true });
		expect(updateTheme).toHaveBeenCalledWith(2, "dark");
	});

	it("redirects to login when no token", async () => {
		const { cookies } = await import("next/headers");
		const { redirect } = await import("next/navigation");

		type CookieValue = { name?: string; value?: string } | undefined;
		vi.mocked(cookies).mockResolvedValue({
			get: (_name?: string): CookieValue => undefined
		} as unknown as Awaited<ReturnType<typeof cookies>>);

		const { updateThemeAction } = await import("../actions");
		await updateThemeAction("light");
		expect(redirect).toHaveBeenCalledWith("/login");
	});

	it("returns demo response for demo user", async () => {
		const { isDemo, createDemoResponse } = await import("@/lib/api-client");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);
		vi.mocked(isDemo).mockReturnValue(true);
		vi.mocked(createDemoResponse).mockReturnValue({
			success: true,
			message: "demo"
		});

		const { updateThemeAction } = await import("../actions");
		const res = await updateThemeAction("system");
		expect(res).toEqual({ success: true, message: "demo" });
	});

	it("handles service error gracefully", async () => {
		const { updateTheme } = await import("@/services/themeService");
		vi.mocked(updateTheme).mockRejectedValue(new Error("fail"));

		const { updateThemeAction } = await import("../actions");
		const res = await updateThemeAction("dark");
		expect(res).toEqual({
			success: false,
			error: "テーマの更新に失敗しました"
		});
	});

	it("delegates logout action", async () => {
		const { logoutAction: original } = await import(
			"../../../app/(auth)/login/actions"
		);
		const { logoutAction } = await import("../actions");
		await logoutAction();
		expect(original).toHaveBeenCalled();
	});
});

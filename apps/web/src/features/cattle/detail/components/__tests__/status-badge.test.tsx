import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusBadge } from "../status-badge";

vi.mock("../../actions", () => ({
	updateCattleStatusAction: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("StatusBadge", () => {
	beforeAll(() => {
		// jsdom lacks pointer capture APIs used by Radix Select
		// @ts-ignore
		window.HTMLElement.prototype.hasPointerCapture = () => {};
		// @ts-ignore
		window.HTMLElement.prototype.releasePointerCapture = () => {};
	});
	it("opens dialog and submits status", async () => {
		const user = userEvent.setup();
		const { updateCattleStatusAction } = await import("../../actions");
		vi.mocked(updateCattleStatusAction).mockResolvedValue({ success: true });

		render(<StatusBadge cattleId={1} status="健康" />);

		await user.click(screen.getByText("健康"));
		await user.click(screen.getByRole("button", { name: "保存" }));

		expect(updateCattleStatusAction).toHaveBeenCalledWith(
			1,
			"HEALTHY",
			undefined,
		);
	});
});

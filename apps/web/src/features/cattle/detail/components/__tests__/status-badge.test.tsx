import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusBadge } from "../status-badge";

vi.mock("../../actions", () => ({
	updateCattleStatusAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

describe("StatusBadge", () => {
	it("updates status when submitted", async () => {
		const user = userEvent.setup();
		render(<StatusBadge cattleId={1} status="HEALTHY" />);

		expect(screen.getByText("健康")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "ステータス変更" }));
		await user.click(screen.getByRole("button", { name: "ステータスを選択" }));
		await user.click(screen.getByRole("option", { name: "治療中" }));
		await user.type(screen.getByPlaceholderText("理由 (任意)"), "test");
		await user.click(screen.getByRole("button", { name: "更新" }));

		const { updateCattleStatusAction } = await import("../../actions");
		expect(updateCattleStatusAction).toHaveBeenCalledWith(
			1,
			"TREATING",
			"test",
		);
	});
});

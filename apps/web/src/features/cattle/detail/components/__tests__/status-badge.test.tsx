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

		// Check that the dialog content is rendered correctly
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
		expect(screen.getByPlaceholderText("理由 (任意)")).toBeInTheDocument();

		// Type in the reason field
		await user.type(screen.getByPlaceholderText("理由 (任意)"), "test");

		// Click the update button
		await user.click(screen.getByRole("button", { name: "更新" }));

		const { updateCattleStatusAction } = await import("../../actions");
		expect(updateCattleStatusAction).toHaveBeenCalledWith(
			1,
			"HEALTHY", // Current status since we didn't change it
			"test",
		);
	});
});

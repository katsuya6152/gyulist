import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusBadge } from "../status-badge";

// Mock the action
vi.mock("../../actions", () => ({
	updateCattleStatusAction: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock the toast
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
		expect(
			screen.getByPlaceholderText("ステータス変更の理由を入力してください"),
		).toBeInTheDocument();

		// Type in the reason field
		await user.type(
			screen.getByPlaceholderText("ステータス変更の理由を入力してください"),
			"test",
		);

		// Click the update button
		await user.click(screen.getByRole("button", { name: "更新" }));

		const { updateCattleStatusAction } = await import("../../actions");
		expect(updateCattleStatusAction).toHaveBeenCalledWith(
			1,
			"HEALTHY", // Current status since we didn't change it
			"test",
		);
	});

	it("shows warning when changing from final status", async () => {
		const user = userEvent.setup();
		render(<StatusBadge cattleId={1} status="DEAD" />);

		expect(screen.getByText("死亡")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "ステータス変更" }));

		// Check that the dialog content is rendered correctly
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		// Select a different status to trigger warning
		const statusSelect = screen.getByRole("combobox");
		await user.click(statusSelect);

		// Select HEALTHY status
		const healthyOption = screen.getByText("健康");
		await user.click(healthyOption);

		// Check that warning is displayed
		expect(
			screen.getByText("注意: 最終ステータスからの変更"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"死亡の牛のステータスを変更しようとしています。この操作は適切ですか？",
			),
		).toBeInTheDocument();

		// Check that button text changes
		expect(
			screen.getByRole("button", { name: "注意して更新" }),
		).toBeInTheDocument();
	});

	it("allows status change from final status", async () => {
		const user = userEvent.setup();
		render(<StatusBadge cattleId={1} status="SHIPPED" />);

		expect(screen.getByText("出荷済")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "ステータス変更" }));

		// Check that the dialog content is rendered correctly
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		// Select a different status
		const statusSelect = screen.getByRole("combobox");
		await user.click(statusSelect);

		// Select HEALTHY status
		const healthyOption = screen.getByText("健康");
		await user.click(healthyOption);

		// Check that warning is displayed
		expect(
			screen.getByText("注意: 最終ステータスからの変更"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"出荷済みの牛のステータスを変更しようとしています。この操作は適切ですか？",
			),
		).toBeInTheDocument();

		// Submit the change
		await user.click(screen.getByRole("button", { name: "注意して更新" }));

		const { updateCattleStatusAction } = await import("../../actions");
		expect(updateCattleStatusAction).toHaveBeenCalledWith(1, "HEALTHY", "");
	});
});

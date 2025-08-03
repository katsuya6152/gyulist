import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPresentation } from "../presentational";

// Mock the actions
vi.mock("../actions", () => ({
	logoutAction: vi.fn(),
}));

// Mock window.confirm
Object.defineProperty(window, "confirm", {
	writable: true,
	value: vi.fn(),
});

describe("SettingsPresentation", () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render settings page correctly", () => {
		render(<SettingsPresentation />);

		// ページタイトルと説明を確認
		expect(screen.getByText("設定")).toBeInTheDocument();
		expect(
			screen.getByText("アカウント設定とアプリケーションの設定を管理します"),
		).toBeInTheDocument();

		// アカウント設定カードを確認
		expect(screen.getByText("アカウント")).toBeInTheDocument();
		expect(
			screen.getByText("アカウントに関する設定を管理します"),
		).toBeInTheDocument();

		// ログアウトセクションを確認（h3要素とbutton要素を区別）
		expect(
			screen.getByRole("heading", { level: 3, name: "ログアウト" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("現在のセッションからログアウトします"),
		).toBeInTheDocument();

		// ログアウトボタンを確認
		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		expect(logoutButton).toBeInTheDocument();
		expect(logoutButton).not.toBeDisabled();

		// アプリケーション設定カードを確認
		expect(screen.getByText("アプリケーション設定")).toBeInTheDocument();
		expect(
			screen.getByText("アプリケーションの動作に関する設定"),
		).toBeInTheDocument();
		expect(screen.getByText("設定項目は今後追加予定です")).toBeInTheDocument();
	});

	it("should handle logout confirmation - cancel", async () => {
		const mockConfirm = vi.mocked(window.confirm);
		mockConfirm.mockReturnValue(false);

		render(<SettingsPresentation />);

		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		await user.click(logoutButton);

		expect(mockConfirm).toHaveBeenCalledWith("ログアウトしますか？");
		// ログアウトアクションは呼ばれない
		const { logoutAction } = await import("../actions");
		expect(logoutAction).not.toHaveBeenCalled();
	});

	it("should handle logout confirmation - confirm and success", async () => {
		const mockConfirm = vi.mocked(window.confirm);
		mockConfirm.mockReturnValue(true);

		const { logoutAction } = await import("../actions");
		vi.mocked(logoutAction).mockResolvedValue(undefined);

		render(<SettingsPresentation />);

		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		await user.click(logoutButton);

		expect(mockConfirm).toHaveBeenCalledWith("ログアウトしますか？");
		expect(logoutAction).toHaveBeenCalled();
	});

	it("should handle logout error", async () => {
		const mockConfirm = vi.mocked(window.confirm);
		mockConfirm.mockReturnValue(true);

		const { logoutAction } = await import("../actions");
		const mockError = new Error("Logout failed");
		vi.mocked(logoutAction).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(<SettingsPresentation />);

		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		await user.click(logoutButton);

		// エラーがコンソールに出力されることを確認
		expect(consoleSpy).toHaveBeenCalledWith("Logout error:", mockError);

		// ボタンが再び有効になることを確認
		expect(logoutButton).not.toBeDisabled();
		expect(logoutButton).toHaveTextContent("ログアウト");

		consoleSpy.mockRestore();
	});

	it("should show loading state during logout", async () => {
		const mockConfirm = vi.mocked(window.confirm);
		mockConfirm.mockReturnValue(true);

		const { logoutAction } = await import("../actions");
		let resolveLogout: (() => void) | undefined;
		const logoutPromise = new Promise<void>((resolve) => {
			resolveLogout = resolve;
		});
		vi.mocked(logoutAction).mockReturnValue(logoutPromise);

		render(<SettingsPresentation />);

		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		await user.click(logoutButton);

		// ローディング状態を確認
		expect(logoutButton).toBeDisabled();
		expect(logoutButton).toHaveTextContent("ログアウト中...");

		// ログアウト完了
		if (resolveLogout) {
			resolveLogout();
		}
		await logoutPromise;
	});

	it("should display icons correctly", () => {
		render(<SettingsPresentation />);

		// User iconとLogOut iconが存在することを確認
		// アイコンはaria-hiddenなので、親要素の存在で確認
		const accountTitle = screen.getByText("アカウント");
		const logoutButton = screen.getByRole("button", { name: "ログアウト" });

		expect(accountTitle.closest(".flex")).toBeInTheDocument();
		expect(logoutButton.querySelector("svg")).toBeInTheDocument();
	});
});

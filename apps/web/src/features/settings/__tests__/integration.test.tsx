import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsContainer } from "../container";

// Mock the logout action only
vi.mock("../../../app/(auth)/login/actions", () => ({
	logoutAction: vi.fn(),
}));

// Mock window.confirm
Object.defineProperty(window, "confirm", {
	writable: true,
	value: vi.fn(),
});

describe("Settings Integration", () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render complete settings page through container", () => {
		render(<SettingsContainer />);

		// 全体の構造を確認
		expect(screen.getByText("設定")).toBeInTheDocument();
		expect(screen.getByText("アカウント")).toBeInTheDocument();
		expect(screen.getByText("アプリケーション設定")).toBeInTheDocument();

		// ログアウトボタンが存在し、機能することを確認
		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		expect(logoutButton).toBeInTheDocument();
		expect(logoutButton).not.toBeDisabled();
	});

	it("should handle complete logout flow", async () => {
		const mockConfirm = vi.mocked(window.confirm);
		mockConfirm.mockReturnValue(true);

		const { logoutAction } = await import("../../../app/(auth)/login/actions");
		vi.mocked(logoutAction).mockResolvedValue(undefined);

		render(<SettingsContainer />);

		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		await user.click(logoutButton);

		// 確認ダイアログが表示され、ログアウトアクションが呼ばれることを確認
		expect(mockConfirm).toHaveBeenCalledWith("ログアウトしますか？");
		expect(logoutAction).toHaveBeenCalled();
	});

	it("should display proper card structure", () => {
		render(<SettingsContainer />);

		// カードの構造を確認
		const accountCard = screen
			.getByText("アカウント")
			.closest("[class*='card']");
		const appCard = screen
			.getByText("アプリケーション設定")
			.closest("[class*='card']");

		expect(accountCard).toBeInTheDocument();
		expect(appCard).toBeInTheDocument();

		// アカウントカード内のコンテンツを確認
		expect(
			screen.getByText("アカウントに関する設定を管理します"),
		).toBeInTheDocument();
		expect(
			screen.getByText("現在のセッションからログアウトします"),
		).toBeInTheDocument();

		// アプリケーション設定カード内のコンテンツを確認
		expect(
			screen.getByText("アプリケーションの動作に関する設定"),
		).toBeInTheDocument();

		// テーマ設定の確認
		expect(screen.getByText("テーマ")).toBeInTheDocument();
		expect(
			screen.getByText("アプリケーションの見た目をカスタマイズします"),
		).toBeInTheDocument();
		expect(screen.getByText("ライトモード")).toBeInTheDocument();
		expect(screen.getByText("ダークモード")).toBeInTheDocument();
		expect(screen.getByText("システム設定に従う")).toBeInTheDocument();
	});
});

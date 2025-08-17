import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPresentation } from "../presentational";

// Mock the actions
vi.mock("../actions", () => ({
	logoutAction: vi.fn(),
	updateThemeAction: vi.fn()
}));

// Mock the theme provider
vi.mock("@/lib/theme-provider", () => ({
	useTheme: vi.fn()
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		info: vi.fn(),
		success: vi.fn(),
		error: vi.fn()
	}
}));

// Mock window.confirm
Object.defineProperty(window, "confirm", {
	writable: true,
	value: vi.fn()
});

describe("SettingsPresentation", () => {
	const user = userEvent.setup();
	const mockSetTheme = vi.fn();

	beforeEach(async () => {
		vi.clearAllMocks();

		const { useTheme } = vi.mocked(await import("@/lib/theme-provider"));
		useTheme.mockReturnValue({
			theme: "light",
			setTheme: mockSetTheme
		});
	});

	it("should render settings page correctly", () => {
		render(<SettingsPresentation />);

		// ページタイトルと説明を確認
		expect(screen.getByText("設定")).toBeInTheDocument();
		expect(
			screen.getByText("アカウント設定とアプリケーションの設定を管理します")
		).toBeInTheDocument();

		// アカウント設定カードを確認
		expect(screen.getByText("アカウント")).toBeInTheDocument();
		expect(
			screen.getByText("アカウントに関する設定を管理します")
		).toBeInTheDocument();

		// ログアウトセクションを確認（h3要素とbutton要素を区別）
		expect(
			screen.getByRole("heading", { level: 3, name: "ログアウト" })
		).toBeInTheDocument();
		expect(
			screen.getByText("現在のセッションからログアウトします")
		).toBeInTheDocument();

		// ログアウトボタンを確認
		const logoutButton = screen.getByRole("button", { name: "ログアウト" });
		expect(logoutButton).toBeInTheDocument();
		expect(logoutButton).not.toBeDisabled();

		// アプリケーション設定カードを確認
		expect(screen.getByText("アプリケーション設定")).toBeInTheDocument();
		expect(
			screen.getByText("アプリケーションの動作に関する設定")
		).toBeInTheDocument();

		// テーマ設定の確認
		expect(screen.getByText("テーマ")).toBeInTheDocument();
		expect(
			screen.getByText("アプリケーションの見た目をカスタマイズします")
		).toBeInTheDocument();
		expect(screen.getByText("ライトモード")).toBeInTheDocument();
		expect(screen.getByText("ダークモード")).toBeInTheDocument();
		expect(screen.getByText("システム設定に従う")).toBeInTheDocument();
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

	it("should handle theme change to dark", async () => {
		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockResolvedValue({ success: true });

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
			expect(updateThemeAction).toHaveBeenCalledWith("dark");
			expect(toast.success).toHaveBeenCalledWith("テーマを更新しました");
		});
	});

	it("should handle theme change to light", async () => {
		const { useTheme } = vi.mocked(await import("@/lib/theme-provider"));
		useTheme.mockReturnValue({
			theme: "dark",
			setTheme: mockSetTheme
		});

		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockResolvedValue({ success: true });

		render(<SettingsPresentation />);

		const lightModeRadio = screen.getByLabelText("ライトモード");
		await user.click(lightModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("light");
			expect(updateThemeAction).toHaveBeenCalledWith("light");
			expect(toast.success).toHaveBeenCalledWith("テーマを更新しました");
		});
	});

	it("should handle theme change to system", async () => {
		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockResolvedValue({ success: true });

		render(<SettingsPresentation />);

		const systemModeRadio = screen.getByLabelText("システム設定に従う");
		await user.click(systemModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("system");
			expect(updateThemeAction).toHaveBeenCalledWith("system");
			expect(toast.success).toHaveBeenCalledWith("テーマを更新しました");
		});
	});

	it("should handle demo user theme change", async () => {
		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockResolvedValue({
			success: true,
			message: "demo"
		});

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
			expect(updateThemeAction).toHaveBeenCalledWith("dark");
			expect(toast.info).toHaveBeenCalledWith("テーマを更新しました", {
				description:
					"デモアカウントのため、実際にデータベースには保存されていません"
			});
		});
	});

	it("should handle theme change error and revert theme", async () => {
		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockResolvedValue({
			success: false,
			error: "テーマの更新に失敗しました"
		});

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
			expect(updateThemeAction).toHaveBeenCalledWith("dark");
			expect(toast.error).toHaveBeenCalledWith("テーマの更新に失敗しました");
			// テーマが元に戻される
			expect(mockSetTheme).toHaveBeenCalledWith("light");
		});
	});

	it("should handle theme change exception and revert theme", async () => {
		const { updateThemeAction } = await import("../actions");
		const { toast } = await import("sonner");

		vi.mocked(updateThemeAction).mockRejectedValue(new Error("Network error"));

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		await waitFor(() => {
			expect(mockSetTheme).toHaveBeenCalledWith("dark");
			expect(updateThemeAction).toHaveBeenCalledWith("dark");
			expect(consoleSpy).toHaveBeenCalledWith(
				"Failed to update theme:",
				expect.any(Error)
			);
			expect(toast.error).toHaveBeenCalledWith("テーマの更新に失敗しました");
			// テーマが元に戻される
			expect(mockSetTheme).toHaveBeenCalledWith("light");
		});

		consoleSpy.mockRestore();
	});

	it("should show loading state during theme update", async () => {
		const { updateThemeAction } = await import("../actions");

		// Never resolving promise to keep loading state
		vi.mocked(updateThemeAction).mockImplementation(
			() => new Promise(() => {})
		);

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		// Loading state should be shown - use getAllByText to expect multiple instances
		const loadingElements = screen.getAllByText("(保存中...)");
		expect(loadingElements).toHaveLength(3); // One for each theme option
	});

	it("should display current theme correctly", async () => {
		const { useTheme } = vi.mocked(await import("@/lib/theme-provider"));
		useTheme.mockReturnValue({
			theme: "dark",
			setTheme: mockSetTheme
		});

		render(<SettingsPresentation />);

		// Dark mode should be selected
		const darkModeRadio = screen.getByRole("radio", { name: /ダークモード/ });
		expect(darkModeRadio).toBeChecked();
	});

	it("should disable theme options during update", async () => {
		const { updateThemeAction } = await import("../actions");

		// Never resolving promise to keep loading state
		vi.mocked(updateThemeAction).mockImplementation(
			() => new Promise(() => {})
		);

		render(<SettingsPresentation />);

		const darkModeRadio = screen.getByLabelText("ダークモード");
		await user.click(darkModeRadio);

		// All radio buttons should be disabled during update
		const lightModeRadio = screen.getByRole("radio", { name: /ライトモード/ });
		const systemModeRadio = screen.getByRole("radio", {
			name: /システム設定に従う/
		});

		expect(lightModeRadio).toBeDisabled();
		expect(darkModeRadio).toBeDisabled();
		expect(systemModeRadio).toBeDisabled();
	});
});

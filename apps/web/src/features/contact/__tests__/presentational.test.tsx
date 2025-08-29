import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ContactPresentation } from "../presentational";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock("../actions", () => ({
	submitContactForm: vi.fn()
}));

describe("ContactPresentation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("フォームの要素が正しく表示される", () => {
		render(<ContactPresentation />);

		expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
		expect(screen.getByLabelText(/お名前/)).toBeInTheDocument();
		expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
		expect(screen.getByLabelText(/件名/)).toBeInTheDocument();
		expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "送信する" })
		).toBeInTheDocument();
	});

	it("必須項目が空の場合にエラーメッセージが表示される", async () => {
		render(<ContactPresentation />);

		const submitButton = screen.getByRole("button", { name: "送信する" });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("すべての項目を入力してください")
			).toBeInTheDocument();
		});
	});

	it("フォーム送信が成功した場合に成功メッセージが表示される", async () => {
		const mockSubmitContactForm = vi.fn().mockResolvedValue({ success: true });
		vi.doMock("../actions", () => ({
			submitContactForm: mockSubmitContactForm
		}));

		render(<ContactPresentation />);

		// フォームに値を入力
		fireEvent.change(screen.getByLabelText(/お名前/), {
			target: { value: "テスト太郎" }
		});
		fireEvent.change(screen.getByLabelText(/メールアドレス/), {
			target: { value: "test@example.com" }
		});
		fireEvent.change(screen.getByLabelText(/件名/), {
			target: { value: "general" }
		});
		fireEvent.change(screen.getByLabelText(/お問い合わせ内容/), {
			target: { value: "テストメッセージです" }
		});

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "送信する" });
		fireEvent.click(submitButton);

		// 送信中状態の確認
		expect(screen.getByText("送信中...")).toBeInTheDocument();
	});

	it("件名のセレクトボックスに適切なオプションが表示される", () => {
		render(<ContactPresentation />);

		const subjectSelect = screen.getByRole("combobox");
		fireEvent.click(subjectSelect);

		expect(screen.getByText("一般的なお問い合わせ")).toBeInTheDocument();
		expect(screen.getByText("技術的なサポート")).toBeInTheDocument();
		expect(screen.getByText("機能のご要望")).toBeInTheDocument();
		expect(screen.getByText("バグの報告")).toBeInTheDocument();
		expect(screen.getByText("料金に関するお問い合わせ")).toBeInTheDocument();
		expect(screen.getByText("その他")).toBeInTheDocument();
	});
});

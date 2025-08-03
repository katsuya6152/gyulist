import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CattleNewPresentation } from "../presentational";

// Mock Next.js navigation
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

describe("CattleNewPresentation", () => {
	it("should render new cattle form", () => {
		render(<CattleNewPresentation error={undefined} />);

		expect(screen.getByLabelText(/個体識別番号/)).toBeInTheDocument();
		expect(screen.getByLabelText(/耳標番号/)).toBeInTheDocument();
		expect(screen.getByLabelText(/名号/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
	});

	it("should validate required fields", async () => {
		const user = userEvent.setup();
		render(<CattleNewPresentation error={undefined} />);

		// 登録ボタンをクリック
		await user.click(screen.getByRole("button", { name: "登録" }));

		// バリデーションエラーメッセージが表示されることを確認
		expect(screen.getAllByText("Expected number, received nan")).toHaveLength(
			2,
		);
		expect(screen.getAllByText("Required")).toHaveLength(3);
		expect(screen.getByText("成長段階は必須です")).toBeInTheDocument();
	});

	it("should display error message", () => {
		const errorMessage = "エラーが発生しました";
		render(<CattleNewPresentation error={errorMessage} />);

		expect(screen.getByText(errorMessage)).toBeInTheDocument();
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
	});

	it("should calculate and display age information when birthday is entered", async () => {
		const user = userEvent.setup();
		render(<CattleNewPresentation error={undefined} />);

		// 出生日を入力
		const birthdayInput = screen.getByLabelText(/出生日/);
		await user.type(birthdayInput, "2023-01-15");

		// 年齢情報が表示されることを確認
		expect(screen.getByText(/現在の日齢:/)).toBeInTheDocument();
		expect(screen.getByText(/ヶ月/)).toBeInTheDocument();
		expect(screen.getByText(/歳/)).toBeInTheDocument();
	});
});

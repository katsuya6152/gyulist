import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CattleNewPresentation } from "../presentational";

// Mock Next.js navigation
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush
	})
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
			2
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

	it("should render bloodline information fields", () => {
		render(<CattleNewPresentation error={undefined} />);

		// 血統情報のフィールドを確認
		expect(screen.getByLabelText("父牛名")).toBeInTheDocument();
		expect(screen.getByLabelText("母の父牛名")).toBeInTheDocument();
		expect(screen.getByLabelText("母の祖父牛名")).toBeInTheDocument();
		expect(screen.getByLabelText("母の曾祖父牛名")).toBeInTheDocument();
	});

	it("should show breeding information for non-calf growth stages", async () => {
		const user = userEvent.setup();
		render(<CattleNewPresentation error={undefined} />);

		// 成長段階を経産牛に変更
		const growthStageSelect = screen.getByLabelText(/成長段階/);
		await user.selectOptions(growthStageSelect, "MULTI_PAROUS");

		// 繁殖情報が表示されることを確認
		expect(screen.getByText("繁殖情報")).toBeInTheDocument();
		expect(screen.getByLabelText("分娩予定日")).toBeInTheDocument();
		expect(screen.getByLabelText("妊娠鑑定予定日")).toBeInTheDocument();
		expect(screen.getByLabelText("繁殖メモ")).toBeInTheDocument();
	});

	it("should handle form field inputs", async () => {
		const user = userEvent.setup();
		render(<CattleNewPresentation error={undefined} />);

		// フォームフィールドに入力
		await user.type(screen.getByLabelText(/個体識別番号/), "12345");
		await user.type(screen.getByLabelText(/耳標番号/), "67890");
		await user.type(screen.getByLabelText(/名号/), "テスト牛");
		await user.selectOptions(screen.getByLabelText(/性別/), "雌");
		await user.selectOptions(screen.getByLabelText(/成長段階/), "GROWING");
		await user.type(screen.getByLabelText(/品種/), "黒毛和種");
		await user.type(screen.getByLabelText(/得点/), "80");
		await user.type(screen.getByLabelText(/生産者/), "〇〇牧場");
		await user.type(screen.getByLabelText(/牛舎/), "B棟");
		await user.type(screen.getByLabelText(/育種価/), "110");

		// 入力値を確認
		expect(screen.getByLabelText(/個体識別番号/)).toHaveValue("12345");
		expect(screen.getByLabelText(/耳標番号/)).toHaveValue("67890");
		expect(screen.getByLabelText(/名号/)).toHaveValue("テスト牛");
		expect(screen.getByLabelText(/性別/)).toHaveValue("雌");
		expect(screen.getByLabelText(/成長段階/)).toHaveValue("GROWING");
		expect(screen.getByLabelText(/品種/)).toHaveValue("黒毛和種");
		expect(screen.getByLabelText(/得点/)).toHaveValue(80);
		expect(screen.getByLabelText(/生産者/)).toHaveValue("〇〇牧場");
		expect(screen.getByLabelText(/牛舎/)).toHaveValue("B棟");
		expect(screen.getByLabelText(/育種価/)).toHaveValue("110");
	});
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CattleEditPresentation from "../presentational";

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush
	})
}));

// Mock useActionState
vi.mock("react", async () => {
	const actual = await vi.importActual("react");
	return {
		...actual,
		useActionState: () => [null, vi.fn(), false]
	};
});

describe("CattleEditPresentation", () => {
	const mockCattle = {
		cattleId: 1,
		ownerUserId: 1,
		identificationNumber: 1001,
		earTagNumber: 1234,
		name: "テスト牛",
		growthStage: "CALF" as const,
		birthday: "2023-01-01",
		age: 1,
		monthsOld: 12,
		daysOld: 365,
		gender: "雄",
		weight: 250,
		score: 80,
		breed: "黒毛和種",
		healthStatus: "健康",
		status: "HEALTHY",
		producerName: "テスト生産者",
		barn: "テスト牛舎",
		breedingValue: "AAAAAA",
		notes: "テスト用の牛",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		bloodline: null,
		motherInfo: null,
		breedingStatus: null,
		breedingSummary: null,
		events: []
	};

	it("should render form with initial values", () => {
		render(<CattleEditPresentation cattle={mockCattle} error={undefined} />);

		// 必須フィールドの値を確認
		expect(screen.getByLabelText(/個体識別番号/)).toHaveValue("1001");
		expect(screen.getByLabelText(/耳標番号/)).toHaveValue("1234");
		expect(screen.getByLabelText(/名号/)).toHaveValue("テスト牛");
		expect(screen.getByLabelText(/性別/)).toHaveValue("雄");
		expect(screen.getByLabelText(/成長段階/)).toHaveValue("CALF");

		// オプションフィールドの値を確認
		expect(screen.getByLabelText(/品種/)).toHaveValue("黒毛和種");
		expect(screen.getByLabelText(/備考/)).toHaveValue("テスト用の牛");
	});

	it("should validate required fields", async () => {
		const user = userEvent.setup();
		render(<CattleEditPresentation cattle={mockCattle} error={undefined} />);

		// 必須フィールドをクリア
		await user.clear(screen.getByLabelText(/個体識別番号/));
		await user.clear(screen.getByLabelText(/名号/));

		// フォームを送信
		await user.click(screen.getByRole("button", { name: "更新" }));

		// エラーメッセージを確認（実際のエラーメッセージに合わせる）
		expect(screen.getByText("Required")).toBeInTheDocument();
	});

	it("should display error message", () => {
		const errorMessage = "エラーが発生しました";
		render(<CattleEditPresentation cattle={mockCattle} error={errorMessage} />);

		expect(screen.getByText(errorMessage)).toBeInTheDocument();
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
	});

	it("should calculate and display age information when birthday is entered", async () => {
		const user = userEvent.setup();
		render(<CattleEditPresentation cattle={mockCattle} error={undefined} />);

		// 出生日を入力
		const birthdayInput = screen.getByLabelText(/出生日/);
		await user.clear(birthdayInput);
		await user.type(birthdayInput, "2023-01-15");

		// 年齢情報が表示されることを確認
		expect(screen.getByText(/現在の日齢:/)).toBeInTheDocument();
		expect(screen.getByText(/ヶ月/)).toBeInTheDocument();
		expect(screen.getByText(/歳/)).toBeInTheDocument();
	});

	it("should render bloodline information fields", () => {
		const cattleWithBloodline = {
			...mockCattle,
			bloodline: {
				fatherCattleName: "父牛名",
				motherFatherCattleName: "母の父牛名",
				motherGrandFatherCattleName: "母の祖父牛名",
				motherGreatGrandFatherCattleName: "母の曾祖父牛名"
			}
		};

		render(
			<CattleEditPresentation cattle={cattleWithBloodline} error={undefined} />
		);

		// 血統情報のフィールドを確認
		expect(screen.getByLabelText("父牛名")).toHaveValue("父牛名");
		expect(screen.getByLabelText("母の父牛名")).toHaveValue("母の父牛名");
		expect(screen.getByLabelText("母の祖父牛名")).toHaveValue("母の祖父牛名");
		expect(screen.getByLabelText("母の曾祖父牛名")).toHaveValue(
			"母の曾祖父牛名"
		);
	});

	it("should render breeding status fields for non-calf cattle", () => {
		const adultCattle = {
			...mockCattle,
			growthStage: "MULTI_PAROUS" as const,
			breedingStatus: {
				expectedCalvingDate: "2024-06-01",
				scheduledPregnancyCheckDate: "2024-05-01",
				breedingMemo: "繁殖メモ",
				isDifficultBirth: false
			}
		};

		render(<CattleEditPresentation cattle={adultCattle} error={undefined} />);

		// 血統情報は表示される
		expect(screen.getByText("血統情報")).toBeInTheDocument();
		// 繁殖情報は経産牛の場合に条件によって表示される
		expect(screen.getByLabelText("分娩予定日")).toBeInTheDocument();
		expect(screen.getByLabelText("妊娠鑑定予定日")).toBeInTheDocument();
		expect(screen.getByLabelText("繁殖メモ")).toBeInTheDocument();
	});

	it("should handle growth stage changes", async () => {
		const user = userEvent.setup();
		render(<CattleEditPresentation cattle={mockCattle} error={undefined} />);

		// 成長段階を変更
		const growthStageSelect = screen.getByLabelText(/成長段階/);
		await user.selectOptions(growthStageSelect, "MULTI_PAROUS");

		expect(growthStageSelect).toHaveValue("MULTI_PAROUS");
	});
});

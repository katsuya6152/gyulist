import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventNewPresentation } from "../presentational";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock the actions
vi.mock("../actions", () => ({
	createEventAction: vi.fn(),
}));

describe("EventNewPresentation", () => {
	const user = userEvent.setup();

	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 1,
		earTagNumber: 1,
		name: "テスト牛1",
		gender: "FEMALE",
		birthday: "2020-01-01",
		growthStage: "CALF",
		breed: "ホルスタイン",
		notes: "テスト用の牛",
		bloodline: {
			bloodlineId: 1,
			cattleId: 1,
			fatherCattleName: "父牛",
			motherFatherCattleName: "母父牛",
			motherGrandFatherCattleName: "母祖父牛",
			motherGreatGrandFatherCattleName: "母曽祖父牛",
		},
		breedingStatus: {
			breedingStatusId: 1,
			cattleId: 1,
			parity: null,
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving: null,
			isDifficultBirth: false,
			breedingMemo: "",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: null,
		},
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: null,
	} as GetCattleDetailResType;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render event new form correctly", () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		// ページタイトルと説明を確認
		expect(screen.getByText("イベント登録")).toBeInTheDocument();
		expect(
			screen.getByText("テスト牛1 (1) のイベントを登録します"),
		).toBeInTheDocument();
		expect(
			screen.getByText("* がついている項目は必須入力です"),
		).toBeInTheDocument();

		// フォーム要素を確認
		expect(screen.getByLabelText(/イベントタイプ/)).toBeInTheDocument();
		expect(screen.getByLabelText(/イベント日付/)).toBeInTheDocument();
		expect(screen.getByLabelText(/イベント時刻/)).toBeInTheDocument();
		expect(screen.getByLabelText(/メモ/)).toBeInTheDocument();

		// ボタンを確認
		expect(
			screen.getByRole("button", { name: "イベントを登録" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "キャンセル" }),
		).toBeInTheDocument();
	});

	it("should display event type options correctly", async () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		const eventTypeSelect = screen.getByLabelText(/イベントタイプ/);

		// デフォルトオプションを確認
		expect(
			screen.getByText("イベントタイプを選択してください"),
		).toBeInTheDocument();

		// イベントタイプのオプションを確認
		expect(screen.getByText("発情")).toBeInTheDocument();
		expect(screen.getByText("人工授精")).toBeInTheDocument();
		expect(screen.getByText("分娩")).toBeInTheDocument();
		expect(screen.getByText("ワクチン接種")).toBeInTheDocument();
		expect(screen.getByText("出荷")).toBeInTheDocument();
		expect(screen.getByText("削蹄")).toBeInTheDocument();
		expect(screen.getByText("その他")).toBeInTheDocument();
	});

	it("should fill form with default values", () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		const eventDateInput = screen.getByLabelText(
			/イベント日付/,
		) as HTMLInputElement;
		const eventTimeInput = screen.getByLabelText(
			/イベント時刻/,
		) as HTMLInputElement;

		// 今日の日付と現在時刻がデフォルト値として設定されていることを確認
		expect(eventDateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(eventTimeInput.value).toMatch(/^\d{2}:\d{2}$/);
	});

	it("should handle form input changes", async () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		const eventTypeSelect = screen.getByLabelText(/イベントタイプ/);
		const eventDateInput = screen.getByLabelText(/イベント日付/);
		const eventTimeInput = screen.getByLabelText(/イベント時刻/);
		const notesInput = screen.getByLabelText(/メモ/);

		// フォーム入力をテスト
		await user.selectOptions(eventTypeSelect, "ESTRUS");
		await user.clear(eventDateInput);
		await user.type(eventDateInput, "2024-01-15");
		await user.clear(eventTimeInput);
		await user.type(eventTimeInput, "10:30");
		await user.type(notesInput, "発情確認のテスト");

		// 値が正しく設定されていることを確認
		expect(eventTypeSelect).toHaveValue("ESTRUS");
		expect(eventDateInput).toHaveValue("2024-01-15");
		expect(eventTimeInput).toHaveValue("10:30");
		expect(notesInput).toHaveValue("発情確認のテスト");
	});

	it("should display validation errors", async () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		const submitButton = screen.getByRole("button", { name: "イベントを登録" });
		const eventDateInput = screen.getByLabelText(/イベント日付/);
		const eventTimeInput = screen.getByLabelText(/イベント時刻/);

		// 必須フィールドを空にする
		await user.clear(eventDateInput);
		await user.clear(eventTimeInput);

		// フォームを送信してバリデーションエラーを発生させる
		await user.click(submitButton);

		// バリデーションエラーが表示されることを確認（実際のエラーメッセージ）
		await waitFor(() => {
			expect(screen.getAllByText("Required")).toHaveLength(3); // eventType, eventDate, eventTimeの3つ
		});
	});

	it("should have proper accessibility attributes", () => {
		render(<EventNewPresentation cattle={mockCattle} />);

		// 必須フィールドのアスタリスクを確認（より具体的なセレクターを使用）
		const eventTypeLabel = screen
			.getByLabelText(/イベントタイプ/)
			.closest("div")
			?.querySelector("label");
		const eventDateLabel = screen
			.getByLabelText(/イベント日付/)
			.closest("div")
			?.querySelector("label");
		const eventTimeLabel = screen
			.getByLabelText(/イベント時刻/)
			.closest("div")
			?.querySelector("label");

		expect(eventTypeLabel?.querySelector(".text-red-500")).toBeInTheDocument();
		expect(eventDateLabel?.querySelector(".text-red-500")).toBeInTheDocument();
		expect(eventTimeLabel?.querySelector(".text-red-500")).toBeInTheDocument();

		// フォーム要素のid属性とlabelのhtmlFor属性の関連付けを確認
		const eventTypeInput = screen.getByLabelText(/イベントタイプ/);
		const eventDateInput = screen.getByLabelText(/イベント日付/);
		const eventTimeInput = screen.getByLabelText(/イベント時刻/);
		const notesInput = screen.getByLabelText(/メモ/);

		expect(eventTypeInput).toHaveAttribute("id");
		expect(eventDateInput).toHaveAttribute("id");
		expect(eventTimeInput).toHaveAttribute("id");
		expect(notesInput).toHaveAttribute("id");
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CattleDetailPresentation from "../presentational";

// Mock the actions
vi.mock("../actions", () => ({
	updateNotesAction: vi.fn().mockResolvedValue({ success: true })
}));

// Mock the EditableSummary component
vi.mock("../components/editable-summary", () => ({
	EditableSummary: vi.fn(({ cattle, onSave, onUpdate }) => (
		<div data-testid="editable-summary">
			<div>メモ: {cattle.notes || "メモはありません"}</div>
			<button type="button" onClick={() => onSave?.({ notes: "新しいメモ" })}>
				保存テスト
			</button>
			<button
				type="button"
				onClick={() => onUpdate?.({ ...cattle, notes: "新しいメモ" })}
			>
				更新テスト
			</button>
		</div>
	))
}));

describe("CattleDetailPresentation", () => {
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
		gender: "雄" as const,
		weight: 250,
		score: 80,
		breed: "黒毛和種",
		status: "HEALTHY" as const,
		healthStatus: "健康",
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

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render cattle details correctly", () => {
		render(<CattleDetailPresentation cattle={mockCattle} />);

		expect(screen.getByText("テスト牛")).toBeInTheDocument();
		expect(screen.getByText(/1001/)).toBeInTheDocument();
		expect(screen.getByText("黒毛和種")).toBeInTheDocument();
		expect(screen.getByText("仔牛")).toBeInTheDocument();
	});

	it("should render loading state when no cattle", () => {
		render(<CattleDetailPresentation cattle={undefined} />);

		expect(screen.getByText("読み込み中...")).toBeInTheDocument();
	});

	it("should render EditableSummary for non-breeding cattle", () => {
		render(<CattleDetailPresentation cattle={mockCattle} />);

		expect(screen.getByTestId("editable-summary")).toBeInTheDocument();
		expect(screen.getByText("メモ: テスト用の牛")).toBeInTheDocument();
	});

	it("should render Breeding component for breeding cattle", () => {
		const breedingCattle = {
			...mockCattle,
			growthStage: "FIRST_CALVED" as const
		};

		render(<CattleDetailPresentation cattle={breedingCattle} />);

		// EditableSummaryは表示されない（Breedingコンポーネントが表示される）
		expect(screen.queryByTestId("editable-summary")).not.toBeInTheDocument();
	});

	it("should update cattle state when onUpdate is called", async () => {
		render(<CattleDetailPresentation cattle={mockCattle} />);

		// 初期状態を確認
		expect(screen.getByText("メモ: テスト用の牛")).toBeInTheDocument();

		// 更新テストボタンをクリック
		const updateButton = screen.getByText("更新テスト");
		await updateButton.click();

		// 更新後の状態を確認
		expect(screen.getByText("メモ: 新しいメモ")).toBeInTheDocument();
	});

	it("should handle onSave correctly", async () => {
		const { updateNotesAction } = await import("../actions");

		render(<CattleDetailPresentation cattle={mockCattle} />);

		// 保存テストボタンをクリック
		const saveButton = screen.getByText("保存テスト");
		await saveButton.click();

		// updateNotesActionが呼ばれることを確認
		expect(updateNotesAction).toHaveBeenCalledWith(1, "新しいメモ");
	});

	it("should update cattle state when initialCattle changes", () => {
		const { rerender } = render(
			<CattleDetailPresentation cattle={mockCattle} />
		);

		// 初期状態を確認
		expect(screen.getByText("メモ: テスト用の牛")).toBeInTheDocument();

		// 新しいcattleオブジェクトで再レンダリング
		const updatedCattle = {
			...mockCattle,
			notes: "更新されたメモ"
		};

		rerender(<CattleDetailPresentation cattle={updatedCattle} />);

		// 更新後の状態を確認
		expect(screen.getByText("メモ: 更新されたメモ")).toBeInTheDocument();
	});
});

import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditableSummary } from "../editable-summary";

// Mock the toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe("EditableSummary", () => {
	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "FEMALE",
		birthday: "2020-01-01",
		age: 4,
		monthsOld: 48,
		daysOld: 1460,
		growthStage: "MULTI_PAROUS",
		breed: "ホルスタイン",
		score: 85,
		producerName: "テスト生産者",
		barn: "A棟",
		breedingValue: 120,
		notes: "テスト用のメモです",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		ownerUserId: 1,
		weight: null,
		bloodline: null,
		breedingStatus: null,
		motherInfo: null,
		breedingSummary: null,
		events: null,
		status: "HEALTHY",
		healthStatus: "健康"
	} as unknown as GetCattleDetailResType;

	const mockOnSave = vi.fn();
	const mockOnUpdate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render memo content correctly", () => {
		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(screen.getByText("メモ")).toBeInTheDocument();
		expect(screen.getByText("テスト用のメモです")).toBeInTheDocument();
		expect(screen.getByText("編集")).toBeInTheDocument();
	});

	it("should display 'メモはありません' when notes is null", () => {
		const cattleWithoutNotes = {
			...mockCattle,
			notes: null
		};

		render(
			<EditableSummary
				cattle={cattleWithoutNotes}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(screen.getByText("メモはありません")).toBeInTheDocument();
	});

	it("should display 'メモはありません' when notes is empty string", () => {
		const cattleWithEmptyNotes = {
			...mockCattle,
			notes: ""
		};

		render(
			<EditableSummary
				cattle={cattleWithEmptyNotes}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(screen.getByText("メモはありません")).toBeInTheDocument();
	});

	it("should show edit mode when edit button is clicked", async () => {
		const user = userEvent.setup();
		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		await user.click(screen.getByText("編集"));

		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(screen.getByText("保存")).toBeInTheDocument();
		expect(screen.getByText("キャンセル")).toBeInTheDocument();
	});

	it("should save memo when save button is clicked", async () => {
		const user = userEvent.setup();
		mockOnSave.mockResolvedValue(undefined);

		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		// 編集モードに入る
		await user.click(screen.getByText("編集"));

		// メモを編集
		const textarea = screen.getByRole("textbox");
		await user.clear(textarea);
		await user.type(textarea, "新しいメモ内容");

		// 保存ボタンをクリック
		await user.click(screen.getByText("保存"));

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				notes: "新しいメモ内容"
			});
		});

		await waitFor(() => {
			expect(mockOnUpdate).toHaveBeenCalledWith({
				...mockCattle,
				notes: "新しいメモ内容",
				updatedAt: expect.any(String)
			});
		});
	});

	it("should cancel edit when cancel button is clicked", async () => {
		const user = userEvent.setup();

		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		// 編集モードに入る
		await user.click(screen.getByText("編集"));

		// メモを編集
		const textarea = screen.getByRole("textbox");
		await user.clear(textarea);
		await user.type(textarea, "変更されたメモ");

		// キャンセルボタンをクリック
		await user.click(screen.getByText("キャンセル"));

		// 元の内容に戻ることを確認
		expect(screen.getByText("テスト用のメモです")).toBeInTheDocument();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});

	it("should handle save error correctly", async () => {
		const user = userEvent.setup();
		const errorMessage = "保存に失敗しました";
		mockOnSave.mockRejectedValue(new Error(errorMessage));

		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		// 編集モードに入る
		await user.click(screen.getByText("編集"));

		// メモを編集
		const textarea = screen.getByRole("textbox");
		await user.clear(textarea);
		await user.type(textarea, "エラーテスト");

		// 保存ボタンをクリック
		await user.click(screen.getByText("保存"));

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				notes: "エラーテスト"
			});
		});

		// エラー時はonUpdateが呼ばれないことを確認
		expect(mockOnUpdate).not.toHaveBeenCalled();
	});

	it("should show loading state during save", async () => {
		const user = userEvent.setup();
		let resolveSave: (() => void) | undefined;
		const savePromise = new Promise<void>((resolve) => {
			resolveSave = resolve;
		});
		mockOnSave.mockReturnValue(savePromise);

		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		// 編集モードに入る
		await user.click(screen.getByText("編集"));

		// 保存ボタンをクリック
		await user.click(screen.getByText("保存"));

		// ローディング状態を確認
		expect(screen.getByText("保存中...")).toBeInTheDocument();
		expect(screen.getByText("保存中...")).toBeDisabled();

		// 保存を完了
		if (resolveSave) {
			resolveSave();
		}
		await waitFor(() => {
			expect(screen.queryByText("保存中...")).not.toBeInTheDocument();
		});
	});

	it("should update form data when cattle notes change", () => {
		const { rerender } = render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		// 新しいcattleオブジェクトで再レンダリング
		const updatedCattle = {
			...mockCattle,
			notes: "更新されたメモ"
		};

		rerender(
			<EditableSummary
				cattle={updatedCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(screen.getByText("更新されたメモ")).toBeInTheDocument();
	});

	it("should display creation and update timestamps", () => {
		render(
			<EditableSummary
				cattle={mockCattle}
				onSave={mockOnSave}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(
			screen.getByText("登録日時: 2023-01-01T00:00:00Z")
		).toBeInTheDocument();
		expect(
			screen.getByText("更新日時: 2023-12-01T00:00:00Z")
		).toBeInTheDocument();
	});

	it("should work without onSave and onUpdate props", () => {
		render(<EditableSummary cattle={mockCattle} />);

		expect(screen.getByText("メモ")).toBeInTheDocument();
		expect(screen.getByText("テスト用のメモです")).toBeInTheDocument();
		expect(screen.getByText("編集")).toBeInTheDocument();
	});
});

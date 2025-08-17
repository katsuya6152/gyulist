import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CattleDetailHeader } from "../hedear";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush
	})
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

// Mock the delete action
vi.mock("../../actions", () => ({
	deleteCattleAction: vi.fn()
}));

// Mock getGrowthStage utility
vi.mock("@/lib/utils", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/utils")>();
	return {
		...actual,
		getGrowthStage: vi.fn((stage: string) => {
			const stages = {
				CALF: "子牛",
				GROWING: "育成牛",
				FATTENING: "肥育牛",
				FIRST_CALVED: "初産牛",
				MULTI_PAROUS: "経産牛"
			};
			return stages[stage as keyof typeof stages] || stage;
		})
	};
});

// Mock Vaul components
interface DrawerProps {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

interface DrawerChildProps {
	children: React.ReactNode;
}

vi.mock("vaul", () => {
	const DrawerComponent = ({ children, open, onOpenChange }: DrawerProps) => (
		<dialog
			open
			data-testid="mock-drawer"
			data-open={open}
			onClick={() => onOpenChange?.(false)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onOpenChange?.(false);
				}
			}}
		>
			{children}
		</dialog>
	);

	const DrawerChildComponent = ({ children }: DrawerChildProps) => (
		<div>{children}</div>
	);

	// Build an object that mimics vaul's static component structure
	const DrawerObject = {
		Root: DrawerComponent,
		Trigger: DrawerChildComponent,
		Close: DrawerChildComponent,
		Content: DrawerChildComponent,
		Header: DrawerChildComponent,
		Title: DrawerChildComponent,
		Description: DrawerChildComponent,
		Footer: DrawerChildComponent,
		Portal: DrawerChildComponent,
		Overlay: DrawerChildComponent
	};

	return {
		Drawer: DrawerObject
	};
});

describe("CattleDetailHeader", () => {
	const user = userEvent.setup();

	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "メス",
		birthday: "2020-01-01",
		growthStage: "MULTI_PAROUS",
		status: "HEALTHY",
		healthStatus: "健康",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		bloodline: null,
		breedingStatus: null,
		motherInfo: null,
		breedingSummary: null,
		events: null
	} as unknown as GetCattleDetailResType;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render cattle basic information correctly", () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		expect(screen.getByText("テスト牛")).toBeInTheDocument();
		// ヘッダーでは個体識別番号は表示されないため確認しない
		expect(screen.getByText(/54321/)).toBeInTheDocument();
		expect(screen.getByText("経産牛")).toBeInTheDocument();
	});

	it("should render action buttons correctly", () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		expect(screen.getByLabelText("イベント登録")).toBeInTheDocument();
		expect(screen.getByLabelText("編集")).toBeInTheDocument();
		expect(screen.getAllByLabelText("削除").length).toBeGreaterThan(0);
	});

	it("should navigate to event creation page when event button is clicked", async () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		const eventButton = screen.getByLabelText("イベント登録");
		await user.click(eventButton);

		expect(mockPush).toHaveBeenCalledWith("/events/new/1");
	});

	it("should navigate to edit page when edit button is clicked", async () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		const editButton = screen.getByLabelText("編集");
		await user.click(editButton);

		expect(mockPush).toHaveBeenCalledWith("/cattle/1/edit");
	});

	it("should open delete confirmation drawer when delete button is clicked", async () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		const deleteButton = screen.getAllByLabelText("削除")[0];
		await user.click(deleteButton);

		// 削除確認ダイアログが表示されることを確認
		expect(
			screen.getByText("以下の個体情報を削除してもよろしいですか？")
		).toBeInTheDocument();
		expect(screen.getByText(/個体識別番号:\s*12345/)).toBeInTheDocument();
		expect(screen.getByText(/名号:\s*テスト牛/)).toBeInTheDocument();

		// 削除ボタンとキャンセルボタンが表示されることを確認
		const confirmButtons = screen.getAllByRole("button", { name: "削除" });
		expect(confirmButtons.length).toBeGreaterThan(0);
		expect(
			screen.getByRole("button", { name: "キャンセル" })
		).toBeInTheDocument();
	});

	it("should handle successful deletion", async () => {
		const { deleteCattleAction } = await import("../../actions");
		const { toast } = await import("sonner");

		vi.mocked(deleteCattleAction).mockResolvedValue({
			success: true
		});

		render(<CattleDetailHeader cattle={mockCattle} />);

		// 削除ボタンをクリックしてダイアログを開く
		const deleteButton = screen.getAllByLabelText("削除")[0];
		await user.click(deleteButton);

		// 削除確認ボタンをクリック
		const confirmDeleteButton = screen.getAllByRole("button", {
			name: "削除"
		})[1];
		await user.click(confirmDeleteButton);

		// 削除アクションが呼ばれることを確認
		expect(deleteCattleAction).toHaveBeenCalledWith(1);

		// 成功トーストが表示されることを確認
		expect(toast.success).toHaveBeenCalledWith(
			"牛の削除が完了しました",
			expect.objectContaining({
				description: "テスト牛（個体識別番号: 12345）を削除しました"
			})
		);

		// 牛一覧ページにリダイレクトされることを確認
		expect(mockPush).toHaveBeenCalledWith("/cattle");
	});

	it("should handle deletion failure", async () => {
		const { deleteCattleAction } = await import("../../actions");
		const { toast } = await import("sonner");

		vi.mocked(deleteCattleAction).mockResolvedValue({
			success: false,
			error: "削除に失敗しました"
		});

		render(<CattleDetailHeader cattle={mockCattle} />);

		// 削除ボタンをクリックしてダイアログを開く
		const deleteButton = screen.getAllByLabelText("削除")[0];
		await user.click(deleteButton);

		// 削除確認ボタンをクリック
		const confirmDeleteButton = screen.getAllByRole("button", {
			name: "削除"
		})[1];
		await user.click(confirmDeleteButton);

		// エラートーストが表示されることを確認
		expect(toast.error).toHaveBeenCalledWith(
			"削除に失敗しました",
			expect.objectContaining({
				description: "削除に失敗しました"
			})
		);

		// エラーメッセージが表示されることを確認
		expect(screen.getByText("削除に失敗しました")).toBeInTheDocument();
	});

	it("should handle deletion network error", async () => {
		const { deleteCattleAction } = await import("../../actions");
		const { toast } = await import("sonner");

		vi.mocked(deleteCattleAction).mockRejectedValue(new Error("Network error"));

		render(<CattleDetailHeader cattle={mockCattle} />);

		// 削除ボタンをクリックしてダイアログを開く
		const deleteButton = screen.getAllByLabelText("削除")[0];
		await user.click(deleteButton);

		// 削除確認ボタンをクリック
		const confirmDeleteButton = screen.getAllByRole("button", {
			name: "削除"
		})[1];
		await user.click(confirmDeleteButton);

		// エラートーストが表示されることを確認
		expect(toast.error).toHaveBeenCalledWith(
			"削除中にエラーが発生しました",
			expect.objectContaining({
				description: "予期しないエラーが発生しました"
			})
		);
	});

	it("should show loading state during deletion", async () => {
		const { deleteCattleAction } = await import("../../actions");

		// 削除処理を遅延させる
		let resolveDelete: (() => void) | undefined;
		const deletePromise = new Promise<{ success: boolean }>((resolve) => {
			resolveDelete = () => resolve({ success: true });
		});
		vi.mocked(deleteCattleAction).mockReturnValue(deletePromise);

		render(<CattleDetailHeader cattle={mockCattle} />);

		// 削除ボタンをクリックしてダイアログを開く
		const deleteButton = screen.getAllByLabelText("削除")[0];
		await user.click(deleteButton);

		// 削除確認ボタンをクリック
		const confirmDeleteButton = screen.getAllByRole("button", {
			name: "削除"
		})[1];
		await user.click(confirmDeleteButton);

		// ローディング状態が表示されることを確認
		expect(screen.getByText("削除中...")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "削除中..." })).toBeDisabled();
		expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();

		// 削除完了
		if (resolveDelete) {
			resolveDelete();
		}
		await deletePromise;
	});

	it("should display gender with correct styling", () => {
		render(<CattleDetailHeader cattle={mockCattle} />);

		const genderBadge = screen.getByText("メス");
		// Badge 内の span に付与される色クラスのみをチェックする
		expect(genderBadge).toHaveClass("text-red-500");
	});
});

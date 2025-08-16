import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventNewContainer } from "../container";

// Mock all services and navigation
vi.mock("@/services/cattleService", () => ({
	GetCattleDetail: vi.fn()
}));

vi.mock("@/services/eventService", () => ({
	CreateEvent: vi.fn()
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn()
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn()
	}),
	notFound: vi.fn()
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe("Events New Integration", () => {
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
			motherGreatGrandFatherCattleName: "母曽祖父牛"
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
			updatedAt: null
		},
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: null
	} as GetCattleDetailResType;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render complete event new page through container", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);

		const container = await EventNewContainer({ cattleId: "1" });
		render(container);

		// 全体の構造を確認
		expect(screen.getByText("イベント登録")).toBeInTheDocument();
		expect(
			screen.getByText("テスト牛1 (1) のイベントを登録します")
		).toBeInTheDocument();

		// フォーム要素を確認
		expect(screen.getByLabelText(/イベントタイプ/)).toBeInTheDocument();
		expect(screen.getByLabelText(/イベント日付/)).toBeInTheDocument();
		expect(screen.getByLabelText(/イベント時刻/)).toBeInTheDocument();
		expect(screen.getByLabelText(/メモ/)).toBeInTheDocument();

		// ボタンを確認
		expect(
			screen.getByRole("button", { name: "イベントを登録" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "キャンセル" })
		).toBeInTheDocument();
	});

	it("should handle complete event creation flow", async () => {
		const user = userEvent.setup();
		const { GetCattleDetail } = await import("@/services/cattleService");
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);
		vi.mocked(CreateEvent).mockResolvedValue(undefined);

		const container = await EventNewContainer({ cattleId: "1" });
		render(container);

		// フォームに入力（イベントタイプはポップオーバー→グループ展開→項目選択）
		const eventTypeTrigger = screen.getByRole("button", {
			name: /イベントタイプ/
		});
		await user.click(eventTypeTrigger);
		await user.click(await screen.findByText("繁殖"));
		await user.click(await screen.findByText("発情"));
		const eventDateInput = screen.getByLabelText(/イベント日付/);
		const eventTimeInput = screen.getByLabelText(/イベント時刻/);
		const notesInput = screen.getByLabelText(/メモ/);
		const submitButton = screen.getByRole("button", { name: "イベントを登録" });

		await user.clear(eventDateInput);
		await user.type(eventDateInput, "2024-01-15");
		await user.clear(eventTimeInput);
		await user.type(eventTimeInput, "10:30");
		await user.type(notesInput, "統合テスト用の発情確認");

		// フォームを送信
		await user.click(submitButton);

		// API が正しく呼ばれることを確認
		await waitFor(() => {
			expect(CreateEvent).toHaveBeenCalledWith({
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: expect.stringMatching(/2024-01-15T\d{2}:30/),
				notes: "統合テスト用の発情確認"
			});
		});
	});

	it("should display proper form structure and validation", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);

		const container = await EventNewContainer({ cattleId: "1" });
		render(container);

		// 必須フィールドのマーカーを確認（より具体的なセレクターを使用）
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

		// デフォルト値の設定を確認
		const eventDateInput = screen.getByLabelText(
			/イベント日付/
		) as HTMLInputElement;
		const eventTimeInput = screen.getByLabelText(
			/イベント時刻/
		) as HTMLInputElement;

		expect(eventDateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(eventTimeInput.value).toMatch(/^\d{2}:\d{2}$/);
	});

	it("should handle API error gracefully", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		const { notFound } = await import("next/navigation");

		const mockError = new Error("API Error");
		vi.mocked(GetCattleDetail).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		try {
			await EventNewContainer({ cattleId: "1" });
		} catch (error) {
			// エラーハンドリングを期待
		}

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to fetch cattle data:",
			mockError
		);
		expect(notFound).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should display all event type options", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);

		const container = await EventNewContainer({ cattleId: "1" });
		render(container);

		// すべてのイベントタイプオプションが表示されることを確認（ポップオーバーを開く）
		await user.click(screen.getByRole("button", { name: /イベントタイプ/ }));
		// 各グループを展開して検証
		await user.click(await screen.findByText("繁殖"));
		expect(await screen.findByText("発情")).toBeInTheDocument();
		expect(await screen.findByText("人工授精")).toBeInTheDocument();

		await user.click(screen.getByText("分娩・異常"));
		expect(await screen.findByText("分娩")).toBeInTheDocument();

		await user.click(screen.getByText("健康・治療"));
		expect(await screen.findByText("ワクチン接種")).toBeInTheDocument();
		expect(await screen.findByText("削蹄")).toBeInTheDocument();

		await user.click(screen.getByText("ロジ"));
		expect(await screen.findByText("出荷")).toBeInTheDocument();

		await user.click(screen.getByText("その他"));
		// group label と option の重複を避けるため getAllByText の2つ目を確認
		expect((await screen.findAllByText("その他"))[1]).toBeInTheDocument();
	});
});

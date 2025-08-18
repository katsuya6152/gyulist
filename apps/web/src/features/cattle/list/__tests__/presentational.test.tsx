import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CattleListPresentation } from "../presentational";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush
	}),
	useSearchParams: () => mockSearchParams
}));

// Mock scrollIntoView for JSDOM
Object.defineProperty(Element.prototype, "scrollIntoView", {
	value: vi.fn(),
	writable: true
});

describe("CattleListPresentation", () => {
	const mockCattleList = [
		{
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 1234,
			name: "テスト牛1",
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
			updatedAt: "2024-01-01T00:00:00Z"
		},
		{
			cattleId: 2,
			ownerUserId: 1,
			identificationNumber: 1002,
			earTagNumber: 1235,
			name: "テスト牛2",
			growthStage: "GROWING" as const,
			birthday: "2023-01-02",
			age: 1,
			monthsOld: 12,
			daysOld: 364,
			gender: "雄" as const,
			weight: 260,
			score: 85,
			breed: "黒毛和種",
			status: "HEALTHY" as const,
			healthStatus: "健康",
			producerName: "テスト生産者",
			barn: "テスト牛舎",
			breedingValue: "AAAAAA",
			notes: "テスト用の牛",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z"
		},
		{
			cattleId: 3,
			ownerUserId: 1,
			identificationNumber: 1003,
			earTagNumber: 1236,
			name: "特別な牛",
			growthStage: "CALF" as const,
			birthday: "2023-01-03",
			age: 1,
			monthsOld: 12,
			daysOld: 363,
			gender: "雄" as const,
			weight: 270,
			score: 90,
			breed: "黒毛和種",
			status: "HEALTHY" as const,
			healthStatus: "健康",
			producerName: "テスト生産者",
			barn: "テスト牛舎",
			breedingValue: "AAAAAA",
			notes: "テスト用の牛",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z"
		}
	];

	beforeEach(() => {
		mockSearchParams.delete("search");
		mockSearchParams.delete("growth_stage");
		mockSearchParams.delete("gender");
		mockSearchParams.delete("status");
		mockSearchParams.delete("sort_by");
		mockSearchParams.delete("sort_order");

		mockPush.mockClear();
	});

	it("should render cattle list correctly", () => {
		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 基本情報の表示確認
		expect(screen.getByText("テスト牛1")).toBeInTheDocument();
		expect(screen.getByText("テスト牛2")).toBeInTheDocument();
		expect(screen.getByText("特別な牛")).toBeInTheDocument();

		// 耳標番号の表示確認
		expect(screen.getByText("耳標番号：1234")).toBeInTheDocument();
		expect(screen.getByText("耳標番号：1235")).toBeInTheDocument();
		expect(screen.getByText("耳標番号：1236")).toBeInTheDocument();

		// 成長段階と性別の表示確認
		expect(screen.getAllByText("仔牛")).toHaveLength(2);
		expect(screen.getByText("育成牛")).toBeInTheDocument();
		expect(screen.getAllByText("雄")).toHaveLength(3);
	});

	it("should handle search input", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 検索入力
		const searchInput = screen.getByPlaceholderText("検索...");
		await user.type(searchInput, "特別");

		// 検索ボタンをクリック
		const searchButton = screen.getByRole("button", { name: "検索" });
		await user.click(searchButton);

		// 検索が実行されることを確認
		expect(mockPush).toHaveBeenLastCalledWith(
			"/cattle?search=%E7%89%B9%E5%88%A5"
		);
	});

	it("should handle sort selection", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 並び替えボタンをクリック
		await user.click(screen.getByRole("button", { name: /並び替え/ }));

		// 並び替え項目を選択
		await user.click(screen.getByRole("radio", { name: "名前" }));

		// 昇順ボタンをクリック
		await user.click(screen.getByRole("button", { name: /昇順/ }));

		// 実際に呼ばれたURLを確認
		expect(mockPush).toHaveBeenLastCalledWith(
			"/cattle?sort_by=id&sort_order=asc"
		);
	});

	it("should handle filter selection", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 絞り込みボタンをクリック
		await user.click(screen.getByRole("button", { name: /絞り込み/ }));

		// 成長段階のドロップダウンを開く
		await user.click(screen.getByRole("button", { name: "成長段階を選択" }));

		// 仔牛を選択（Command内のオプション）
		await user.click(screen.getByRole("option", { name: "仔牛" }));

		// 性別のドロップダウンを開く
		await user.click(screen.getByRole("button", { name: "性別を選択" }));

		// 去勢を選択（Command内のオプション）
		await user.click(screen.getByRole("option", { name: "去勢" }));

		// ステータスのドロップダウンを開く
		await user.click(screen.getByRole("button", { name: "ステータスを選択" }));

		// 健康を選択
		await user.click(screen.getByRole("option", { name: "健康" }));

		// 絞り込みを適用
		await user.click(screen.getByRole("button", { name: "絞り込む" }));

		expect(mockPush).toHaveBeenCalledWith(
			"/cattle?growth_stage=CALF&gender=%E5%8E%BB%E5%8B%A2&status=HEALTHY"
		);
	});

	it("should handle filter clear", async () => {
		const user = userEvent.setup();
		mockSearchParams.set("growth_stage", "CALF");
		mockSearchParams.set("gender", "雄");
		mockSearchParams.set("status", "HEALTHY");

		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 絞り込みボタンをクリック
		await user.click(screen.getByRole("button", { name: /絞り込み/ }));

		// クリアボタンをクリック
		await user.click(screen.getByRole("button", { name: "クリア" }));

		expect(mockPush).toHaveBeenCalledWith("/cattle?");
	});

	it("should handle cattle item click", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} />);

		// 牛の項目をクリック
		await user.click(screen.getByText("テスト牛1"));

		expect(mockPush).toHaveBeenCalledWith("/cattle/1");
	});

	it("should display health status badges", () => {
		const cattleWithHealthStatus = [
			{
				...mockCattleList[0],
				status: "HEALTHY" as const,
				healthStatus: "健康"
			},
			{
				...mockCattleList[1],
				status: "TREATING" as const,
				healthStatus: "治療中"
			}
		];

		render(<CattleListPresentation cattleList={cattleWithHealthStatus} />);

		expect(screen.getByText("健康")).toHaveClass("text-blue-500");
		expect(screen.getByText("治療中")).toHaveClass("text-red-500");
	});

	it("should handle null values in cattle data", () => {
		const cattleWithNulls = [
			{
				...mockCattleList[0],
				weight: null,
				daysOld: null
			}
		];

		render(<CattleListPresentation cattleList={cattleWithNulls} />);

		expect(screen.getByText("体重：-")).toBeInTheDocument();
		expect(screen.getByText("日齢：-")).toBeInTheDocument();
	});
});

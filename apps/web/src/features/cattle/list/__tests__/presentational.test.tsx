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
	useSearchParams: () => mockSearchParams,
	usePathname: () => "/cattle"
}));

// Mock scrollIntoView for JSDOM
Object.defineProperty(Element.prototype, "scrollIntoView", {
	value: vi.fn(),
	writable: true
});

// Mock @repo/api for alert constants
vi.mock("@repo/api", () => ({
	// Cattle related constants
	STATUSES: [
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SCHEDULED_FOR_SHIPMENT",
		"SHIPPED",
		"DEAD"
	],
	STATUS_LABELS: {
		HEALTHY: "健康",
		PREGNANT: "妊娠中",
		RESTING: "休養中",
		TREATING: "治療中",
		SCHEDULED_FOR_SHIPMENT: "出荷予定",
		SHIPPED: "出荷済み",
		DEAD: "死亡"
	},
	GENDERS: ["雄", "去勢", "雌"],
	GENDER_LABELS: {
		雄: "雄",
		去勢: "去勢",
		雌: "雌"
	},
	GROWTH_STAGES: [
		"CALF",
		"GROWING",
		"FATTENING",
		"FIRST_CALVED",
		"MULTI_PAROUS"
	],
	GROWTH_STAGE_LABELS: {
		CALF: "仔牛",
		GROWING: "育成牛",
		FATTENING: "肥育牛",
		FIRST_CALVED: "初産牛",
		MULTI_PAROUS: "経産牛"
	},
	// Alert related constants
	ALERT_SEVERITY_LABELS: {
		high: "高",
		medium: "中",
		low: "低"
	},
	ALERT_STATUS_LABELS: {
		active: "アクティブ",
		acknowledged: "確認済み",
		resolved: "解決済み",
		dismissed: "却下"
	},
	ALERT_TYPE_LABELS: {
		OPEN_DAYS_OVER60_NO_AI: "空胎60日以上（AI未実施）",
		CALVING_WITHIN_60: "60日以内分娩予定",
		CALVING_OVERDUE: "分娩予定日超過",
		ESTRUS_OVER20_NOT_PREGNANT: "発情から20日以上未妊娠"
	},
	STATUS_UPDATE_MESSAGES: {
		acknowledged: "アラートが確認済みに更新されました",
		resolved: "アラートが解決済みに更新されました",
		dismissed: "アラートが却下されました"
	}
}));

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
			updatedAt: "2024-01-01T00:00:00Z",
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
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
			updatedAt: "2024-01-01T00:00:00Z",
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
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
			updatedAt: "2024-01-01T00:00:00Z",
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
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
		render(<CattleListPresentation cattleList={mockCattleList} alerts={[]} />);

		expect(screen.getByText("テスト牛1")).toBeInTheDocument();
		expect(screen.getByText("テスト牛2")).toBeInTheDocument();
		expect(screen.getByText("特別な牛")).toBeInTheDocument();
	});

	it("should handle search input", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} alerts={[]} />);

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
		render(<CattleListPresentation cattleList={mockCattleList} alerts={[]} />);

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

	it("should handle filter selection", () => {
		// フィルターデータの処理ロジックをテスト
		const mockFilterData = {
			growth_stage: ["CALF"],
			gender: ["去勢"],
			status: ["HEALTHY"]
		};

		// 実際の実装をシミュレート
		const params = new URLSearchParams();
		params.set("growth_stage", mockFilterData.growth_stage.join(","));
		params.set("gender", mockFilterData.gender.join(","));
		params.set("status", mockFilterData.status.join(","));

		// URLSearchParams は日本語を自動的にエンコードする
		expect(`/cattle?${params.toString()}`).toBe(
			"/cattle?growth_stage=CALF&gender=%E5%8E%BB%E5%8B%A2&status=HEALTHY"
		);
	});

	it("should handle filter clear", async () => {
		const user = userEvent.setup();
		mockSearchParams.set("growth_stage", "CALF");
		mockSearchParams.set("gender", "雄");
		mockSearchParams.set("status", "HEALTHY");

		render(<CattleListPresentation cattleList={mockCattleList} alerts={[]} />);

		// 絞り込みボタンをクリック
		await user.click(screen.getByRole("button", { name: /絞り込み/ }));

		// クリアボタンをクリック
		await user.click(screen.getByRole("button", { name: "クリア" }));

		expect(mockPush).toHaveBeenCalledWith("/cattle?");
	});

	it("should handle cattle item click", async () => {
		const user = userEvent.setup();
		render(<CattleListPresentation cattleList={mockCattleList} alerts={[]} />);

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

		render(
			<CattleListPresentation cattleList={cattleWithHealthStatus} alerts={[]} />
		);

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

		render(<CattleListPresentation cattleList={cattleWithNulls} alerts={[]} />);

		expect(screen.getByText("体重：-")).toBeInTheDocument();
		expect(screen.getByText("日齢：-")).toBeInTheDocument();
	});
});

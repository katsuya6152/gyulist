import * as alertsService from "@/services/alertsService";
import * as cattleService from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CattleListContainer from "../container";

// Mock cattleService
vi.mock("@/services/cattleService");

// Mock alertsService
vi.mock("@/services/alertsService");

// Mock cookies
vi.mock("next/headers", () => ({
	cookies: () => ({
		get: (name: string) => {
			if (name === "token") {
				return { value: "test-token" };
			}
			return null;
		}
	})
}));

// Mock @repo/api for alert constants
vi.mock("@repo/api", () => ({
	// Cattle related constants
	STATUSES: ["HEALTHY", "PREGNANT", "RESTING", "TREATING", "SHIPPED", "DEAD"],
	STATUS_LABELS: {
		HEALTHY: "健康",
		PREGNANT: "妊娠中",
		RESTING: "休養中",
		TREATING: "治療中",
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

describe("CattleListContainer", () => {
	const mockCattleList = {
		results: [
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
				gender: "雌" as const,
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
				gender: "雌" as const,
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
			}
		],
		next_cursor: null,
		has_next: false
	};

	it("should render cattle list correctly", async () => {
		vi.mocked(cattleService.GetCattleList).mockResolvedValue(mockCattleList);
		vi.mocked(alertsService.GetAlerts).mockResolvedValue({
			results: [],
			total: 0,
			summary: {
				high: 0,
				medium: 0,
				low: 0,
				urgent: 0
			}
		});

		render(await CattleListContainer({ searchParams: Promise.resolve({}) }));

		expect(screen.getByText("テスト牛1")).toBeInTheDocument();
		expect(screen.getByText("テスト牛2")).toBeInTheDocument();
		expect(screen.getByText("耳標番号：1234")).toBeInTheDocument();
		expect(screen.getByText("耳標番号：1235")).toBeInTheDocument();
		expect(cattleService.GetCattleList).toHaveBeenCalledWith({
			cursor: undefined,
			limit: undefined,
			sort_by: undefined,
			sort_order: undefined,
			search: undefined,
			growth_stage: undefined,
			gender: undefined,
			status: undefined
		});
	});

	it("should handle API error correctly", async () => {
		vi.mocked(cattleService.GetCattleList).mockRejectedValue(
			new Error("API Error")
		);

		// エラーをキャッチして期待する動作を確認
		try {
			await CattleListContainer({ searchParams: Promise.resolve({}) });
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});
});

import * as cattleService from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CattleDetailContainer from "../container";

// cattleServiceのモック
vi.mock("@/services/cattleService", () => ({
	GetCattleDetail: vi.fn()
}));

describe("CattleDetailContainer", () => {
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
		gender: "オス",
		weight: 250,
		score: 80,
		breed: "黒毛和種",
		status: "HEALTHY",
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

	it("should render cattle details correctly", async () => {
		vi.mocked(cattleService.GetCattleDetail).mockResolvedValue(mockCattle);

		render(await CattleDetailContainer({ id: "1" }));

		expect(screen.getByText("テスト牛")).toBeInTheDocument();
		expect(screen.getByText(/1001/)).toBeInTheDocument();
		expect(cattleService.GetCattleDetail).toHaveBeenCalledWith("1");
	});

	it("should handle API error correctly", async () => {
		vi.mocked(cattleService.GetCattleDetail).mockRejectedValue(
			new Error("API Error")
		);

		render(await CattleDetailContainer({ id: "1" }));

		expect(
			screen.getByText("牛の情報の取得に失敗しました")
		).toBeInTheDocument();
	});
});

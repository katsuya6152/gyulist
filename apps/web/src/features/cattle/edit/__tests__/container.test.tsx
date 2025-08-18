import * as cattleService from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CattleEditContainer from "../container";

// cattleServiceのモック
vi.mock("@/services/cattleService", () => ({
	GetCattleDetail: vi.fn()
}));

describe("CattleEditContainer", () => {
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

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render edit form with cattle data", async () => {
		vi.mocked(cattleService.GetCattleDetail).mockResolvedValue(mockCattle);

		const container = await CattleEditContainer({ id: "1" });
		render(container);

		expect(screen.getByLabelText(/個体識別番号/)).toHaveValue("1001");
		expect(screen.getByLabelText(/耳標番号/)).toHaveValue("1234");
		expect(screen.getByLabelText(/名号/)).toHaveValue("テスト牛");
		expect(screen.getByLabelText(/品種/)).toHaveValue("黒毛和種");
		expect(cattleService.GetCattleDetail).toHaveBeenCalledWith("1");
	});

	it("should handle API error correctly", async () => {
		vi.mocked(cattleService.GetCattleDetail).mockRejectedValue(
			new Error("API Error")
		);

		// エラーをキャッチして期待する動作を確認
		try {
			await CattleEditContainer({ id: "1" });
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});
});

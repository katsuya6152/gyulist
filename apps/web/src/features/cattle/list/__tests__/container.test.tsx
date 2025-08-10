import * as cattleService from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CattleListContainer from "../container";

// Mock cattleService
vi.mock("@/services/cattleService");

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
				gender: "メス",
				weight: 260,
				score: 85,
				breed: "黒毛和種",
				status: "HEALTHY",
				healthStatus: "健康",
				producerName: "テスト生産者",
				barn: "テスト牛舎",
				breedingValue: "AAAAAA",
				notes: "テスト用の牛",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			},
		],
		next_cursor: null,
		has_next: false,
	};

	it("should render cattle list correctly", async () => {
		vi.mocked(cattleService.GetCattleList).mockResolvedValue(mockCattleList);

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
			status: undefined,
		});
	});

	it("should handle API error correctly", async () => {
		vi.mocked(cattleService.GetCattleList).mockRejectedValue(
			new Error("API Error"),
		);

		// エラーをキャッチして期待する動作を確認
		try {
			await CattleListContainer({ searchParams: Promise.resolve({}) });
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	});
});

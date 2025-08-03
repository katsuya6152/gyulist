import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CattleDetailPresentation from "../presentational";

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
		gender: "オス",
		weight: 250,
		score: 80,
		breed: "黒毛和種",
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
		events: [],
	};

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
});

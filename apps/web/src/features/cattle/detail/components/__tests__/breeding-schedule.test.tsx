import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BreedingSchedule } from "../breeding-schedule";

describe("BreedingSchedule", () => {
	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "FEMALE",
		birthday: "2020-01-01",
		growthStage: "MULTI_PAROUS",
		ownerUserId: 1,
		age: 4,
		monthsOld: 48,
		daysOld: 1460,
		score: null,
		breed: null,
		producerName: null,
		barn: null,
		breedingValue: null,
		notes: null,
		weight: null,
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		breedingStatus: {
			breedingStatusId: 1,
			cattleId: 1,
			parity: 3,
			expectedCalvingDate: "2024-06-01",
			scheduledPregnancyCheckDate: "2024-05-01",
			daysAfterCalving: 120,
			daysOpen: 90,
			pregnancyDays: 280,
			daysAfterInsemination: 30,
			inseminationCount: 2,
			isDifficultBirth: false,
			breedingMemo: "順調に妊娠中",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-12-01T00:00:00Z"
		},
		breedingSummary: null,
		bloodline: null,
		motherInfo: null,
		events: null,
		status: "HEALTHY",
		healthStatus: "健康"
	} as unknown as GetCattleDetailResType;

	it("should render pregnancy progress correctly", () => {
		render(<BreedingSchedule cattle={mockCattle} />);

		expect(screen.getByText("妊娠・分娩スケジュール")).toBeInTheDocument();
		expect(screen.getByText("妊娠進行状況")).toBeInTheDocument();
		expect(screen.getByText("妊娠後期")).toBeInTheDocument();
		// パーセンテージと「完了」が分割されているため、個別に確認
		expect(screen.getByText("99.3%")).toBeInTheDocument();
		expect(screen.getByText("完了")).toBeInTheDocument();
		expect(screen.getByText("280日")).toBeInTheDocument();
		expect(screen.getByText("282日")).toBeInTheDocument();
	});

	it("should display expected calving date with countdown", () => {
		render(<BreedingSchedule cattle={mockCattle} />);

		expect(screen.getByText("分娩予定日")).toBeInTheDocument();
		expect(screen.getByText("2024-06-01")).toBeInTheDocument();
		// カウントダウンの表示を確認（日数は実行時によって変わるため、存在確認のみ）
		expect(screen.getByText(/あと/)).toBeInTheDocument();
	});

	it("should display scheduled pregnancy check date", () => {
		render(<BreedingSchedule cattle={mockCattle} />);

		expect(screen.getByText("妊娠鑑定予定日")).toBeInTheDocument();
		expect(screen.getByText("2024-05-01")).toBeInTheDocument();
	});

	it("should display parity information", () => {
		render(<BreedingSchedule cattle={mockCattle} />);

		expect(screen.getByText("産次:")).toBeInTheDocument();
		expect(screen.getByText("3産")).toBeInTheDocument();
	});

	it("should handle different pregnancy stages correctly", () => {
		// 妊娠初期
		const earlyPregnancyCattle: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						pregnancyDays: 45
					}
				: null
		} as GetCattleDetailResType;

		render(<BreedingSchedule cattle={earlyPregnancyCattle} />);
		expect(screen.getByText("妊娠初期")).toBeInTheDocument();

		// 妊娠中期
		const midPregnancyCattle: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						pregnancyDays: 150
					}
				: null
		} as GetCattleDetailResType;

		render(<BreedingSchedule cattle={midPregnancyCattle} />);
		expect(screen.getByText("妊娠中期")).toBeInTheDocument();
	});

	it("should handle zero pregnancy days", () => {
		const zeroPregnancyCattle: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						pregnancyDays: 0
					}
				: null
		} as GetCattleDetailResType;

		render(<BreedingSchedule cattle={zeroPregnancyCattle} />);
		// パーセンテージと「完了」が分割されているため、個別に確認
		expect(screen.getByText("0.0%")).toBeInTheDocument();
		expect(screen.getByText("完了")).toBeInTheDocument();
	});

	it("should not render when breeding status is null", () => {
		const cattleWithoutBreedingStatus: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: null
		} as GetCattleDetailResType;

		const { container } = render(
			<BreedingSchedule cattle={cattleWithoutBreedingStatus} />
		);
		expect(container.firstChild).toBeNull();
	});

	it("should handle missing expected calving date", () => {
		const cattleWithoutCalvingDate: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						expectedCalvingDate: null
					}
				: null
		} as GetCattleDetailResType;

		render(<BreedingSchedule cattle={cattleWithoutCalvingDate} />);
		expect(screen.queryByText("分娩予定日")).not.toBeInTheDocument();
	});

	it("should handle missing scheduled pregnancy check date", () => {
		const cattleWithoutCheckDate: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						scheduledPregnancyCheckDate: null
					}
				: null
		} as GetCattleDetailResType;

		render(<BreedingSchedule cattle={cattleWithoutCheckDate} />);
		expect(screen.queryByText("妊娠鑑定予定日")).not.toBeInTheDocument();
	});
});

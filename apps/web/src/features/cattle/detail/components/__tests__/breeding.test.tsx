import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breeding } from "../breeding";

describe("Breeding", () => {
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
		breedingSummary: {
			breedingSummaryId: 1,
			cattleId: 1,
			totalInseminationCount: 8,
			averageDaysOpen: 85,
			averagePregnancyPeriod: 282,
			averageCalvingInterval: 380,
			difficultBirthCount: 1,
			pregnancyHeadCount: 3,
			pregnancySuccessRate: 75
		},
		bloodline: null,
		motherInfo: null,
		events: null,
		status: "HEALTHY",
		healthStatus: "健康"
	} as unknown as GetCattleDetailResType;

	it("should render breeding status correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 繁殖（現在の状態）セクションの確認
		expect(screen.getByText("繁殖（現在の状態）")).toBeInTheDocument();

		expect(screen.getByText("産次:")).toBeInTheDocument();
		expect(screen.getByText("3産")).toBeInTheDocument();

		expect(screen.getByText("分娩予定日:")).toBeInTheDocument();
		expect(screen.getByText("2024-06-01")).toBeInTheDocument();

		expect(screen.getByText("妊娠鑑定予定日:")).toBeInTheDocument();
		expect(screen.getByText("2024-05-01")).toBeInTheDocument();

		expect(screen.getByText("分娩後経過日数:")).toBeInTheDocument();
		expect(screen.getByText("120日")).toBeInTheDocument();

		expect(screen.getByText("空胎日数:")).toBeInTheDocument();
		expect(screen.getByText("90日")).toBeInTheDocument();

		expect(screen.getByText("妊娠日数:")).toBeInTheDocument();
		expect(screen.getByText("280日")).toBeInTheDocument();

		expect(screen.getByText("受精後日数:")).toBeInTheDocument();
		expect(screen.getByText("30日")).toBeInTheDocument();

		expect(screen.getByText("種付回数:")).toBeInTheDocument();
		expect(screen.getByText("2回")).toBeInTheDocument();

		expect(screen.getByText("前回の出産:")).toBeInTheDocument();
		expect(screen.getByText("安産")).toBeInTheDocument();

		expect(screen.getByText("繁殖メモ:")).toBeInTheDocument();
		expect(screen.getByText("順調に妊娠中")).toBeInTheDocument();
	});

	it("should render breeding summary correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 繁殖（累計）セクションの確認
		expect(screen.getByText("繁殖（累計）")).toBeInTheDocument();

		expect(screen.getByText("累計種付回数:")).toBeInTheDocument();
		expect(screen.getByText("8回")).toBeInTheDocument();

		expect(screen.getByText("平均空胎日数:")).toBeInTheDocument();
		expect(screen.getByText("85日")).toBeInTheDocument();

		expect(screen.getByText("平均妊娠期間:")).toBeInTheDocument();
		expect(screen.getByText("282日")).toBeInTheDocument();

		expect(screen.getByText("平均分娩間隔:")).toBeInTheDocument();
		expect(screen.getByText("380日")).toBeInTheDocument();

		expect(screen.getByText("難産回数:")).toBeInTheDocument();
		expect(screen.getByText("1回")).toBeInTheDocument();

		expect(screen.getByText("受胎頭数:")).toBeInTheDocument();
		expect(screen.getByText("3頭")).toBeInTheDocument();

		expect(screen.getByText("受胎率:")).toBeInTheDocument();
		expect(screen.getByText("75％")).toBeInTheDocument();
	});

	it("should display difficult birth correctly", () => {
		const cattleWithDifficultBirth: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						isDifficultBirth: true
					}
				: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithDifficultBirth} />);

		expect(screen.getByText("難産")).toBeInTheDocument();
	});

	it("should display '-' for null difficult birth status", () => {
		const cattleWithNullDifficultBirth: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						isDifficultBirth: null
					}
				: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithNullDifficultBirth} />);

		// 前回の出産の値として "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements.length).toBeGreaterThanOrEqual(1);
	});

	it("should display '-' for null breeding status values", () => {
		const cattleWithNullValues: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: {
				breedingStatusId: 1,
				cattleId: 1,
				parity: null,
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: null,
				daysAfterCalving: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: null,
				isDifficultBirth: null,
				breedingMemo: null,
				createdAt: "2023-01-01T00:00:00Z",
				updatedAt: "2023-12-01T00:00:00Z"
			}
		} as unknown as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithNullValues} />);

		// 繁殖状態のnull値に対して "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements.length).toBeGreaterThanOrEqual(4); // 実際の表示に合わせて調整
	});

	it("should display '-' for null breeding summary values", () => {
		const cattleWithNullSummary: GetCattleDetailResType = {
			...mockCattle,
			breedingSummary: {
				breedingSummaryId: 1,
				cattleId: 1,
				totalInseminationCount: null,
				averageDaysOpen: null,
				averagePregnancyPeriod: null,
				averageCalvingInterval: null,
				difficultBirthCount: null,
				pregnancyHeadCount: null,
				pregnancySuccessRate: null
			}
		} as unknown as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithNullSummary} />);

		// 繁殖サマリーのnull値に対して "-" が表示されることを確認
		// "-回", "-日", "-頭", "-％" の形で表示されるため、単体の"-"は見つからない
		const dashWithUnit = screen.getAllByText((content, element) => {
			return (
				content === "-回" ||
				content === "-日" ||
				content === "-頭" ||
				content === "-％"
			);
		});
		expect(dashWithUnit.length).toBe(7); // 7つの項目全てに "-" と単位が表示される
	});

	it("should show loading message when breeding status is null", () => {
		const cattleWithoutBreedingStatus: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithoutBreedingStatus} />);

		// "読み込み中..." が表示されることを確認
		const loadingMessages = screen.getAllByText("読み込み中...");
		expect(loadingMessages.length).toBeGreaterThanOrEqual(1);
	});

	it("should show loading message when breeding summary is null", () => {
		const cattleWithoutBreedingSummary: GetCattleDetailResType = {
			...mockCattle,
			breedingSummary: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithoutBreedingSummary} />);

		// "読み込み中..." が表示されることを確認
		const loadingMessages = screen.getAllByText("読み込み中...");
		expect(loadingMessages.length).toBeGreaterThanOrEqual(1);
	});

	it("should display creation and update timestamps", () => {
		render(<Breeding cattle={mockCattle} />);

		expect(
			screen.getByText("登録日時: 2023-01-01T00:00:00Z")
		).toBeInTheDocument();
		expect(
			screen.getByText("更新日時: 2023-12-01T00:00:00Z")
		).toBeInTheDocument();
	});

	it("should handle zero values correctly", () => {
		const cattleWithZeroValues: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						parity: 0,
						daysAfterCalving: 0,
						daysOpen: 0,
						pregnancyDays: 0,
						daysAfterInsemination: 0,
						inseminationCount: 0
					}
				: null,
			breedingSummary: mockCattle.breedingSummary
				? {
						...mockCattle.breedingSummary,
						totalInseminationCount: 0,
						averageDaysOpen: 0,
						averagePregnancyPeriod: 0,
						averageCalvingInterval: 0,
						difficultBirthCount: 0,
						pregnancyHeadCount: 0,
						pregnancySuccessRate: 0
					}
				: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithZeroValues} />);

		// 0の値が正しく表示されることを確認
		expect(screen.getByText("0産")).toBeInTheDocument();

		// "0回"が複数存在するため、getAllByTextを使用
		const zeroCountElements = screen.getAllByText("0回");
		expect(zeroCountElements.length).toBeGreaterThanOrEqual(2); // inseminationCount と totalInseminationCount

		// "0日"が複数存在するため、getAllByTextを使用
		const zeroDayElements = screen.getAllByText("0日");
		expect(zeroDayElements.length).toBeGreaterThanOrEqual(6); // 複数の日数フィールド

		expect(screen.getByText("0頭")).toBeInTheDocument();
		expect(screen.getByText("0％")).toBeInTheDocument();
	});
});

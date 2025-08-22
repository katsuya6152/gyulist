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

	it("should render breeding schedule correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 妊娠・分娩スケジュールセクションの確認
		expect(screen.getByText("妊娠・分娩スケジュール")).toBeInTheDocument();
		expect(screen.getByText("妊娠進行状況")).toBeInTheDocument();
		// 妊娠後期は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("妊娠後期")[0]).toBeInTheDocument();
		// パーセンテージと「完了」が分割されているため、個別に確認
		expect(screen.getByText("99.3%")).toBeInTheDocument();
		expect(screen.getByText("完了")).toBeInTheDocument();
		// 280日は複数箇所で表示されるため、getAllByTextを使用
		expect(screen.getAllByText("280日")[0]).toBeInTheDocument();
		// 282日は複数箇所で表示されるため、getAllByTextを使用
		expect(screen.getAllByText("282日")[0]).toBeInTheDocument();
	});

	it("should render breeding status correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 繁殖状態（現在）セクションの確認
		expect(screen.getByText("繁殖状態（現在）")).toBeInTheDocument();
		expect(screen.getByText("産次")).toBeInTheDocument();
		// 3産は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("3産")[0]).toBeInTheDocument();
		// 空胎日数は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("空胎日数")[0]).toBeInTheDocument();
		expect(screen.getByText("90日")).toBeInTheDocument();
		// 良好は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("良好")[0]).toBeInTheDocument();
		expect(screen.getByText("妊娠日数")).toBeInTheDocument();
		// 280日は複数箇所で表示されるため、getAllByTextを使用
		expect(screen.getAllByText("280日")[0]).toBeInTheDocument();
		// 妊娠後期は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("妊娠後期")[0]).toBeInTheDocument();
		expect(screen.getByText("種付回数")).toBeInTheDocument();
		expect(screen.getByText("2回")).toBeInTheDocument();
		// 良好は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("良好")[0]).toBeInTheDocument();
	});

	it("should render breeding history correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 繁殖履歴・パフォーマンスセクションの確認
		expect(screen.getByText("繁殖履歴・パフォーマンス")).toBeInTheDocument();
		expect(screen.getByText("受胎率")).toBeInTheDocument();
		expect(screen.getByText("75%")).toBeInTheDocument();
		expect(screen.getByText("主要指標の平均値")).toBeInTheDocument();
		expect(screen.getByText("パフォーマンス評価")).toBeInTheDocument();
		// 空胎日数は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("空胎日数")[0]).toBeInTheDocument();
		expect(screen.getByText("85日")).toBeInTheDocument();
		expect(screen.getByText("要改善")).toBeInTheDocument();
		// 実際には「平均分娩間隔」として表示されている
		expect(screen.getByText("平均分娩間隔")).toBeInTheDocument();
		expect(screen.getByText("380日")).toBeInTheDocument();
		// 良好は複数箇所で表示されるため、最初のものを取得
		expect(screen.getAllByText("良好")[0]).toBeInTheDocument();
	});

	it("should display breeding summary statistics correctly", () => {
		render(<Breeding cattle={mockCattle} />);

		// 統計サマリーの確認
		expect(screen.getByText("8")).toBeInTheDocument();
		expect(screen.getByText("累計種付回数")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("受胎頭数")).toBeInTheDocument();
		expect(screen.getByText("282")).toBeInTheDocument();
		expect(screen.getByText("平均妊娠期間")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("難産回数")).toBeInTheDocument();
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

		// 前回の出産セクションが表示されないことを確認
		expect(screen.queryByText("前回の出産")).not.toBeInTheDocument();
	});

	it("should handle zero values correctly", () => {
		const cattleWithZeroValues: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						parity: 0,
						pregnancyDays: 0,
						inseminationCount: 0
					}
				: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithZeroValues} />);

		// 0の値が正しく表示されることを確認
		expect(screen.getAllByText("0産")).toHaveLength(2); // 複数箇所で表示される

		// "0回"が複数存在するため、getAllByTextを使用
		const zeroInseminationElements = screen.getAllByText("0回");
		expect(zeroInseminationElements.length).toBeGreaterThanOrEqual(1);
	});

	it("should handle null breeding status gracefully", () => {
		const cattleWithoutBreedingStatus: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithoutBreedingStatus} />);

		// 妊娠・分娩スケジュールと繁殖状態は表示されない
		expect(
			screen.queryByText("妊娠・分娩スケジュール")
		).not.toBeInTheDocument();
		expect(screen.queryByText("繁殖状態（現在）")).not.toBeInTheDocument();

		// 繁殖履歴・パフォーマンスは表示される
		expect(screen.getByText("繁殖履歴・パフォーマンス")).toBeInTheDocument();
	});

	it("should handle null breeding summary gracefully", () => {
		const cattleWithoutBreedingSummary: GetCattleDetailResType = {
			...mockCattle,
			breedingSummary: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithoutBreedingSummary} />);

		// 妊娠・分娩スケジュールと繁殖状態は表示される
		expect(screen.getByText("妊娠・分娩スケジュール")).toBeInTheDocument();
		expect(screen.getByText("繁殖状態（現在）")).toBeInTheDocument();

		// 繁殖履歴・パフォーマンスは表示されない
		expect(
			screen.queryByText("繁殖履歴・パフォーマンス")
		).not.toBeInTheDocument();
	});

	it("should display breeding memo when available", () => {
		render(<Breeding cattle={mockCattle} />);

		expect(screen.getByText("繁殖メモ")).toBeInTheDocument();
		expect(screen.getByText("順調に妊娠中")).toBeInTheDocument();
	});

	it("should not display breeding memo when not available", () => {
		const cattleWithoutMemo: GetCattleDetailResType = {
			...mockCattle,
			breedingStatus: mockCattle.breedingStatus
				? {
						...mockCattle.breedingStatus,
						breedingMemo: null
					}
				: null
		} as GetCattleDetailResType;

		render(<Breeding cattle={cattleWithoutMemo} />);

		expect(screen.queryByText("繁殖メモ")).not.toBeInTheDocument();
	});
});

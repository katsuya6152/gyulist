import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BasicInfo } from "../basic-info";

describe("BasicInfo", () => {
	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "FEMALE",
		birthday: "2020-01-01",
		age: 4,
		monthsOld: 48,
		daysOld: 1460,
		growthStage: "MULTI_PAROUS",
		breed: "ホルスタイン",
		score: 85,
		producerName: "テスト生産者",
		barn: "A棟",
		breedingValue: 120,
		notes: "テスト用の牛です",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		ownerUserId: 1,
		weight: null,
		bloodline: null,
		breedingStatus: null,
		motherInfo: null,
		breedingSummary: null,
		events: null,
		status: "HEALTHY",
		healthStatus: "健康"
	} as unknown as GetCattleDetailResType;

	it("should render basic cattle information correctly", () => {
		render(<BasicInfo cattle={mockCattle} />);

		// タイトルの確認
		expect(screen.getByText("基本情報")).toBeInTheDocument();

		// 各フィールドの確認
		expect(screen.getByText("個体識別番号:")).toBeInTheDocument();
		expect(screen.getByText("12345")).toBeInTheDocument();

		expect(screen.getByText("出生日:")).toBeInTheDocument();
		expect(screen.getByText("2020-01-01")).toBeInTheDocument();

		expect(screen.getByText("年齢/月齢/日齢:")).toBeInTheDocument();
		expect(screen.getByText("4歳/48ヶ月/1460日")).toBeInTheDocument();

		expect(screen.getByText("得点:")).toBeInTheDocument();
		expect(screen.getByText("85")).toBeInTheDocument();

		expect(screen.getByText("品種:")).toBeInTheDocument();
		expect(screen.getByText("ホルスタイン")).toBeInTheDocument();

		expect(screen.getByText("生産者:")).toBeInTheDocument();
		expect(screen.getByText("テスト生産者")).toBeInTheDocument();

		expect(screen.getByText("牛舎:")).toBeInTheDocument();
		expect(screen.getByText("A棟")).toBeInTheDocument();

		expect(screen.getByText("育種価:")).toBeInTheDocument();
		expect(screen.getByText("120")).toBeInTheDocument();

		expect(screen.getByText("備考:")).toBeInTheDocument();
		expect(screen.getByText("テスト用の牛です")).toBeInTheDocument();
	});

	it("should display '-' for null or undefined values", () => {
		const cattleWithNulls: GetCattleDetailResType = {
			...mockCattle,
			score: null,
			breed: null,
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null
		} as GetCattleDetailResType;

		render(<BasicInfo cattle={cattleWithNulls} />);

		// null値に対して "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements).toHaveLength(7); // score, breed, producerName, barn, breedingValue, notes, weight
	});

	it("should display creation and update timestamps", () => {
		render(<BasicInfo cattle={mockCattle} />);

		expect(
			screen.getByText("登録日時: 2023-01-01T00:00:00Z")
		).toBeInTheDocument();
		expect(
			screen.getByText("更新日時: 2023-12-01T00:00:00Z")
		).toBeInTheDocument();
	});

	it("should handle undefined values gracefully", () => {
		const cattleWithUndefined: GetCattleDetailResType = {
			...mockCattle,
			score: null,
			breed: null,
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null
		} as unknown as GetCattleDetailResType;

		render(<BasicInfo cattle={cattleWithUndefined} />);

		// null値に対して "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements).toHaveLength(7);
	});

	it("should display numeric values correctly", () => {
		const cattleWithZeroValues: GetCattleDetailResType = {
			...mockCattle,
			age: 0,
			monthsOld: 0,
			daysOld: 0,
			score: 0,
			breedingValue: "0"
		} as unknown as GetCattleDetailResType;

		render(<BasicInfo cattle={cattleWithZeroValues} />);

		expect(screen.getByText("0歳/0ヶ月/0日")).toBeInTheDocument();

		// 複数の"0"が存在するため、getAllByTextを使用
		const zeroElements = screen.getAllByText("0");
		expect(zeroElements.length).toBeGreaterThanOrEqual(2); // score と breedingValue
	});
});

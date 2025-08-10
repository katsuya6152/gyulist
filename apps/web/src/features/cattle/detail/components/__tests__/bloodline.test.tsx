import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Bloodline } from "../bllodline";

describe("Bloodline", () => {
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
		bloodline: {
			bloodlineId: 1,
			cattleId: 1,
			fatherCattleName: "父牛テスト",
			motherFatherCattleName: "母父牛テスト",
			motherGrandFatherCattleName: "母祖父牛テスト",
			motherGreatGrandFatherCattleName: "母曽祖父牛テスト",
		},
		motherInfo: {
			motherInfoId: 1,
			cattleId: 1,
			motherCattleId: 1,
			motherName: "母牛テスト",
			motherIdentificationNumber: "67890",
			motherScore: 90,
		},
		breedingStatus: null,
		breedingSummary: null,
		events: null,
		healthStatus: "健康",
		status: "ACTIVE",
	} as unknown as GetCattleDetailResType;

	it("should render bloodline information correctly", () => {
		render(<Bloodline cattle={mockCattle} />);

		// 血統情報セクションの確認
		expect(screen.getByText("血統情報")).toBeInTheDocument();

		expect(screen.getByText("父:")).toBeInTheDocument();
		expect(screen.getByText("父牛テスト")).toBeInTheDocument();

		expect(screen.getByText("母の父:")).toBeInTheDocument();
		expect(screen.getByText("母父牛テスト")).toBeInTheDocument();

		expect(screen.getByText("母の祖父:")).toBeInTheDocument();
		expect(screen.getByText("母祖父牛テスト")).toBeInTheDocument();

		expect(screen.getByText("母の祖祖父:")).toBeInTheDocument();
		expect(screen.getByText("母曽祖父牛テスト")).toBeInTheDocument();
	});

	it("should render mother information correctly", () => {
		render(<Bloodline cattle={mockCattle} />);

		// 母情報セクションの確認
		expect(screen.getByText("母情報")).toBeInTheDocument();

		expect(screen.getByText("母の名前:")).toBeInTheDocument();
		expect(screen.getByText("母牛テスト")).toBeInTheDocument();

		expect(screen.getByText("母の個体識別番号:")).toBeInTheDocument();
		expect(screen.getByText("67890")).toBeInTheDocument();

		expect(screen.getByText("母の得点:")).toBeInTheDocument();
		expect(screen.getByText("90")).toBeInTheDocument();
	});

	it("should display '-' for null bloodline values", () => {
		const cattleWithNullBloodline: GetCattleDetailResType = {
			...mockCattle,
			bloodline: {
				bloodlineId: 1,
				cattleId: 1,
				fatherCattleName: null,
				motherFatherCattleName: null,
				motherGrandFatherCattleName: null,
				motherGreatGrandFatherCattleName: null,
			},
		} as GetCattleDetailResType;

		render(<Bloodline cattle={cattleWithNullBloodline} />);

		// 血統情報の各フィールドで "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements.length).toBeGreaterThanOrEqual(4); // 血統情報の4つのフィールド
	});

	it("should display '-' for null mother information", () => {
		const cattleWithNullMotherInfo: GetCattleDetailResType = {
			...mockCattle,
			motherInfo: {
				motherInfoId: 1,
				cattleId: 1,
				motherName: null,
				motherIdentificationNumber: null,
				motherScore: null,
			},
		} as GetCattleDetailResType;

		render(<Bloodline cattle={cattleWithNullMotherInfo} />);

		// 母情報の各フィールドで "-" が表示されることを確認
		const dashElements = screen.getAllByText("-");
		expect(dashElements.length).toBeGreaterThanOrEqual(3); // 母情報の3つのフィールド
	});

	it("should handle completely null bloodline and motherInfo", () => {
		const cattleWithNullData: GetCattleDetailResType = {
			...mockCattle,
			bloodline: null,
			motherInfo: null,
		} as GetCattleDetailResType;

		render(<Bloodline cattle={cattleWithNullData} />);

		// bloodlineがnullの場合、すべてのフィールドで "-" が表示される
		const dashElements = screen.getAllByText("-");
		expect(dashElements.length).toBeGreaterThanOrEqual(7); // 血統情報4つ + 母情報3つ
	});

	it("should display creation and update timestamps", () => {
		render(<Bloodline cattle={mockCattle} />);

		expect(
			screen.getByText("登録日時: 2023-01-01T00:00:00Z"),
		).toBeInTheDocument();
		expect(
			screen.getByText("更新日時: 2023-12-01T00:00:00Z"),
		).toBeInTheDocument();
	});

	it("should handle zero values in mother information", () => {
		const cattleWithZeroValues: GetCattleDetailResType = {
			...mockCattle,
			motherInfo: {
				motherInfoId: 1,
				cattleId: 1,
				motherCattleId: 1,
				motherName: "母牛テスト",
				motherIdentificationNumber: "0",
				motherScore: 0,
			},
		} as unknown as GetCattleDetailResType;

		render(<Bloodline cattle={cattleWithZeroValues} />);

		// 0の値が正しく表示されることを確認
		const zeroElements = screen.getAllByText("0");
		expect(zeroElements.length).toBeGreaterThanOrEqual(2); // motherIdentificationNumber と motherScore
	});
});

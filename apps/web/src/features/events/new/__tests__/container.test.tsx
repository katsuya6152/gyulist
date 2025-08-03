import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventNewContainer } from "../container";

// Mock the cattle service
vi.mock("@/services/cattleService", () => ({
	GetCattleDetail: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	notFound: vi.fn(),
}));

// Mock the presentational component
vi.mock("../presentational", () => ({
	EventNewPresentation: ({ cattle }: { cattle: GetCattleDetailResType }) => (
		<div data-testid="event-new-presentation">
			<div>Cattle ID: {cattle.cattleId}</div>
			<div>Cattle Name: {cattle.name}</div>
			<div>Ear Tag: {cattle.earTagNumber}</div>
		</div>
	),
}));

describe("EventNewContainer", () => {
	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 1,
		earTagNumber: 1,
		name: "テスト牛1",
		gender: "FEMALE",
		birthday: "2020-01-01",
		growthStage: "CALF",
		breed: "ホルスタイン",
		notes: "テスト用の牛",
		bloodline: {
			bloodlineId: 1,
			cattleId: 1,
			fatherCattleName: "父牛",
			motherFatherCattleName: "母父牛",
			motherGrandFatherCattleName: "母祖父牛",
			motherGreatGrandFatherCattleName: "母曽祖父牛",
		},
		breedingStatus: {
			breedingStatusId: 1,
			cattleId: 1,
			parity: null,
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving: null,
			isDifficultBirth: false,
			breedingMemo: "",
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: null,
		},
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: null,
	} as GetCattleDetailResType;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render EventNewPresentation with cattle data", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);

		const container = await EventNewContainer({ cattleId: "1" });
		render(container);

		expect(screen.getByTestId("event-new-presentation")).toBeInTheDocument();
		expect(screen.getByText("Cattle ID: 1")).toBeInTheDocument();
		expect(screen.getByText("Cattle Name: テスト牛1")).toBeInTheDocument();
		expect(screen.getByText("Ear Tag: 1")).toBeInTheDocument();

		expect(GetCattleDetail).toHaveBeenCalledWith("1");
	});

	it("should handle API error and call notFound", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		const { notFound } = await import("next/navigation");

		const mockError = new Error("API Error");
		vi.mocked(GetCattleDetail).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		try {
			await EventNewContainer({ cattleId: "1" });
		} catch (error) {
			// notFoundが呼ばれることを期待
		}

		expect(GetCattleDetail).toHaveBeenCalledWith("1");
		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to fetch cattle data:",
			mockError,
		);
		expect(notFound).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should pass correct cattleId to GetCattleDetail", async () => {
		const { GetCattleDetail } = await import("@/services/cattleService");
		vi.mocked(GetCattleDetail).mockResolvedValue(mockCattle);

		await EventNewContainer({ cattleId: "123" });

		expect(GetCattleDetail).toHaveBeenCalledWith("123");
		expect(GetCattleDetail).toHaveBeenCalledTimes(1);
	});
});

import type { GetCattleDetailResType } from "@/services/cattleService";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { History } from "../history";

describe("History", () => {
	const mockEvents = [
		{
			eventId: 1,
			eventType: "ESTRUS" as const,
			eventDatetime: "2024-01-15T10:30:00Z",
			notes: "発情確認",
		},
		{
			eventId: 2,
			eventType: "INSEMINATION" as const,
			eventDatetime: "2024-01-16T14:00:00Z",
			notes: "人工授精実施",
		},
		{
			eventId: 3,
			eventType: "VACCINATION" as const,
			eventDatetime: "2024-01-10T09:00:00Z",
			notes: "ワクチン接種",
		},
	];

	const mockCattle: GetCattleDetailResType = {
		cattleId: 1,
		identificationNumber: 12345,
		earTagNumber: 54321,
		name: "テスト牛",
		gender: "FEMALE",
		birthday: "2020-01-01",
		growthStage: "MULTI_PAROUS",
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-12-01T00:00:00Z",
		events: mockEvents,
		bloodline: null,
		breedingStatus: null,
		motherInfo: null,
		breedingSummary: null,
		status: "HEALTHY",
		healthStatus: "健康",
	} as unknown as GetCattleDetailResType;

	it("should render event history correctly", () => {
		render(<History cattle={mockCattle} />);

		// イベントタイプのラベルが表示されることを確認
		expect(screen.getByText("発情")).toBeInTheDocument();
		expect(screen.getByText("受精")).toBeInTheDocument();
		expect(screen.getByText("ワクチン")).toBeInTheDocument();

		// イベントのメモが表示されることを確認
		expect(screen.getByText("発情確認")).toBeInTheDocument();
		expect(screen.getByText("人工授精実施")).toBeInTheDocument();
		expect(screen.getByText("ワクチン接種")).toBeInTheDocument();
	});

	it("should display events in chronological order (newest first)", () => {
		render(<History cattle={mockCattle} />);

		// イベントが日付の新しい順で表示されることを確認
		// CardコンポーネントはarticleロールではないためdivでCardを探す
		const eventCards = screen
			.getAllByRole("generic")
			.filter((el) => el.getAttribute("data-slot") === "card");
		// 最新のイベント（INSEMINATION - 2024-01-16）が最初に表示される
		expect(eventCards[0]).toHaveTextContent("受精");
		expect(eventCards[1]).toHaveTextContent("発情");
		expect(eventCards[2]).toHaveTextContent("ワクチン");
	});

	it("should display 'newest' badge on the most recent event", () => {
		render(<History cattle={mockCattle} />);

		// 最新のイベントに「最新」バッジが表示されることを確認
		expect(screen.getByText("最新")).toBeInTheDocument();
	});

	it("should display formatted datetime for events", () => {
		render(<History cattle={mockCattle} />);

		// 日時が日本語形式で表示されることを確認（実際の形式は環境により異なる）
		// toLocaleString("ja-JP")の結果を確認
		const dateElements = screen.getAllByText(/2024/);
		expect(dateElements.length).toBeGreaterThanOrEqual(3);
	});

	it("should handle empty events array", () => {
		const cattleWithNoEvents: GetCattleDetailResType = {
			...mockCattle,
			events: [],
		} as unknown as GetCattleDetailResType;

		render(<History cattle={cattleWithNoEvents} />);

		// イベントが存在しない場合、イベントカードが表示されないことを確認
		const eventCards = screen
			.queryAllByRole("generic")
			.filter((el) => el.getAttribute("data-slot") === "card");
		expect(eventCards).toHaveLength(0);
	});

	it("should handle null events", () => {
		const cattleWithNullEvents: GetCattleDetailResType = {
			...mockCattle,
			events: null,
		} as unknown as GetCattleDetailResType;

		render(<History cattle={cattleWithNullEvents} />);

		// eventsがnullの場合、イベントカードが表示されないことを確認
		const eventCards = screen
			.queryAllByRole("generic")
			.filter((el) => el.getAttribute("data-slot") === "card");
		expect(eventCards).toHaveLength(0);
	});

	it("should display all event types correctly", () => {
		const allEventTypes = [
			{
				eventId: 1,
				eventType: "ESTRUS" as const,
				eventDatetime: "2024-01-01T10:00:00Z",
				notes: "発情テスト",
			},
			{
				eventId: 2,
				eventType: "INSEMINATION" as const,
				eventDatetime: "2024-01-02T10:00:00Z",
				notes: "受精テスト",
			},
			{
				eventId: 3,
				eventType: "CALVING" as const,
				eventDatetime: "2024-01-03T10:00:00Z",
				notes: "分娩テスト",
			},
			{
				eventId: 4,
				eventType: "VACCINATION" as const,
				eventDatetime: "2024-01-04T10:00:00Z",
				notes: "ワクチンテスト",
			},
			{
				eventId: 5,
				eventType: "SHIPMENT" as const,
				eventDatetime: "2024-01-05T10:00:00Z",
				notes: "出荷テスト",
			},
			{
				eventId: 6,
				eventType: "HOOF_TRIMMING" as const,
				eventDatetime: "2024-01-06T10:00:00Z",
				notes: "削蹄テスト",
			},
			{
				eventId: 7,
				eventType: "OTHER" as const,
				eventDatetime: "2024-01-07T10:00:00Z",
				notes: "その他テスト",
			},
		];

		const cattleWithAllEvents: GetCattleDetailResType = {
			...mockCattle,
			events: allEventTypes,
		} as unknown as GetCattleDetailResType;

		render(<History cattle={cattleWithAllEvents} />);

		// すべてのイベントタイプのラベルが表示されることを確認
		// 重複するテキストがある場合はgetAllByTextを使用
		expect(screen.getAllByText("発情").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("受精").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText("分娩")).toBeInTheDocument();
		expect(screen.getAllByText("ワクチン").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText("出荷")).toBeInTheDocument();
		expect(screen.getByText("削蹄")).toBeInTheDocument();
		expect(screen.getAllByText("その他").length).toBeGreaterThanOrEqual(1);
	});

	it("should display creation and update timestamps", () => {
		render(<History cattle={mockCattle} />);

		expect(
			screen.getByText("登録日時: 2023-01-01T00:00:00Z"),
		).toBeInTheDocument();
		expect(
			screen.getByText("更新日時: 2023-12-01T00:00:00Z"),
		).toBeInTheDocument();
	});

	it("should handle events with null notes", () => {
		const eventsWithNullNotes = [
			{
				eventId: 1,
				eventType: "ESTRUS" as const,
				eventDatetime: "2024-01-15T10:30:00Z",
				notes: null,
			},
		];

		const cattleWithNullNotes: GetCattleDetailResType = {
			...mockCattle,
			events: eventsWithNullNotes,
		} as unknown as GetCattleDetailResType;

		render(<History cattle={cattleWithNullNotes} />);

		// notesがnullの場合でもイベントが表示されることを確認
		expect(screen.getByText("発情")).toBeInTheDocument();
	});

	it("should filter out null events", () => {
		const eventsWithNull = [
			{
				eventId: 1,
				eventType: "ESTRUS" as const,
				eventDatetime: "2024-01-15T10:30:00Z",
				notes: "発情確認",
			},
			null,
			{
				eventId: 2,
				eventType: "VACCINATION" as const,
				eventDatetime: "2024-01-10T09:00:00Z",
				notes: "ワクチン接種",
			},
		];

		const cattleWithNullEvents: GetCattleDetailResType = {
			...mockCattle,
			events: eventsWithNull,
		} as unknown as GetCattleDetailResType;

		render(<History cattle={cattleWithNullEvents} />);

		// nullのイベントが除外され、有効なイベントのみが表示されることを確認
		expect(screen.getAllByText("発情").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("ワクチン").length).toBeGreaterThanOrEqual(1);

		const eventCards = screen
			.getAllByRole("generic")
			.filter((el) => el.getAttribute("data-slot") === "card");
		expect(eventCards).toHaveLength(2); // nullは除外される
	});
});

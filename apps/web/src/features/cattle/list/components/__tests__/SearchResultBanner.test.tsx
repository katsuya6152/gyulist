import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchResultBanner } from "../shared/SearchResultBanner";

describe("SearchResultBanner", () => {
	const user = userEvent.setup();
	const mockOnClearSearch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render search term correctly", () => {
		const searchTerm = "テスト検索";
		render(
			<SearchResultBanner
				searchTerm={searchTerm}
				onClearSearch={mockOnClearSearch}
			/>
		);

		// 検索ワードが表示されていることを確認
		expect(screen.getByText(searchTerm)).toBeInTheDocument();
		expect(screen.getByText(searchTerm)).toHaveClass(
			"font-medium",
			"text-foreground"
		);

		// クリアボタンが表示されていることを確認
		expect(screen.getByText("検索をクリア")).toBeInTheDocument();
	});

	it("should call onClearSearch when clear button is clicked", async () => {
		render(
			<SearchResultBanner
				searchTerm="テスト"
				onClearSearch={mockOnClearSearch}
			/>
		);

		// クリアボタンをクリック
		const clearButton = screen.getByText("検索をクリア");
		await user.click(clearButton);

		// onClearSearchが呼ばれることを確認
		expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
	});

	it("should display clear button correctly", () => {
		render(
			<SearchResultBanner searchTerm="牛" onClearSearch={mockOnClearSearch} />
		);

		const clearButton = screen.getByText("検索をクリア");
		expect(clearButton).toBeInTheDocument();

		// Xアイコンが存在することを確認
		const xIcon = document.querySelector("svg");
		expect(xIcon).toBeInTheDocument();
	});

	it("should handle empty search term", () => {
		render(
			<SearchResultBanner searchTerm="" onClearSearch={mockOnClearSearch} />
		);

		// クリアボタンは常に表示される
		expect(screen.getByText("検索をクリア")).toBeInTheDocument();
	});

	it("should render different search terms", () => {
		const searchTerms = ["牛", "A123", "母牛"];

		for (const searchTerm of searchTerms) {
			const { unmount } = render(
				<SearchResultBanner
					searchTerm={searchTerm}
					onClearSearch={mockOnClearSearch}
				/>
			);

			expect(screen.getByText(searchTerm)).toBeInTheDocument();
			expect(screen.getByText("検索をクリア")).toBeInTheDocument();

			unmount();
		}
	});
});

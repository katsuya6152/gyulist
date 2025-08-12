import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PreRegisterAdmin } from "../presentational";

describe("PreRegisterAdmin", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("adds basic auth header and query", async () => {
		process.env.NEXT_PUBLIC_API_URL = "https://example.com";
		const fetchMock = vi.spyOn(global, "fetch").mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify({ items: [] }), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				}),
			),
		);
		render(<PreRegisterAdmin initialParams={{}} />);
		await userEvent.type(screen.getByPlaceholderText("ユーザー"), "u");
		await userEvent.type(screen.getByPlaceholderText("パスワード"), "p");
		await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
		await userEvent.type(screen.getByPlaceholderText("メール検索"), "test");
		await userEvent.click(screen.getByRole("button", { name: "検索" }));
		expect(fetchMock).toHaveBeenCalled();
		const calls = fetchMock.mock.calls;
		const [url, options] = calls[calls.length - 1];
		expect(url).toContain("q=test");
		expect(options?.headers?.Authorization).toBe(`Basic ${btoa("u:p")}`);
	});
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PreRegisterAdmin } from "../presentational";

describe("PreRegisterAdmin", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("adds basic auth header and query", async () => {
		const { client } = await import("@/lib/rpc");
		type Resp = Awaited<
			ReturnType<typeof client.api.v1.admin.registrations.$get>
		>;
		const fake = {
			ok: true,
			status: 200,
			headers: new Headers({ "Content-Type": "application/json" }),
			json: async () => ({ data: { items: [], total: 0 } }),
			text: async () => JSON.stringify({ data: { items: [], total: 0 } }),
			body: null,
			bodyUsed: false,
			redirect: false,
			res: new Response()
		} as unknown as Resp;

		const spy = vi
			.spyOn(client.api.v1.admin.registrations, "$get")
			.mockResolvedValue(fake);
		render(<PreRegisterAdmin initialParams={{}} />);
		await userEvent.type(screen.getByPlaceholderText("ユーザー"), "u");
		await userEvent.type(screen.getByPlaceholderText("パスワード"), "p");
		await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
		await userEvent.type(screen.getByPlaceholderText("メール検索"), "test");
		await userEvent.click(screen.getByRole("button", { name: "検索" }));
		await waitFor(() => expect(spy).toHaveBeenCalled());
		const last = spy.mock.calls[spy.mock.calls.length - 1];
		const firstArg = last?.[0] as { query?: { q?: string } } | undefined;
		const opts = last?.[1] as { headers?: Record<string, string> } | undefined;
		// headers
		const authHeader =
			typeof opts?.headers === "object"
				? opts.headers.Authorization
				: undefined;
		expect(authHeader).toContain(`Basic ${btoa("u:p")}`);
		// query
		expect(firstArg?.query?.q).toBe("test");
	});
});

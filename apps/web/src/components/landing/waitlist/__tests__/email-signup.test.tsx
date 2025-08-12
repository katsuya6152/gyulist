import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { EmailSignup } from "../email-signup";

function mockFetch(response: unknown) {
	return vi.spyOn(global, "fetch").mockResolvedValue(
		new Response(JSON.stringify(response), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		}),
	);
}

describe("EmailSignup", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("validates required and format", async () => {
		mockFetch({ ok: true });
		render(<EmailSignup />);
		const submit = screen.getByRole("button", { name: "登録する" });
		await userEvent.click(submit);
		expect(
			await screen.findByText("無効なメールアドレスです"),
		).toBeInTheDocument();
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "invalid");
		await userEvent.click(submit);
		expect(
			await screen.findByText("無効なメールアドレスです"),
		).toBeInTheDocument();
	});

	it("submits successfully", async () => {
		const onSuccess = vi.fn();
		const fetchMock = mockFetch({ ok: true });
		render(<EmailSignup onSuccess={onSuccess} />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		const tokenInput = screen.getByTestId("turnstile");
		fireEvent.input(tokenInput, { target: { value: "token" } });
		const submit = screen.getByRole("button", { name: "登録する" });
		await userEvent.click(submit);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(
			await screen.findByText("登録完了メールを送信しました"),
		).toBeInTheDocument();
		expect(onSuccess).toHaveBeenCalled();
	});

	it("handles duplicate registration", async () => {
		mockFetch({ ok: true, alreadyRegistered: true });
		render(<EmailSignup />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		const tokenInput = screen.getByTestId("turnstile");
		fireEvent.input(tokenInput, { target: { value: "token" } });
		const submit = screen.getByRole("button", { name: "登録する" });
		await userEvent.click(submit);
		expect(await screen.findByText("既に登録済みです")).toBeInTheDocument();
	});

	it("prevents double submission", async () => {
		const fetchMock = mockFetch({ ok: true });
		render(<EmailSignup />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		const tokenInput = screen.getByTestId("turnstile");
		fireEvent.input(tokenInput, { target: { value: "token" } });
		const submit = screen.getByRole("button", { name: "登録する" });
		await Promise.all([userEvent.click(submit), userEvent.click(submit)]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

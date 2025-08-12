import { client } from "@/lib/rpc";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { EmailSignup } from "../email-signup";

// Infer the Hono client response type for $post once and reuse
type PreRegisterPostResponse = Awaited<
	ReturnType<(typeof client)["api"]["v1"]["pre-register"]["$post"]>
>;

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
		// Simulate managed Turnstile issuing a token
		(
			window as unknown as { onTurnstileToken?: (t: string) => void }
		).onTurnstileToken?.("token-123456");
		const submit = screen.getByRole("button", { name: "次へ" });
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
		const postSpy = vi
			.spyOn(client.api.v1["pre-register"], "$post")
			.mockResolvedValue({
				json: async () => ({ ok: true }),
			} as unknown as PreRegisterPostResponse);
		render(<EmailSignup onSuccess={onSuccess} />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		// Simulate managed Turnstile issuing a token
		(
			window as unknown as { onTurnstileToken?: (t: string) => void }
		).onTurnstileToken?.("token-123456");
		// Step 1 -> Step 2
		const next = screen.getByRole("button", { name: "次へ" });
		await userEvent.click(next);
		// Step 2 submit (referral source is optional)
		const submit = screen.getByRole("button", { name: "登録する" });
		await userEvent.click(submit);
		expect(postSpy).toHaveBeenCalledTimes(1);
		// After success, we redirect to /waitlist now; just verify callback fired
		expect(onSuccess).toHaveBeenCalled();
	});

	it("handles duplicate registration", async () => {
		const postSpy = vi
			.spyOn(client.api.v1["pre-register"], "$post")
			.mockResolvedValue({
				json: async () => ({ ok: true, alreadyRegistered: true }),
			} as unknown as PreRegisterPostResponse);
		render(<EmailSignup />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		// Simulate managed Turnstile issuing a token
		(
			window as unknown as { onTurnstileToken?: (t: string) => void }
		).onTurnstileToken?.("token-123456");
		// Step 1 -> Step 2
		const next = screen.getByRole("button", { name: "次へ" });
		await userEvent.click(next);
		// Submit without selecting referral source
		const submit = screen.getByRole("button", { name: "登録する" });
		await userEvent.click(submit);
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(await screen.findByText("既に登録済みです")).toBeInTheDocument();
	});

	it("prevents double submission", async () => {
		const postSpy = vi
			.spyOn(client.api.v1["pre-register"], "$post")
			.mockResolvedValue({
				json: async () => ({ ok: true }),
			} as unknown as PreRegisterPostResponse);
		render(<EmailSignup />);
		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "test@example.com");
		// Simulate managed Turnstile issuing a token
		(
			window as unknown as { onTurnstileToken?: (t: string) => void }
		).onTurnstileToken?.("token-123456");
		// Step 1 -> Step 2
		const next = screen.getByRole("button", { name: "次へ" });
		await userEvent.click(next);
		// Submit twice rapidly (referral source optional)
		const submit = screen.getByRole("button", { name: "登録する" });
		await Promise.all([userEvent.click(submit), userEvent.click(submit)]);
		expect(postSpy).toHaveBeenCalledTimes(1);
	});
});

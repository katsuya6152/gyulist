import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailSignup } from "../email-signup";

describe("EmailSignup", () => {
	it("shows validation for empty and invalid email", async () => {
		render(<EmailSignup />);
		const next = screen.getByRole("button", { name: "次へ" });
		await userEvent.click(next);
		expect(
			await screen.findByText("無効なメールアドレスです")
		).toBeInTheDocument();

		const email = screen.getByPlaceholderText("メールアドレス");
		await userEvent.type(email, "invalid");
		await userEvent.click(next);
		expect(
			await screen.findByText("無効なメールアドレスです")
		).toBeInTheDocument();
	});
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendVerificationEmail } from "../../../src/lib/mailer";
import type { Bindings } from "../../../src/types";

describe("Mailer", () => {
	let mockEnv: Bindings;
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		mockEnv = {
			APP_URL: "http://localhost:3000",
			ENVIRONMENT: "development",
		} as Bindings;
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	describe("sendVerificationEmail", () => {
		it("should log verification email in development mode", async () => {
			mockEnv.ENVIRONMENT = "development";
			const email = "test@example.com";
			const token = "test-token-123";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test@example.com - リンク: http://localhost:3000/verify?token=test-token-123",
			);
		});

		it("should log verification email when ENVIRONMENT is not production", async () => {
			mockEnv.ENVIRONMENT = "staging";
			const email = "staging@example.com";
			const token = "staging-token";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: staging@example.com - リンク: http://localhost:3000/verify?token=staging-token",
			);
		});

		it("should not log in production mode", async () => {
			mockEnv.ENVIRONMENT = "production";
			const email = "prod@example.com";
			const token = "prod-token";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).not.toHaveBeenCalled();
		});

		it("should handle different APP_URL values", async () => {
			mockEnv.APP_URL = "https://gyulist.com";
			mockEnv.ENVIRONMENT = "development";
			const email = "test@example.com";
			const token = "test-token";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test@example.com - リンク: https://gyulist.com/verify?token=test-token",
			);
		});

		it("should handle special characters in email and token", async () => {
			mockEnv.ENVIRONMENT = "development";
			const email = "test+user@example.com";
			const token = "token-with-special-chars_123";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test+user@example.com - リンク: http://localhost:3000/verify?token=token-with-special-chars_123",
			);
		});
	});
});

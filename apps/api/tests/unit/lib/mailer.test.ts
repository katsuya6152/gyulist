import type { AnyD1Database } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendVerificationEmail } from "../../../src/lib/mailer";
import type { Env } from "../../../src/shared/ports/d1Database";

describe("Mailer", () => {
	let mockEnv: Env;
	let consoleSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	// @ts-ignore - Complex mock type compatibility
	let fetchSpy: ReturnType<typeof vi.spyOn<typeof global.fetch>>;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async () => {
			return new Response();
		});

		mockEnv = {
			DB: {} as AnyD1Database,
			APP_URL: "http://localhost:3000",
			ENVIRONMENT: "development",
			JWT_SECRET: "test-secret",
			GOOGLE_CLIENT_ID: "test-id",
			GOOGLE_CLIENT_SECRET: "test-secret",
			RESEND_API_KEY: "test-api-key",
			MAIL_FROM: "test@gyulist.com",
			TURNSTILE_SECRET_KEY: "test-key",
			ADMIN_USER: "admin",
			ADMIN_PASS: "admin",
			WEB_ORIGIN: "http://localhost:3000"
		};
	});

	afterEach(() => {
		consoleSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		fetchSpy.mockRestore();
	});

	describe("sendVerificationEmail", () => {
		it("should log verification email in development mode", async () => {
			mockEnv.ENVIRONMENT = "development";
			const email = "test@example.com";
			const token = "test-token-123";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test@example.com - リンク: http://localhost:3000/verify?token=test-token-123"
			);
		});

		it("should log verification email when ENVIRONMENT is not production", async () => {
			mockEnv.ENVIRONMENT = "staging";
			const email = "staging@example.com";
			const token = "staging-token";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: staging@example.com - リンク: http://localhost:3000/verify?token=staging-token"
			);
		});

		it("should send email via Resend API in production mode", async () => {
			mockEnv.ENVIRONMENT = "production";
			const email = "prod@example.com";
			const token = "prod-token";

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ id: "resend-123" })
			};
			fetchSpy.mockResolvedValue(mockResponse as unknown as Response);

			await sendVerificationEmail(mockEnv, email, token);

			expect(fetchSpy).toHaveBeenCalledWith("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: "Bearer test-api-key",
					"Content-Type": "application/json"
				},
				body: expect.stringContaining('"from":"test@gyulist.com"')
			});
		});

		it("should handle Resend API errors in production mode", async () => {
			mockEnv.ENVIRONMENT = "production";
			const email = "prod@example.com";
			const token = "prod-token";

			const mockResponse = {
				ok: false,
				status: 400
			};
			fetchSpy.mockResolvedValue(mockResponse as unknown as Response);

			await expect(
				sendVerificationEmail(mockEnv, email, token)
			).rejects.toThrow("Resend API error: 400");
		});

		it("should handle different APP_URL values", async () => {
			mockEnv.APP_URL = "https://gyulist.com";
			mockEnv.ENVIRONMENT = "development";
			const email = "test@example.com";
			const token = "test-token";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test@example.com - リンク: https://gyulist.com/verify?token=test-token"
			);
		});

		it("should handle special characters in email and token", async () => {
			mockEnv.ENVIRONMENT = "development";
			const email = "test+user@example.com";
			const token = "token-with-special-chars_123";

			await sendVerificationEmail(mockEnv, email, token);

			expect(consoleSpy).toHaveBeenCalledWith(
				"【開発モード】メール送信: test+user@example.com - リンク: http://localhost:3000/verify?token=token-with-special-chars_123"
			);
		});

		it("should use default MAIL_FROM when not provided", async () => {
			mockEnv.ENVIRONMENT = "production";
			mockEnv.MAIL_FROM = undefined;
			const email = "test@example.com";
			const token = "test-token";

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ id: "resend-123" })
			};
			fetchSpy.mockResolvedValue(mockResponse as unknown as Response);

			await sendVerificationEmail(mockEnv, email, token);

			expect(fetchSpy).toHaveBeenCalledWith("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: "Bearer test-api-key",
					"Content-Type": "application/json"
				},
				body: expect.stringContaining('"from":"noreply@gyulist.com"')
			});
		});
	});
});

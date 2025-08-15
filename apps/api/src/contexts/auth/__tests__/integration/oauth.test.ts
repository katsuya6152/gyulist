import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import oauthRoutes from "../../../../../src/routes/oauth";
import type { Bindings } from "../../../../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1
} from "../../../../../tests/integration/helpers/fakeDrizzle";

// Mock external Google OAuth client and session creation
vi.mock("../../src/lib/oauth", () => ({
	createGoogleOAuth: () => ({
		createAuthorizationURL: () =>
			new URL("https://accounts.google.com/o/oauth2/auth?dummy"),
		validateAuthorizationCode: vi
			.fn()
			.mockResolvedValue({ accessToken: "token" })
	})
}));

// drizzleはこのテスト経路では未使用のためモック不要

// Mock fetch to Google userinfo
vi.stubGlobal(
	"fetch",
	vi.fn(async (url: string) => {
		if (String(url).includes("userinfo")) {
			return {
				ok: true,
				json: async () => ({
					id: "gid",
					email: "g@example.com",
					name: "G",
					picture: "x",
					verified_email: true
				}),
				text: async () => "",
				status: 200,
				statusText: "OK"
			} as unknown as Response;
		}
		return {
			ok: true,
			json: async () => ({}),
			status: 200,
			statusText: "OK"
		} as unknown as Response;
	})
);

describe("OAuth API E2E", () => {
	let app: Hono<{ Bindings: Bindings }>;

	beforeEach(async () => {
		const store = createEmptyStore();

		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: createFakeD1(store),
				JWT_SECRET: "test-secret",
				ENVIRONMENT: "test",
				APP_URL: "http://localhost:3000",
				GOOGLE_CLIENT_ID: "",
				GOOGLE_CLIENT_SECRET: "",
				RESEND_API_KEY: "",
				MAIL_FROM: "",
				TURNSTILE_SECRET_KEY: "",
				ADMIN_USER: "a",
				ADMIN_PASS: "b",
				WEB_ORIGIN: "http://localhost:3000"
			} as unknown as Bindings;
			await next();
		});
		app.route("/oauth", oauthRoutes);
	});

	it("GET /oauth/google redirects to Google", async () => {
		const res = await app.request("/oauth/google");
		expect(res.status).toBe(302);
		const loc = res.headers.get("location");
		expect(loc).toContain("https://accounts.google.com");
	});
});

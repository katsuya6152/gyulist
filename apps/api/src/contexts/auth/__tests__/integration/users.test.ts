import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import usersRoutes from "../../../../../src/routes/users";
import type { Bindings } from "../../../../../src/types";

const makeJwt = (payload: Record<string, unknown>) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" })
	).toString("base64");
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.sig`;
};
const authHeaders = {
	Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
};

describe("Users API E2E (no mocks)", () => {
	let app: Hono<{ Bindings: Bindings }>;

	beforeEach(() => {
		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: {} as AnyD1Database,
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
		app.route("/users", usersRoutes);
	});

	it("GET /users/:id unauthorized w/o token", async () => {
		const res = await app.request("/users/1");
		expect(res.status).toBe(401);
	});

	it("PATCH /users/:id/theme rejects when updating others theme", async () => {
		const res = await app.request("/users/2/theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ theme: "dark" })
		});
		expect(res.status).toBe(403);
	});
});

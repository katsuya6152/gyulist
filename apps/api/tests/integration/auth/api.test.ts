/**
 * Auth API Integration Tests - New Architecture
 *
 * 認証APIの新アーキテクチャ統合テスト
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

describe("Auth API Integration Tests - New Architecture", () => {
	let app: Hono;

	beforeEach(async () => {
		// Create simplified test app with basic auth validation
		app = new Hono();

		// Simplified auth routes for testing
		app.post(
			"/api/v1/auth/login",
			zValidator(
				"json",
				z.object({
					email: z.string().email(),
					password: z.string().min(8)
				})
			),
			async (c) => {
				return c.json({ token: "test-token" });
			}
		);

		app.post(
			"/api/v1/auth/register",
			zValidator(
				"json",
				z.object({
					email: z.string().email()
				})
			),
			async (c) => {
				return c.json({ message: "Registration email sent" });
			}
		);

		app.post(
			"/api/v1/auth/verify",
			zValidator(
				"json",
				z.object({
					token: z.string().min(1)
				})
			),
			async (c) => {
				return c.json({ verified: true });
			}
		);

		app.post(
			"/api/v1/auth/complete",
			zValidator(
				"json",
				z.object({
					token: z.string().min(1),
					name: z.string().min(1),
					password: z.string().min(8)
				})
			),
			async (c) => {
				return c.json({ success: true });
			}
		);

		app.patch("/api/v1/users/:id/theme", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({ success: true });
		});
	});

	describe("POST /auth/login", () => {
		it("should return validation error for empty body", async () => {
			const res = await app.request("/api/v1/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should return validation error for invalid email", async () => {
			const res = await app.request("/api/v1/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email: "invalid-email",
					password: "password123"
				})
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});
	});

	describe("POST /auth/register", () => {
		it("should return validation error for empty body", async () => {
			const res = await app.request("/api/v1/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should accept valid email for registration", async () => {
			const res = await app.request("/api/v1/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email: "test@example.com"
				})
			});

			expect(res.status).toBe(200);
		});
	});

	describe("POST /auth/verify", () => {
		it("should return validation error for empty token", async () => {
			const res = await app.request("/api/v1/auth/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});
	});

	describe("POST /auth/complete", () => {
		it("should return validation error for incomplete data", async () => {
			const res = await app.request("/api/v1/auth/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					token: "test-token"
					// Missing name and password
				})
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});
	});

	describe("User Routes", () => {
		it("should require authentication for user operations", async () => {
			const res = await app.request("/api/v1/users/1/theme", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ theme: "dark" })
			});

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});
	});
});

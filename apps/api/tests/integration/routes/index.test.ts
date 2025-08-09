import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRoutes } from "../../../src/routes";
import type { Bindings } from "../../../src/types";

describe("Routes Integration", () => {
	let app: Hono<{ Bindings: Bindings }>;

	beforeEach(() => {
		app = new Hono<{ Bindings: Bindings }>();

		// Environment setup middleware
		app.use("*", async (c, next) => {
			c.env = {
				DB: {},
				JWT_SECRET: "test-secret",
				ENVIRONMENT: "test",
				APP_URL: "http://localhost:3000",
				GOOGLE_CLIENT_ID: "test-client-id",
				GOOGLE_CLIENT_SECRET: "test-client-secret",
			};
			await next();
		});

		// Apply routes
		createRoutes(app);
	});

	describe("Route setup", () => {
		it("should setup routes correctly", async () => {
			// Test that routes are properly configured
			const routes = [
				{ path: "/api/v1/auth/register", method: "POST", expectedStatus: 400 },
				{ path: "/api/v1/users/1", method: "GET", expectedStatus: 401 },
				{ path: "/api/v1/cattle", method: "GET", expectedStatus: 401 },
				{ path: "/api/v1/events", method: "GET", expectedStatus: 401 },
			];

			for (const { path, method, expectedStatus } of routes) {
				const res = await app.request(path, {
					method,
					headers: { "Content-Type": "application/json" },
					body: method === "POST" ? JSON.stringify({}) : undefined,
				});
				expect(res.status).toBe(expectedStatus);
			}
		});

		it("should handle CORS preflight requests", async () => {
			const res = await app.request("/api/v1/auth/register", {
				method: "OPTIONS",
				headers: {
					Origin: "http://localhost:3000",
					"Access-Control-Request-Method": "POST",
				},
			});
			expect(res.status).toBe(204);
			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
				"http://localhost:3000",
			);
		});

		it("should return 404 for unknown routes", async () => {
			const res = await app.request("/api/v1/unknown");
			expect(res.status).toBe(404);
		});

		it("should handle root path without /api/v1", async () => {
			const res = await app.request("/health");
			expect(res.status).toBe(404); // Should not match without base path
		});
	});

	describe("Route integration", () => {
		it("should apply CORS middleware to all routes", async () => {
			const routes = [
				"/api/v1/auth/register",
				"/api/v1/users/1",
				"/api/v1/cattle",
				"/api/v1/events",
			];

			for (const route of routes) {
				const res = await app.request(route, {
					headers: { Origin: "http://localhost:3000" },
				});
				expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
					"http://localhost:3000",
				);
			}
		});

		it("should maintain proper route hierarchy", async () => {
			// Test that sub-routes are properly nested
			const res = await app.request("/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			expect(res.status).toBe(400); // Validation error, but route exists
		});

		it("should handle multiple route methods", async () => {
			// Test different HTTP methods on the same base path
			const getMethods = [
				{ path: "/api/v1/cattle", method: "GET", expectedStatus: 401 },
				{ path: "/api/v1/events", method: "GET", expectedStatus: 401 },
			];

			for (const { path, method, expectedStatus } of getMethods) {
				const res = await app.request(path, { method });
				expect(res.status).toBe(expectedStatus);
			}
		});
	});
});

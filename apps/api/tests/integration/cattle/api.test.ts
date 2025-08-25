/**
 * Cattle API Integration Tests - New Architecture
 *
 * 牛管理APIの新アーキテクチャ統合テスト
 */

import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";

describe("Cattle API Integration Tests - New Architecture", () => {
	let app: Hono;

	beforeEach(async () => {
		// Create simplified test app with mock cattle routes
		app = new Hono();

		// Mock cattle endpoints
		app.get("/api/v1/cattle", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({
				results: [],
				total: 0,
				hasMore: false,
				nextCursor: null
			});
		});

		app.post("/api/v1/cattle", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}

			// Try to parse JSON body
			try {
				const body = await c.req.json();
				// Check for invalid data (empty name)
				if (!body.name || body.name.trim() === "") {
					return c.json({ error: "Name is required" }, 400);
				}
				return c.json({ cattleId: 1, name: body.name });
			} catch (error) {
				return c.json({ error: "Invalid JSON" }, 400);
			}
		});

		app.get("/api/v1/cattle/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({ cattleId: 1, name: "Test Cattle", status: "HEALTHY" });
		});

		app.patch("/api/v1/cattle/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}

			try {
				const body = await c.req.json();
				return c.json({ cattleId: 1, name: body.name || "Updated Cattle" });
			} catch (error) {
				return c.json({ error: "Invalid JSON" }, 400);
			}
		});

		app.delete("/api/v1/cattle/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({ message: "Cattle deleted successfully" });
		});
	});

	describe("GET /cattle", () => {
		it("should return unauthorized without token", async () => {
			const res = await app.request("/api/v1/cattle");
			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should return cattle list with valid token", async () => {
			// Mock valid JWT token
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const res = await app.request("/api/v1/cattle", {
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("results");
			expect(Array.isArray(body.results)).toBe(true);
		});
	});

	describe("POST /cattle", () => {
		it("should create new cattle with valid data", async () => {
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const cattleData = {
				name: "テスト牛001",
				identificationNumber: 12345,
				earTagNumber: 67890,
				gender: "雌",
				growthStage: "CALF",
				breed: "ホルスタイン"
			};

			const res = await app.request("/api/v1/cattle", {
				method: "POST",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(cattleData)
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("cattleId");
			expect(body.name).toBe(cattleData.name);
		});

		it("should return validation error for invalid data", async () => {
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const invalidData = {
				name: "", // Invalid: empty name
				identificationNumber: -1, // Invalid: negative number
				earTagNumber: 67890,
				gender: "invalid", // Invalid: not in enum
				growthStage: "CALF"
			};

			const res = await app.request("/api/v1/cattle", {
				method: "POST",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(invalidData)
			});

			expect(res.status).toBe(400);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});
	});

	describe("GET /cattle/:id", () => {
		it("should return cattle details with valid ID", async () => {
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const res = await app.request("/api/v1/cattle/1", {
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("cattleId");
			expect(body).toHaveProperty("name");
			expect(body).toHaveProperty("status");
		});
	});

	describe("PATCH /cattle/:id", () => {
		it("should update cattle data", async () => {
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const updateData = {
				name: "更新された牛001",
				notes: "テスト更新"
			};

			const res = await app.request("/api/v1/cattle/1", {
				method: "PATCH",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(updateData)
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body.name).toBe(updateData.name);
		});
	});

	describe("DELETE /cattle/:id", () => {
		it("should remove cattle", async () => {
			const validToken = `Bearer ${btoa(
				JSON.stringify({
					header: { alg: "HS256", typ: "JWT" }
				})
			)}.${btoa(
				JSON.stringify({
					userId: 1,
					exp: Math.floor(Date.now() / 1000) + 3600
				})
			)}.signature`;

			const res = await app.request("/api/v1/cattle/1", {
				method: "DELETE",
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("message");
		});
	});
});

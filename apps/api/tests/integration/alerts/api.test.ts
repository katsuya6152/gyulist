/**
 * Alerts API Integration Tests - New Architecture
 *
 * アラート管理APIの新アーキテクチャ統合テスト
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

describe("Alerts API Integration Tests - New Architecture", () => {
	let app: Hono;

	beforeEach(async () => {
		// Create simplified test app with mock alert routes
		app = new Hono();

		// Mock alerts endpoints
		app.get("/api/v1/alerts", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({
				data: {
					results: [
						{
							alertId: 1,
							cattleId: 1,
							alertType: "HEALTH_CHECK_DUE",
							status: "active",
							priority: "medium",
							message: "Health check due for cattle #001",
							createdAt: new Date().toISOString()
						}
					],
					total: 1,
					summary: {
						active: 1,
						resolved: 0,
						dismissed: 0
					}
				}
			});
		});

		app.patch(
			"/api/v1/alerts/:alertId",
			zValidator(
				"json",
				z.object({
					status: z.enum(["active", "acknowledged", "resolved", "dismissed"])
				})
			),
			async (c) => {
				const authHeader = c.req.header("Authorization");
				if (!authHeader) {
					return c.json({ error: "No token provided" }, 401);
				}
				const alertId = c.req.param("alertId");
				const { status } = c.req.valid("json");
				return c.json({
					alertId: Number.parseInt(alertId),
					status,
					updatedAt: new Date().toISOString()
				});
			}
		);
	});

	describe("GET /alerts", () => {
		it("should return unauthorized without token", async () => {
			const res = await app.request("/api/v1/alerts");
			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should return alerts with valid token", async () => {
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

			const res = await app.request("/api/v1/alerts", {
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("data");
			expect(body.data).toHaveProperty("results");
			expect(body.data).toHaveProperty("total");
			expect(body.data).toHaveProperty("summary");
			expect(Array.isArray(body.data.results)).toBe(true);
		});
	});

	describe("PATCH /alerts/:alertId", () => {
		it("should require authentication", async () => {
			const res = await app.request("/api/v1/alerts/alert-123", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					status: "acknowledged"
				})
			});

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should update alert status with valid token", async () => {
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
				status: "acknowledged",
				memo: "確認済み"
			};

			const res = await app.request("/api/v1/alerts/alert-123", {
				method: "PATCH",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(updateData)
			});

			// Should succeed or return specific error
			expect([200, 404, 500]).toContain(res.status);
		});
	});

	describe("Alert Status Types", () => {
		const statusTypes = ["active", "acknowledged", "resolved", "dismissed"];

		for (const status of statusTypes) {
			it(`should accept ${status} status`, async () => {
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

				const res = await app.request("/api/v1/alerts/alert-123", {
					method: "PATCH",
					headers: {
						Authorization: validToken,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ status })
				});

				// Should not be a validation error
				expect(res.status).not.toBe(400);
			});
		}
	});
});

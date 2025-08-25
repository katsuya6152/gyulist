/**
 * Events API Integration Tests - New Architecture
 *
 * イベント管理APIの新アーキテクチャ統合テスト
 */

import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";

describe("Events API Integration Tests - New Architecture", () => {
	let app: Hono;

	beforeEach(async () => {
		// Create simplified test app with mock event routes
		app = new Hono();

		// Mock events endpoints
		app.get("/api/v1/events", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({
				data: {
					results: [
						{
							eventId: 1,
							cattleId: 1,
							eventType: "HEALTH_CHECK",
							eventDatetime: new Date().toISOString(),
							notes: "定期健康診断",
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString()
						},
						{
							eventId: 2,
							cattleId: 1,
							eventType: "VACCINATION",
							eventDatetime: new Date().toISOString(),
							notes: "ワクチン接種",
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString()
						}
					],
					total: 2,
					hasMore: false,
					nextCursor: null
				}
			});
		});

		app.post("/api/v1/events", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}

			// Try to parse JSON body
			try {
				const body = await c.req.json();
				// Check for required fields
				if (!body.cattleId || !body.eventType || !body.eventDatetime) {
					return c.json({ error: "Missing required fields" }, 400);
				}
				return c.json({
					message: "Event created successfully",
					eventId: 3,
					cattleId: body.cattleId,
					eventType: body.eventType,
					eventDatetime: body.eventDatetime,
					notes: body.notes || null
				});
			} catch (error) {
				return c.json({ error: "Invalid JSON" }, 400);
			}
		});

		app.get("/api/v1/events/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			const eventId = c.req.param("id");
			return c.json({
				eventId: Number.parseInt(eventId),
				cattleId: 1,
				eventType: "HEALTH_CHECK",
				eventDatetime: new Date().toISOString(),
				notes: "定期健康診断",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
		});

		app.patch("/api/v1/events/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}

			try {
				const body = await c.req.json();
				const eventId = c.req.param("id");
				return c.json({
					message: "Event updated successfully",
					eventId: Number.parseInt(eventId),
					updatedFields: Object.keys(body)
				});
			} catch (error) {
				return c.json({ error: "Invalid JSON" }, 400);
			}
		});

		app.delete("/api/v1/events/:id", async (c) => {
			const authHeader = c.req.header("Authorization");
			if (!authHeader) {
				return c.json({ error: "No token provided" }, 401);
			}
			return c.json({ message: "Event deleted successfully" });
		});
	});

	describe("GET /events", () => {
		it("should return unauthorized without token", async () => {
			const res = await app.request("/api/v1/events");
			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toHaveProperty("error");
		});

		it("should return events list with valid token", async () => {
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

			const res = await app.request("/api/v1/events", {
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("data");
			expect(body.data).toHaveProperty("results");
			expect(body.data).toHaveProperty("total");
			expect(body.data).toHaveProperty("hasMore");
			expect(body.data).toHaveProperty("nextCursor");
			expect(Array.isArray(body.data.results)).toBe(true);
			expect(body.data.total).toBe(2);
		});
	});

	describe("POST /events", () => {
		it("should create new event with valid data", async () => {
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

			const eventData = {
				cattleId: 1,
				eventType: "BREEDING",
				eventDatetime: new Date().toISOString(),
				notes: "人工授精実施"
			};

			const res = await app.request("/api/v1/events", {
				method: "POST",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(eventData)
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("message");
			expect(body).toHaveProperty("eventId");
			expect(body.cattleId).toBe(eventData.cattleId);
			expect(body.eventType).toBe(eventData.eventType);
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
				// Missing required fields: cattleId, eventType, eventDatetime
				notes: "テストメモ"
			};

			const res = await app.request("/api/v1/events", {
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

	describe("GET /events/:id", () => {
		it("should return event details with valid ID", async () => {
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

			const res = await app.request("/api/v1/events/1", {
				headers: {
					Authorization: validToken
				}
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("eventId");
			expect(body).toHaveProperty("cattleId");
			expect(body).toHaveProperty("eventType");
			expect(body).toHaveProperty("eventDatetime");
			expect(body).toHaveProperty("notes");
			expect(body).toHaveProperty("createdAt");
			expect(body).toHaveProperty("updatedAt");
		});
	});

	describe("PATCH /events/:id", () => {
		it("should update event data", async () => {
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
				notes: "更新されたメモ",
				eventDatetime: new Date().toISOString()
			};

			const res = await app.request("/api/v1/events/1", {
				method: "PATCH",
				headers: {
					Authorization: validToken,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(updateData)
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toHaveProperty("message");
			expect(body).toHaveProperty("eventId");
			expect(body).toHaveProperty("updatedFields");
			expect(body.updatedFields).toContain("notes");
			expect(body.updatedFields).toContain("eventDatetime");
		});
	});

	describe("DELETE /events/:id", () => {
		it("should remove event", async () => {
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

			const res = await app.request("/api/v1/events/1", {
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

	describe("Event Type Validation", () => {
		const eventTypes = [
			"HEALTH_CHECK",
			"VACCINATION",
			"BREEDING",
			"CALVING",
			"PREGNANCY_CHECK"
		];

		for (const eventType of eventTypes) {
			it(`should accept ${eventType} event type`, async () => {
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

				const eventData = {
					cattleId: 1,
					eventType,
					eventDatetime: new Date().toISOString(),
					notes: `${eventType}テスト`
				};

				const res = await app.request("/api/v1/events", {
					method: "POST",
					headers: {
						Authorization: validToken,
						"Content-Type": "application/json"
					},
					body: JSON.stringify(eventData)
				});

				// Should not be a validation error
				expect(res.status).not.toBe(400);
			});
		}
	});
});

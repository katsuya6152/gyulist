import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import healthRoutes from "../../src/routes/health";
import type { Bindings } from "../../src/types";

describe("Health API E2E", () => {
	it("GET / returns ok", async () => {
		const app = new Hono<{ Bindings: Bindings }>();
		app.route("/", healthRoutes);
		const res = await app.request("/");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe("ok");
		expect(typeof body.timestamp).toBe("string");
	});
});

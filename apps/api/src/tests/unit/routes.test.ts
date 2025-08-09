import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createRoutes } from "../../routes";
import type { Bindings } from "../../types";

describe("Routes", () => {
	it("should create routes successfully", () => {
		const app = new Hono<{ Bindings: Bindings }>();
		const routes = createRoutes(app);

		expect(routes).toBeDefined();
		expect(typeof routes).toBe("object");
	});

	it("should return hono app instance", () => {
		const app = new Hono<{ Bindings: Bindings }>();
		const routes = createRoutes(app);

		expect(routes.fetch).toBeDefined();
		expect(typeof routes.fetch).toBe("function");
	});
});

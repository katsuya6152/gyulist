import { describe, expect, it } from "vitest";
import app from "../../index";

describe("Main App", () => {
	it("should export app instance", () => {
		expect(app).toBeDefined();
		expect(typeof app).toBe("object");
	});

	it("should have request method", () => {
		expect(app.request).toBeDefined();
		expect(typeof app.request).toBe("function");
	});

	it("should have fetch method", () => {
		expect(app.fetch).toBeDefined();
		expect(typeof app.fetch).toBe("function");
	});
});

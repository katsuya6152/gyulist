import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "../../../src/lib/turnstile";

describe("verifyTurnstile", () => {
	it("returns true on success", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true })
			})
		);
		const result = await verifyTurnstile("secret", "token");
		expect(result).toBe(true);
	});

	it("throws on network error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 500 })
		);
		await expect(verifyTurnstile("secret", "token")).rejects.toThrow(
			/turnstile/
		);
	});

	it("returns false when success false", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: false })
			})
		);
		const result = await verifyTurnstile("secret", "token");
		expect(result).toBe(false);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});
});

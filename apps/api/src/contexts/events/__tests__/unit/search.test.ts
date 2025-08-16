import { describe, expect, it, vi } from "vitest";
import { search } from "../../domain/services/search";
import type { EventsRepoPort, UserId } from "../../ports";

describe("Events domain - search use case", () => {
	it("returns results from repo", async () => {
		const deps = {
			repo: {
				search: vi
					.fn()
					.mockResolvedValue({ results: [], nextCursor: null, hasNext: false })
			} as unknown as EventsRepoPort
		};
		const result = await search(deps)(1 as unknown as UserId, { limit: 10 });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.results).toEqual([]);
	});

	it("wraps infra errors", async () => {
		const deps = {
			repo: {
				search: vi.fn().mockRejectedValue(new Error("db"))
			} as unknown as EventsRepoPort
		};
		const result = await search(deps)(1 as unknown as UserId, { limit: 10 });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.type).toBe("InfraError");
	});
});

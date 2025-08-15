import { describe, expect, it, vi } from "vitest";
import { type ListDeps, list } from "../../domain/services/list";

describe("Registration domain - list", () => {
	it("returns items and total", async () => {
		const deps: ListDeps = {
			repo: {
				search: vi.fn().mockResolvedValue({ items: [{ id: "1" }], total: 1 }),
				findByEmail: vi.fn(),
				insert: vi.fn(),
				insertEmailLog: vi.fn()
			}
		};
		const res = await list(deps)({ limit: 10, offset: 0 });
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.value.total).toBe(1);
	});
	it("wraps infra errors", async () => {
		const deps: ListDeps = {
			repo: {
				search: vi.fn().mockRejectedValue(new Error("db")),
				findByEmail: vi.fn(),
				insert: vi.fn(),
				insertEmailLog: vi.fn()
			}
		};
		const res = await list(deps)({ limit: 10, offset: 0 });
		expect(res.ok).toBe(false);
	});
});

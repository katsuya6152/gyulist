import { describe, expect, it, vi } from "vitest";
import { buildQuery, downloadCsv, formatDate } from "../utils";

describe("utils", () => {
	it("builds query string", () => {
		const q = buildQuery({ q: "test", limit: 10, offset: 20 });
		expect(q).toBe("q=test&limit=10&offset=20");
	});

	it("formats date", () => {
		const d = formatDate("2024-01-15T10:00:00Z");
		expect(d).toContain("2024");
		expect(d).toContain("10");
	});

	it("downloads csv with bom", async () => {
		const blob = { text: () => Promise.resolve("a,b") } as unknown as Blob;
		const createObjectURL = vi.fn().mockReturnValue("blob:url");
		const revoke = vi.fn();
		const click = vi.fn();
		const originalURL = global.URL;
		// @ts-ignore
		global.URL = { createObjectURL, revokeObjectURL: revoke };
		vi.spyOn(document, "createElement").mockReturnValue({
			href: "",
			download: "",
			click
		} as unknown as HTMLAnchorElement);
		await downloadCsv(blob, "test.csv");
		expect(createObjectURL).toHaveBeenCalled();
		expect(click).toHaveBeenCalled();
		expect(revoke).toHaveBeenCalled();
		global.URL = originalURL;
	});
});

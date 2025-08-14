import { type Mock, describe, expect, it, vi } from "vitest";
import { sendCompletionEmail } from "../../../src/lib/resend";

describe("sendCompletionEmail", () => {
	it("sends email", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ id: "email_1" })
			})
		);
		const result = await sendCompletionEmail(
			"key",
			"from@example.com",
			"to@example.com",
			"search"
		);
		expect(result.id).toBe("email_1");
		const fetchMock = fetch as unknown as Mock;
		const call = fetchMock.mock.calls[0];
		expect(call[0]).toBe("https://api.resend.com/emails");
	});

	it("throws on failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 500 })
		);
		await expect(sendCompletionEmail("k", "f", "t", null)).rejects.toThrow(
			/resend/
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});
});

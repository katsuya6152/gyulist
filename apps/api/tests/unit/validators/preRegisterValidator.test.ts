import { describe, expect, it } from "vitest";
import { preRegisterSchema } from "../../../src/validators/preRegisterValidator";

describe("preRegisterSchema", () => {
	it("normalizes email and referral", () => {
		const parsed = preRegisterSchema.parse({
			email: "  User@Example.com ",
			referralSource: " search ",
			turnstileToken: "1234567890"
		});
		expect(parsed.email).toBe("user@example.com");
		expect(parsed.referralSource).toBe("search");
	});

	it("handles optional referral", () => {
		const parsed = preRegisterSchema.parse({
			email: "a@b.com",
			turnstileToken: "1234567890"
		});
		expect(parsed.referralSource).toBeNull();
	});
});

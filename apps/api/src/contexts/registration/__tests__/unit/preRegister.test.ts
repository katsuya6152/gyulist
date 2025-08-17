import { describe, expect, it, vi } from "vitest";
import {
	type PreRegisterDeps,
	preRegister
} from "../../domain/services/preRegister";
import type { RegistrationRecord } from "../../ports";

const makeDeps = (): PreRegisterDeps => ({
	turnstile: { verify: vi.fn().mockResolvedValue(true) },
	id: {
		uuid: vi.fn().mockReturnValue("id-1"),
		next: vi.fn().mockReturnValue(1)
	},
	time: { nowSeconds: () => 123 },
	repo: {
		findByEmail: vi.fn().mockResolvedValue(null),
		insert: vi.fn().mockResolvedValue(undefined),
		insertEmailLog: vi.fn().mockResolvedValue(undefined),
		search: vi.fn()
	},
	mail: { sendCompleted: vi.fn().mockResolvedValue({ id: "resend-1" }) },
	secrets: {
		TURNSTILE_SECRET_KEY: "t",
		RESEND_API_KEY: "r",
		MAIL_FROM: "from@example.com"
	}
});

describe("Registration domain - preRegister", () => {
	it("returns ok true for first-time email", async () => {
		const deps = makeDeps();
		const res = await preRegister(deps)({
			email: "a@ex.com",
			turnstileToken: "tok"
		});
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.value.status).toBe(200);
	});

	it("returns alreadyRegistered for existing email", async () => {
		const deps = makeDeps();
		vi.mocked(deps.repo.findByEmail).mockResolvedValue({
			id: "x"
		} as RegistrationRecord);
		const res = await preRegister(deps)({
			email: "a@ex.com",
			turnstileToken: "tok"
		});
		expect(res.ok).toBe(true);
		if (res.ok)
			expect(res.value.body).toMatchObject({ alreadyRegistered: true });
	});

	it("returns 502 when mail fails and logs", async () => {
		const deps = makeDeps();
		vi.mocked(deps.mail.sendCompleted).mockRejectedValue(new Error("resend"));
		const res = await preRegister(deps)({
			email: "a@ex.com",
			turnstileToken: "tok"
		});
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.value.status).toBe(502);
	});
});

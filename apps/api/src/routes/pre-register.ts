import { Hono } from "hono";
import { preRegister } from "../services/registrationService";
import type { Bindings } from "../types";
import { preRegisterSchema } from "../validators/preRegisterValidator";

const app = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const parsed = preRegisterSchema.safeParse(body);
	if (!parsed.success) {
		console.error(parsed.error); // validation error
		return c.json(
			{ ok: false, code: "VALIDATION_FAILED", message: "Validation failed" },
			400
		);
	}
	const result = await preRegister(c.env, c.env.DB, parsed.data);
	return c.json(result.body, result.status);
});

export default app;

import { Hono } from "hono";
import { basicAuthMiddleware } from "../middleware/basicAuth";
import { listRegistrations } from "../services/registrationService";
import type { Bindings } from "../types";
import { registrationQuerySchema } from "../validators/adminValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", basicAuthMiddleware)
	.get("/registrations", async (c) => {
		const parsed = registrationQuerySchema.safeParse(c.req.query());
		if (!parsed.success) {
			console.error(parsed.error);
			return c.json(
				{ ok: false, code: "VALIDATION_FAILED", message: "Validation failed" },
				400
			);
		}
		const data = await listRegistrations(c.env.DB, parsed.data);
		return c.json({ items: data.items, total: data.total });
	})
	.get("/registrations.csv", async (c) => {
		const parsed = registrationQuerySchema.safeParse(c.req.query());
		if (!parsed.success) {
			console.error(parsed.error);
			return c.json(
				{ ok: false, code: "VALIDATION_FAILED", message: "Validation failed" },
				400
			);
		}
		const data = await listRegistrations(c.env.DB, parsed.data);
		const rows = [
			"id,email,referral_source,status,locale,created_at,updated_at",
			...data.items.map((r) =>
				[
					r.id,
					r.email,
					r.referralSource ?? "",
					r.status,
					r.locale,
					r.createdAt,
					r.updatedAt
				].join(",")
			)
		];
		const encoder = new TextEncoder();
		const content = encoder.encode(rows.join("\n"));
		const csv = new Uint8Array([0xef, 0xbb, 0xbf, ...content]);
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		c.header("Content-Type", "text/csv");
		c.header(
			"Content-Disposition",
			`attachment; filename="registrations_${date}.csv"`
		);
		return c.body(csv);
	});

export default app;

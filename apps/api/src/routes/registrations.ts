import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { basicAuth } from "../middleware/basicAuth";
import { listRegistrations } from "../repositories/registrationRepository";
import { preRegister } from "../services/registrationService";
import type { Bindings } from "../types";
import {
	AdminRegistrationsQuerySchema,
	PreRegisterSchema,
} from "../validators/registrationValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.post("/pre-register", zValidator("json", PreRegisterSchema), async (c) => {
		const data = c.req.valid("json");
		const result = await preRegister(c.env, data);
		if ("error" in result) {
			if (result.error === "TURNSTILE_FAILED") {
				return c.json(
					{
						ok: false,
						code: "TURNSTILE_FAILED",
						message: "Turnstile verification failed",
					},
					400,
				);
			}
			if (result.error === "RESEND_FAILED") {
				return c.json(
					{
						ok: false,
						code: "RESEND_FAILED",
						message: "Email send failed",
					},
					502,
				);
			}
			if (result.error === "DB_FAILED") {
				return c.json(
					{
						ok: false,
						code: "DB_FAILED",
						message: "Database error",
					},
					500,
				);
			}
		}
		return c.json({ ok: true, alreadyRegistered: result.alreadyRegistered });
	})
	.get(
		"/admin/registrations",
		basicAuth(),
		zValidator("query", AdminRegistrationsQuerySchema),
		async (c) => {
			const q = c.req.valid("query");
			const filters = {
				q: q.q,
				from: q.from
					? Math.floor(new Date(q.from).getTime() / 1000)
					: undefined,
				to: q.to ? Math.floor(new Date(q.to).getTime() / 1000) : undefined,
				source: q.source,
				limit: q.limit ?? 50,
				offset: q.offset ?? 0,
			};
			const results = await listRegistrations(c.env.DB, filters);
			return c.json({ ok: true, results });
		},
	)
	.get(
		"/admin/registrations.csv",
		basicAuth(),
		zValidator("query", AdminRegistrationsQuerySchema),
		async (c) => {
			const q = c.req.valid("query");
			const filters = {
				q: q.q,
				from: q.from
					? Math.floor(new Date(q.from).getTime() / 1000)
					: undefined,
				to: q.to ? Math.floor(new Date(q.to).getTime() / 1000) : undefined,
				source: q.source,
				limit: q.limit ?? 1000,
				offset: q.offset ?? 0,
			};
			const results = await listRegistrations(c.env.DB, filters);
			const rows = [
				["email", "referral_source", "created_at"],
				...results.map((r) => [
					r.email,
					r.referral_source ?? "",
					new Date(r.created_at * 1000).toISOString(),
				]),
			];
			const csv = `\uFEFF${rows
				.map((r) =>
					r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
				)
				.join("\n")}`;
			const filename = `registrations_${new Date()
				.toISOString()
				.slice(0, 10)
				.replace(/-/g, "")}.csv`;
			return c.newResponse(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename=${filename}`,
				},
			});
		},
	);

export default app;

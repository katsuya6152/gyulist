import { Hono } from "hono";
import { registrationQuerySchema } from "../contexts/registration/domain/codecs/input";
import { registrationsListResponseSchema } from "../contexts/registration/domain/codecs/output";
import { list as listUC } from "../contexts/registration/domain/services/list";
import { makeRegistrationRepo } from "../contexts/registration/infra/drizzle/repo";
import { basicAuthMiddleware } from "../middleware/basicAuth";
import {
	executeUseCase,
	handleValidationError
} from "../shared/http/route-helpers";
import { getLogger } from "../shared/logging/logger";
import {
	CsvBuilder,
	formatDateForFilename
} from "../shared/utils/data-helpers";
import { setCsvHeaders, setJsonHeaders } from "../shared/utils/request-helpers";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", basicAuthMiddleware)
	.get("/registrations", async (c) => {
		const parsed = registrationQuerySchema.safeParse(c.req.query());
		if (!parsed.success) {
			return handleValidationError(c, parsed.error);
		}

		const logger = getLogger(c);
		logger.info("Admin registrations list request", {
			queryParams: parsed.data,
			endpoint: "/admin/registrations"
		});

		setJsonHeaders(c);

		return executeUseCase(
			c,
			async () => {
				const repo = makeRegistrationRepo(c.env.DB);
				const res = await listUC({ repo })(parsed.data);
				if (!res.ok) return res;
				return {
					ok: true,
					value: registrationsListResponseSchema.parse({
						items: res.value.items,
						total: res.value.total
					})
				} as const;
			},
			{ envelope: "data" }
		);
	})
	.get("/registrations.csv", async (c) => {
		const parsed = registrationQuerySchema.safeParse(c.req.query());
		if (!parsed.success) {
			return handleValidationError(c, parsed.error);
		}

		const logger = getLogger(c);
		logger.info("Admin registrations CSV export request", {
			queryParams: parsed.data,
			endpoint: "/admin/registrations.csv"
		});

		try {
			const repo = makeRegistrationRepo(c.env.DB);
			const res = await listUC({ repo })(parsed.data);
			if (!res.ok) {
				logger.error("Registration list error for CSV export", {
					error: res.error,
					endpoint: "/admin/registrations.csv"
				});
				return c.json(
					{
						ok: false,
						code: "INTERNAL_ERROR",
						message: "Internal error",
						error: res.error
					},
					500
				);
			}

			const parsedList = registrationsListResponseSchema.parse({
				items: res.value.items,
				total: res.value.total
			});

			// CSVBuilderを使用してCSVを生成
			const csvBuilder = new CsvBuilder([
				"id",
				"email",
				"referral_source",
				"status",
				"locale",
				"created_at",
				"updated_at"
			]);

			for (const item of parsedList.items) {
				csvBuilder.addRow([
					item.id,
					item.email,
					item.referralSource ?? "",
					item.status,
					item.locale,
					item.createdAt,
					item.updatedAt
				]);
			}

			const filename = `registrations_${formatDateForFilename()}.csv`;
			const csv = csvBuilder.buildWithBom();

			setCsvHeaders(c, filename);

			logger.info("CSV export completed", {
				recordCount: parsedList.items.length,
				filename,
				endpoint: "/admin/registrations.csv"
			});

			return c.body(csv);
		} catch (error) {
			logger.unexpectedError(
				"CSV generation failed",
				error instanceof Error ? error : new Error(String(error)),
				{
					endpoint: "/admin/registrations.csv"
				}
			);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export default app;

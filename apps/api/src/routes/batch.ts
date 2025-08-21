import {
	calculateBreedingStatusBatch,
	calculateBreedingSummaryBatch
} from "@/contexts/breeding/domain/services/batchCalculation";
import { Hono } from "hono";
import { z } from "zod";
import { basicAuthMiddleware } from "../middleware/basicAuth";
import { makeDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import { getLogger } from "../shared/logging/logger";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>().use("*", basicAuthMiddleware);

// バッチ処理のクエリパラメータスキーマ
const batchQuerySchema = z.object({
	limit: z
		.string()
		.transform(Number)
		.pipe(z.number().min(1).max(1000))
		.optional()
		.default("100"),
	offset: z
		.string()
		.transform(Number)
		.pipe(z.number().min(0))
		.optional()
		.default("0"),
	force: z
		.string()
		.transform((val) => val === "true")
		.optional()
		.default("false")
});

/**
 * 繁殖状態のバッチ計算エンドポイント
 *
 * 毎日計算が必要な繁殖状態（daysAfterCalving、pregnancyDays等）を
 * バッチ処理で更新します。
 */
app.post("/breeding-status", async (c) => {
	const parsed = batchQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json({ error: "Invalid query parameters" }, 400);
	}

	const logger = getLogger(c);
	logger.info("Breeding status batch calculation started", {
		limit: parsed.data.limit,
		offset: parsed.data.offset,
		force: parsed.data.force,
		endpoint: "/batch/breeding-status"
	});

	return executeUseCase(
		c,
		async () => {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await calculateBreedingStatusBatch(deps)({
				limit: parsed.data.limit,
				offset: parsed.data.offset,
				force: parsed.data.force
			});

			if (!result.ok) return result;

			logger.info("Breeding status batch calculation completed", {
				processedCount: result.value.processedCount,
				updatedCount: result.value.updatedCount,
				errors: result.value.errors.length,
				endpoint: "/batch/breeding-status"
			});

			return {
				ok: true,
				value: {
					message: "Breeding status batch calculation completed",
					processedCount: result.value.processedCount,
					updatedCount: result.value.updatedCount,
					errors: result.value.errors,
					timestamp: new Date().toISOString()
				}
			};
		},
		{ envelope: "data" }
	);
});

/**
 * 繁殖サマリーのバッチ計算エンドポイント
 *
 * 繁殖統計情報（受胎率、平均妊娠期間等）を
 * バッチ処理で計算・更新します。
 */
app.post("/breeding-summary", async (c) => {
	const parsed = batchQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json({ error: "Invalid query parameters" }, 400);
	}

	const logger = getLogger(c);
	logger.info("Breeding summary batch calculation started", {
		limit: parsed.data.limit,
		offset: parsed.data.offset,
		force: parsed.data.force,
		endpoint: "/batch/breeding-summary"
	});

	return executeUseCase(
		c,
		async () => {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await calculateBreedingSummaryBatch(deps)({
				limit: parsed.data.limit,
				offset: parsed.data.offset,
				force: parsed.data.force
			});

			if (!result.ok) return result;

			logger.info("Breeding summary batch calculation completed", {
				processedCount: result.value.processedCount,
				updatedCount: result.value.updatedCount,
				errors: result.value.errors.length,
				endpoint: "/batch/breeding-summary"
			});

			return {
				ok: true,
				value: {
					message: "Breeding summary batch calculation completed",
					processedCount: result.value.processedCount,
					updatedCount: result.value.updatedCount,
					errors: result.value.errors,
					timestamp: new Date().toISOString()
				}
			} as const;
		},
		{ envelope: "data" }
	);
});

/**
 * 全バッチ処理の実行エンドポイント
 *
 * 繁殖状態とサマリーの両方を順次実行します。
 */
app.post("/all", async (c) => {
	const parsed = batchQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json({ error: "Invalid query parameters" }, 400);
	}

	const logger = getLogger(c);
	logger.info("All batch calculations started", {
		limit: parsed.data.limit,
		offset: parsed.data.offset,
		force: parsed.data.force,
		endpoint: "/batch/all"
	});

	return executeUseCase(
		c,
		async () => {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const startTime = Date.now();

			// 1. 繁殖状態の計算
			const statusResult = await calculateBreedingStatusBatch(deps)({
				limit: parsed.data.limit,
				offset: parsed.data.offset,
				force: parsed.data.force
			});

			if (!statusResult.ok) return statusResult;

			// 2. 繁殖サマリーの計算
			const summaryResult = await calculateBreedingSummaryBatch(deps)({
				limit: parsed.data.limit,
				offset: parsed.data.offset,
				force: parsed.data.force
			});

			if (!summaryResult.ok) return summaryResult;

			const duration = Date.now() - startTime;

			logger.info("All batch calculations completed", {
				statusProcessed: statusResult.value.processedCount,
				statusUpdated: statusResult.value.updatedCount,
				summaryProcessed: summaryResult.value.processedCount,
				summaryUpdated: summaryResult.value.updatedCount,
				duration,
				endpoint: "/batch/all"
			});

			return {
				ok: true,
				value: {
					message: "All batch calculations completed",
					breedingStatus: {
						processedCount: statusResult.value.processedCount,
						updatedCount: statusResult.value.updatedCount,
						errors: statusResult.value.errors
					},
					breedingSummary: {
						processedCount: summaryResult.value.processedCount,
						updatedCount: summaryResult.value.updatedCount,
						errors: summaryResult.value.errors
					},
					duration: `${duration}ms`,
					timestamp: new Date().toISOString()
				}
			} as const;
		},
		{ envelope: "data" }
	);
});

export default app;

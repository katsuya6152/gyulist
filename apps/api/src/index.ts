import { Hono } from "hono";
import { hc } from "hono/client";
import {
	getAllUserIds,
	updateAlertsBatch
} from "./contexts/alerts/domain/services/batchUpdateService";
import {
	calculateBreedingStatusBatch,
	calculateBreedingSummaryBatch
} from "./contexts/breeding/domain/services/batchCalculation";
import { createRoutes } from "./routes";
import { makeDeps } from "./shared/config/di";
import { getLogger } from "./shared/logging/logger";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

const routes = createRoutes(app);

// Cronトリガー用のハンドラー
app.get("/cron/batch", async (c) => {
	const logger = getLogger(c);
	logger.info("Cron batch job started", {
		endpoint: "/cron/batch",
		timestamp: new Date().toISOString()
	});

	try {
		const deps = makeDeps(c.env.DB, { now: () => new Date() });
		const startTime = Date.now();

		// 1. 繁殖状態のバッチ計算
		const statusResult = await calculateBreedingStatusBatch(deps)({
			limit: 100,
			offset: 0,
			force: false
		});

		if (!statusResult.ok) {
			logger.error("Breeding status batch calculation failed", {
				error: statusResult.error,
				endpoint: "/cron/batch"
			});
			return c.json({ error: "Breeding status batch failed" }, 500);
		}

		// 2. 繁殖サマリーのバッチ計算
		const summaryResult = await calculateBreedingSummaryBatch(deps)({
			limit: 100,
			offset: 0,
			force: false
		});

		if (!summaryResult.ok) {
			logger.error("Breeding summary batch calculation failed", {
				error: summaryResult.error,
				endpoint: "/cron/batch"
			});
			return c.json({ error: "Breeding summary batch failed" }, 500);
		}

		// 3. アラート更新のバッチ処理
		logger.info("Alert update batch processing started");
		const userIds = await getAllUserIds(deps.alertsRepo);

		const alertDeps = {
			repo: deps.alertsRepo,
			time: { nowSeconds: () => Math.floor(Date.now() / 1000) },
			idGenerator: {
				generate: () =>
					`alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
			}
		};

		const alertsResult = await updateAlertsBatch(alertDeps)({
			userIds,
			now: () => new Date()
		});

		if (!alertsResult.ok) {
			logger.error("Alert update batch processing failed", {
				error: alertsResult.error,
				endpoint: "/cron/batch"
			});
			return c.json({ error: "Alert update batch failed" }, 500);
		}

		const duration = Date.now() - startTime;

		logger.info("Cron batch job completed", {
			statusProcessed: statusResult.value.processedCount,
			statusUpdated: statusResult.value.updatedCount,
			summaryProcessed: summaryResult.value.processedCount,
			summaryUpdated: summaryResult.value.updatedCount,
			alertsProcessed: alertsResult.value.totalUsers,
			alertsUpdated: alertsResult.value.totalUpdated,
			alertsCreated: alertsResult.value.totalCreated,
			alertsResolved: alertsResult.value.totalResolved,
			alertsErrors: alertsResult.value.errors,
			duration,
			endpoint: "/cron/batch"
		});

		return c.json({
			success: true,
			message: "Batch calculations completed",
			breedingStatus: {
				processedCount: statusResult.value.processedCount,
				updatedCount: statusResult.value.updatedCount,
				errors: statusResult.value.errors.length
			},
			breedingSummary: {
				processedCount: summaryResult.value.processedCount,
				updatedCount: summaryResult.value.updatedCount,
				errors: summaryResult.value.errors.length
			},
			alerts: {
				processedCount: alertsResult.value.totalUsers,
				updatedCount: alertsResult.value.totalUpdated,
				createdCount: alertsResult.value.totalCreated,
				resolvedCount: alertsResult.value.totalResolved,
				errors: alertsResult.value.errors
			},
			duration: `${duration}ms`,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.unexpectedError(
			"Cron batch job failed",
			error instanceof Error ? error : new Error(String(error)),
			{
				endpoint: "/cron/batch"
			}
		);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Hono RPC型定義
export type AppType = typeof routes;

// 🎯 共通定数 (値と型の両方をエクスポート)
export * from "./contexts/cattle/domain/model/types";
export * from "./contexts/events/domain/model/constants";
export * from "./contexts/alerts/domain/constants";

// 🔒 型のみエクスポート (Tree Shaking対応)
export type * from "./contexts/cattle/domain/codecs/input";
export type * from "./contexts/cattle/domain/codecs/output";
export type * from "./contexts/events/domain/codecs/input";
export type * from "./contexts/events/domain/codecs/output";
export type * from "./contexts/alerts/domain/codecs/output";
export type * from "./contexts/kpi/domain/codecs/output";
export type * from "./contexts/registration/domain/codecs/input";
export type * from "./contexts/registration/domain/codecs/output";
export type * from "./contexts/auth/domain/codecs/output";

// 🛠️ 必要に応じて個別の型をエクスポート
export type { Bindings } from "./types";

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;

// Cloudflare Workers Cronトリガー用のエクスポート
export { scheduled } from "./batch-scheduled";

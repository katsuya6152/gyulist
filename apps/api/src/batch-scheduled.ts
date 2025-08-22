import {
	getAllUserIds,
	updateAlertsBatch
} from "./contexts/alerts/domain/services/batchUpdateService";
import {
	calculateBreedingStatusBatch,
	calculateBreedingSummaryBatch
} from "./contexts/breeding/domain/services/batchCalculation";
import { makeDeps } from "./shared/config/di";
import { getLogger } from "./shared/logging/logger";
import type { Bindings } from "./types";

// Cloudflare Workersの型定義
interface ScheduledEvent {
	cron: string;
	scheduledTime: number;
}

/**
 * Cloudflare Workers Cronで自動実行されるバッチ処理
 * 毎日午前2時に実行される
 */
export async function scheduled(event: ScheduledEvent, env: Bindings) {
	const logger = getLogger({ env: { ENVIRONMENT: "production" } });
	const startTime = Date.now();

	try {
		logger.info("Cronバッチ処理を開始", {
			event: "scheduled",
			environment: "production",
			timestamp: new Date().toISOString(),
			cron: event.cron
		});

		// 依存関係を設定
		const deps = makeDeps(env.DB, { now: () => new Date() });

		// 1. 繁殖状態の更新（daysAfterCalving、pregnancyDays等）
		logger.info("繁殖状態のバッチ計算を開始");
		const statusResult = await calculateBreedingStatusBatch(deps)({
			limit: 1000,
			offset: 0,
			force: false
		});

		if (!statusResult.ok) {
			logger.error("繁殖状態のバッチ計算でエラーが発生", {
				environment: "production",
				timestamp: new Date().toISOString()
			});
			return;
		}

		logger.info("繁殖状態のバッチ計算が完了", {
			processedCount: statusResult.value.processedCount,
			updatedCount: statusResult.value.updatedCount,
			errors: statusResult.value.errors.length,
			environment: "production",
			timestamp: new Date().toISOString()
		});

		// 2. 繁殖サマリーの更新（受胎率、平均妊娠期間等）
		logger.info("繁殖サマリーのバッチ計算を開始");
		const summaryResult = await calculateBreedingSummaryBatch(deps)({
			limit: 1000,
			offset: 0,
			force: false
		});

		if (!summaryResult.ok) {
			logger.error("繁殖サマリーのバッチ計算でエラーが発生", {
				environment: "production",
				timestamp: new Date().toISOString()
			});
			return;
		}

		logger.info("繁殖サマリーのバッチ計算が完了", {
			processedCount: summaryResult.value.processedCount,
			updatedCount: summaryResult.value.updatedCount,
			errors: summaryResult.value.errors.length,
			environment: "production",
			timestamp: new Date().toISOString()
		});

		// 3. アラートの更新
		logger.info("アラート更新のバッチ処理を開始");

		// 全ユーザーIDを取得
		const userIds = await getAllUserIds(deps.alertsRepo);

		// アラート更新用の依存関係を設定（イベントリポジトリを含む）
		const alertDeps = {
			repo: deps.alertsRepo,
			eventsRepo: deps.eventsRepo,
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
			logger.error("アラート更新のバッチ処理でエラーが発生", {
				environment: "production",
				timestamp: new Date().toISOString()
			});
			return;
		}

		logger.info("アラート更新のバッチ処理が完了", {
			processedCount: alertsResult.value.totalUsers,
			updatedCount: alertsResult.value.totalUpdated,
			createdCount: alertsResult.value.totalCreated,
			resolvedCount: alertsResult.value.totalResolved,
			errors: alertsResult.value.errors,
			environment: "production",
			timestamp: new Date().toISOString()
		});

		const duration = Date.now() - startTime;
		logger.info("Cronバッチ処理が完了", {
			event: "scheduled",
			environment: "production",
			duration,
			statusProcessed: statusResult.value.processedCount,
			statusUpdated: statusResult.value.updatedCount,
			summaryProcessed: summaryResult.value.processedCount,
			summaryUpdated: summaryResult.value.updatedCount,
			totalErrors:
				statusResult.value.errors.length + summaryResult.value.errors.length,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error("Cronバッチ処理で予期しないエラーが発生", {
			event: "scheduled",
			environment: "production",
			error: error instanceof Error ? error.message : String(error),
			timestamp: new Date().toISOString()
		});
	}
}

/**
 * HTTPリクエストで手動実行される関数（開発・テスト用）
 */
export async function fetch(request: Request, env: Bindings) {
	const logger = getLogger({ env: { ENVIRONMENT: "development" } });

	try {
		logger.info("手動バッチ処理を開始", {
			event: "fetch",
			environment: "development",
			timestamp: new Date().toISOString()
		});

		// 開発環境用の依存関係を設定
		const deps = makeDeps(env.DB, { now: () => new Date() });

		// 繁殖状態の更新
		const statusResult = await calculateBreedingStatusBatch(deps)({
			limit: 100,
			offset: 0,
			force: false
		});

		// 繁殖サマリーの更新
		const summaryResult = await calculateBreedingSummaryBatch(deps)({
			limit: 100,
			offset: 0,
			force: false
		});

		// アラート更新（開発環境では常に実行）
		const userIds = await getAllUserIds(deps.alertsRepo);
		const alertDeps = {
			repo: deps.alertsRepo,
			eventsRepo: deps.eventsRepo,
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

		const result = {
			success: true,
			breedingStatus: statusResult.ok
				? {
						processedCount: statusResult.value.processedCount,
						updatedCount: statusResult.value.updatedCount,
						errors: statusResult.value.errors.length
					}
				: { error: statusResult.error },
			breedingSummary: summaryResult.ok
				? {
						processedCount: summaryResult.value.processedCount,
						updatedCount: summaryResult.value.updatedCount,
						errors: summaryResult.value.errors.length
					}
				: { error: summaryResult.error },
			alerts: alertsResult.ok
				? {
						processedCount: alertsResult.value.totalUsers,
						updatedCount: alertsResult.value.totalUpdated,
						createdCount: alertsResult.value.totalCreated,
						resolvedCount: alertsResult.value.totalResolved,
						errors: alertsResult.value.errors
					}
				: { error: alertsResult.error },
			timestamp: new Date().toISOString()
		};

		logger.info("手動バッチ処理が完了", {
			event: "fetch",
			environment: "development",
			result,
			timestamp: new Date().toISOString()
		});

		return new Response(JSON.stringify(result, null, 2), {
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		logger.error("手動バッチ処理でエラーが発生", {
			event: "fetch",
			environment: "development",
			timestamp: new Date().toISOString()
		});

		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString()
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" }
			}
		);
	}
}

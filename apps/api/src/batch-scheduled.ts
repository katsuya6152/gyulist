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
export default {
	/**
	 * Cronスケジュールで実行される関数
	 * 毎日午前2時に繁殖状態とサマリーを更新
	 */
	async scheduled(event: ScheduledEvent, env: Bindings) {
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
			const duration = Date.now() - startTime;
			logger.error("Cronバッチ処理で予期しないエラーが発生", {
				event: "scheduled",
				environment: "production",
				duration,
				timestamp: new Date().toISOString()
			});

			// エラーが発生した場合でも、Workerが停止しないようにする
			// 必要に応じてアラート通知を実装
		}
	},

	/**
	 * HTTPリクエストで手動実行される関数（開発・テスト用）
	 */
	async fetch(request: Request, env: Bindings) {
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
};

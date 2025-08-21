import { getLogger } from "../../../../shared/logging/logger";
import type { Result } from "../../../../shared/result";
import type { AlertsRepoPort } from "../../ports";
import type { AlertsDomainError } from "../errors";
import type { UserId } from "../model/types";
import { updateAlertsForUser } from "./alertUpdater";

// ============================================================================
// 依存関係とコマンド
// ============================================================================

/**
 * アラート更新バッチ処理の依存関係。
 */
export type AlertBatchUpdateDeps = {
	/** アラートリポジトリ */ repo: AlertsRepoPort;
	/** 時刻取得器 */ time: { nowSeconds(): number };
	/** ID生成器 */ idGenerator: { generate(): string };
};

/**
 * アラート更新バッチ処理コマンド。
 */
export type UpdateAlertsBatchCmd = {
	/** ユーザーID一覧 */ userIds: UserId[];
	/** 現在時刻取得関数 */ now: () => Date;
};

// ============================================================================
// 結果型
// ============================================================================

/**
 * アラート更新バッチ処理結果。
 */
export type AlertBatchUpdateResult = {
	/** 処理対象ユーザー数 */ totalUsers: number;
	/** 更新されたアラート数 */ totalUpdated: number;
	/** 新規作成されたアラート数 */ totalCreated: number;
	/** 解決されたアラート数 */ totalResolved: number;
	/** エラー数 */ errors: number;
	/** エラー詳細 */ errorDetails: Array<{
		userId: UserId;
		error: AlertsDomainError;
	}>;
};

// ============================================================================
// アラート更新バッチ処理サービス
// ============================================================================

/**
 * 複数ユーザーのアラートを一括更新するユースケース。
 *
 * 各ユーザーのアラートを並行処理で更新し、結果を集計します。
 *
 * @param deps - 依存関係
 * @param cmd - アラート更新バッチ処理コマンド
 * @returns 成功時はバッチ処理結果、失敗時はドメインエラー
 */
export const updateAlertsBatch =
	(deps: AlertBatchUpdateDeps) =>
	async (
		cmd: UpdateAlertsBatchCmd
	): Promise<Result<AlertBatchUpdateResult, AlertsDomainError>> => {
		const logger = getLogger({ env: { ENVIRONMENT: "production" } });
		const startTime = Date.now();

		try {
			logger.info("アラート更新バッチ処理を開始", {
				userCount: cmd.userIds.length,
				timestamp: cmd.now().toISOString()
			});

			let totalUpdated = 0;
			let totalCreated = 0;
			let totalResolved = 0;
			let errors = 0;
			const errorDetails: Array<{
				userId: UserId;
				error: AlertsDomainError;
			}> = [];

			// 各ユーザーのアラート更新を並行処理
			const updatePromises = cmd.userIds.map(async (userId) => {
				try {
					const result = await updateAlertsForUser({
						repo: deps.repo,
						time: deps.time,
						idGenerator: deps.idGenerator
					})({
						ownerUserId: userId,
						now: cmd.now
					});

					if (result.ok) {
						return {
							success: true as const,
							userId,
							data: result.value
						};
					}

					return {
						success: false as const,
						userId,
						error: result.error
					};
				} catch (error) {
					logger.error("ユーザーのアラート更新で予期しないエラーが発生", {
						userId: userId as number,
						error: error instanceof Error ? error.message : String(error),
						timestamp: cmd.now().toISOString()
					});

					return {
						success: false as const,
						userId,
						error: {
							type: "InfraError",
							cause: error
						} as AlertsDomainError
					};
				}
			});

			// 並行処理の結果を集計
			const results = await Promise.all(updatePromises);

			for (const result of results) {
				if (result.success) {
					totalUpdated += result.data.updatedCount;
					totalCreated += result.data.createdCount;
					totalResolved += result.data.resolvedCount;
					continue;
				}

				errors++;
				errorDetails.push({
					userId: result.userId,
					error: result.error
				});

				logger.error("ユーザーのアラート更新でエラーが発生", {
					userId: result.userId as number,
					error: result.error,
					timestamp: cmd.now().toISOString()
				});
			}

			const duration = Date.now() - startTime;
			const batchResult: AlertBatchUpdateResult = {
				totalUsers: cmd.userIds.length,
				totalUpdated,
				totalCreated,
				totalResolved,
				errors,
				errorDetails
			};

			console.log("[DEBUG] Batch result:", batchResult);
			logger.info("アラート更新バッチ処理が完了", {
				userCount: cmd.userIds.length,
				totalUpdated,
				totalCreated,
				totalResolved,
				errors,
				duration,
				timestamp: cmd.now().toISOString()
			});

			return { ok: true, value: batchResult };
		} catch (error) {
			console.error("[DEBUG] Error in updateAlertsBatch:", error);
			logger.error("アラート更新バッチ処理で予期しないエラーが発生", {
				error: error instanceof Error ? error.message : String(error),
				timestamp: cmd.now().toISOString()
			});

			return {
				ok: false,
				error: {
					type: "InfraError",
					message: error instanceof Error ? error.message : String(error),
					cause: error
				}
			};
		}
	};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 全ユーザーIDを取得するヘルパー関数。
 * アラートテーブルからowner_user_idを重複除去して取得します。
 *
 * @param repo - アラートリポジトリ
 * @returns ユーザーID一覧
 */
export async function getAllUserIds(repo: AlertsRepoPort): Promise<UserId[]> {
	try {
		// アラートテーブルからowner_user_idを重複除去して取得
		const userIds = await repo.findDistinctUserIds();
		return userIds;
	} catch (error) {
		console.warn(
			"Failed to get user IDs from alerts table, using fallback data:",
			error
		);
		// フォールバック: アラートテーブルから直接取得を試行
		try {
			const fallbackUserIds = await repo.findDistinctUserIdsFallback();
			return fallbackUserIds;
		} catch (fallbackError) {
			console.error(
				"Fallback method also failed, using dummy data:",
				fallbackError
			);
			return [1 as UserId];
		}
	}
}

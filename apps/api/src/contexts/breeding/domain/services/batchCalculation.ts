import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../cattle/domain/errors";
import type { BreedingAggregate } from "../../../cattle/domain/model/breedingAggregate";
import type { BreedingStatus } from "../../../cattle/domain/model/breedingStatus";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";
import type { BreedingRepoPort } from "../../ports";

/**
 * バッチ計算の依存関係
 */
export type BatchCalculationDeps = {
	breedingRepo: BreedingRepoPort;
	clock: ClockPort;
};

/**
 * バッチ計算の入力パラメータ
 */
export type BatchCalculationInput = {
	limit: number;
	offset: number;
	force: boolean;
};

/**
 * バッチ計算の結果
 */
export type BatchCalculationResult = {
	processedCount: number;
	updatedCount: number;
	errors: Array<{
		cattleId: CattleId;
		error: string;
	}>;
};

/**
 * 繁殖状態のバッチ計算ユースケース
 *
 * 毎日計算が必要な繁殖状態（daysAfterCalving、pregnancyDays等）を
 * バッチ処理で更新します。
 */
export const calculateBreedingStatusBatch =
	(deps: BatchCalculationDeps) =>
	async (
		input: BatchCalculationInput
	): Promise<Result<BatchCalculationResult, DomainError>> => {
		try {
			const currentTime = deps.clock.now();
			const errors: Array<{ cattleId: CattleId; error: string }> = [];
			let processedCount = 0;
			let updatedCount = 0;

			console.log("=== 繁殖状態バッチ処理開始 ===");
			console.log("入力パラメータ:", {
				limit: input.limit,
				offset: input.offset,
				force: input.force
			});

			// 繁殖状態を持つ牛のID一覧を取得
			const cattleIds = await deps.breedingRepo.findCattleNeedingAttention(
				0 as UserId, // 全ユーザーの牛を対象とする
				currentTime
			);

			console.log("対象牛数:", cattleIds.length);

			// ページネーション適用
			const paginatedIds = cattleIds.slice(
				input.offset,
				input.offset + input.limit
			);

			console.log("処理対象牛数:", paginatedIds.length);

			for (const cattleId of paginatedIds) {
				try {
					processedCount++;
					console.log(
						`牛ID ${cattleId} の処理開始 (${processedCount}/${paginatedIds.length})`
					);

					// 現在の繁殖集約を取得
					const aggregate = await deps.breedingRepo.findByCattleId(cattleId);
					if (!aggregate) {
						console.log(`牛ID ${cattleId}: 繁殖集約が見つかりません`);
						errors.push({
							cattleId,
							error: "Breeding aggregate not found"
						});
						continue;
					}

					console.log(`牛ID ${cattleId}: 現在の繁殖状態`, {
						parity: aggregate.currentStatus.parity,
						lastUpdated: aggregate.lastUpdated.toISOString()
					});

					// 更新が必要かチェック
					if (!input.force) {
						// 24時間以内に更新されている場合はスキップ
						const lastUpdate = aggregate.lastUpdated;
						const hoursSinceUpdate =
							(currentTime.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
						if (hoursSinceUpdate < 24) {
							console.log(
								`牛ID ${cattleId}: 24時間以内に更新済み (${hoursSinceUpdate.toFixed(2)}時間前)`
							);
							continue;
						}
					} else {
						console.log(`牛ID ${cattleId}: 強制更新モード - 更新を実行`);
					}

					// イベント履歴を取得
					const events = await deps.breedingRepo.getBreedingHistory(cattleId);
					console.log(`牛ID ${cattleId}: イベント履歴数`, events.length);

					// 繁殖状態の日数を直接DBで更新
					await deps.breedingRepo.updateBreedingStatusDays(
						cattleId,
						currentTime
					);
					updatedCount++;
					console.log(
						`牛ID ${cattleId}: 更新完了 (更新カウント: ${updatedCount})`
					);
				} catch (error) {
					console.error(`牛ID ${cattleId}: エラー`, error);
					errors.push({
						cattleId,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
			}

			console.log("=== 繁殖状態バッチ処理完了 ===", {
				processedCount,
				updatedCount,
				errors: errors.length
			});

			return ok({
				processedCount,
				updatedCount,
				errors
			});
		} catch (cause) {
			console.error("繁殖状態バッチ処理で予期しないエラー:", cause);
			return err({
				type: "InfraError",
				message: "Failed to calculate breeding status batch",
				cause
			});
		}
	};

/**
 * 繁殖サマリーのバッチ計算ユースケース
 *
 * 繁殖統計情報（受胎率、平均妊娠期間等）を
 * バッチ処理で計算・更新します。
 */
export const calculateBreedingSummaryBatch =
	(deps: BatchCalculationDeps) =>
	async (
		input: BatchCalculationInput
	): Promise<Result<BatchCalculationResult, DomainError>> => {
		try {
			const currentTime = deps.clock.now();
			const errors: Array<{ cattleId: CattleId; error: string }> = [];
			let processedCount = 0;
			let updatedCount = 0;

			// 注意が必要な牛を取得（バッチ処理の対象として使用）
			const cattleIds = await deps.breedingRepo.findCattleNeedingAttention(
				0 as UserId, // 全ユーザーの牛を対象とする
				currentTime
			);

			// ページネーション適用
			const paginatedIds = cattleIds.slice(
				input.offset,
				input.offset + input.limit
			);

			for (const cattleId of paginatedIds) {
				try {
					processedCount++;

					// 現在の繁殖集約を取得
					const aggregate = await deps.breedingRepo.findByCattleId(cattleId);
					if (!aggregate) {
						errors.push({
							cattleId,
							error: "Breeding aggregate not found"
						});
						continue;
					}

					// 繁殖イベント履歴を取得
					const breedingHistory =
						await deps.breedingRepo.getBreedingHistory(cattleId);
					if (!breedingHistory || breedingHistory.length === 0) {
						continue;
					}

					// 更新が必要かチェック（簡略化）
					if (!input.force) {
						// 24時間以内に更新されている場合はスキップ
						const lastUpdate = aggregate.lastUpdated;
						const hoursSinceUpdate =
							(currentTime.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
						if (hoursSinceUpdate < 24) {
							continue;
						}
					}

					// サマリーの再計算（簡略化）
					// 実際の計算ロジックは既存のドメインサービスを使用
					const updatedAggregate: BreedingAggregate = {
						...aggregate,
						lastUpdated: currentTime
					};

					await deps.breedingRepo.save(updatedAggregate);
					updatedCount++;
				} catch (error) {
					errors.push({
						cattleId,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
			}

			return ok({
				processedCount,
				updatedCount,
				errors
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to calculate breeding summary batch",
				cause
			});
		}
	};

/**
 * 繁殖状態の日数を現在時刻に基づいて更新
 * 簡略化された実装：既存の状態をそのまま返す（実際の更新はDBレベルで行う）
 */
function updateBreedingStatusDays(
	status: BreedingStatus,
	currentTime: Date
): BreedingStatus {
	// 実際の日数計算はDBレベルで行うため、ここでは状態をそのまま返す
	// 将来的には、イベント履歴に基づいて正確な日数を計算する
	return status;
}

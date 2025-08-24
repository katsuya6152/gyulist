/**
 * Get Status Counts Use Case
 *
 * 牛のステータス別頭数取得ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { Status } from "../../../domain/types/cattle/CattleTypes";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetStatusCountsDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 取得コマンドの型
 */
export type GetStatusCountsInput = {
	ownerUserId: UserId;
};

/**
 * ステータス別頭数の型
 */
export type StatusCounts = {
	HEALTHY: number;
	PREGNANT: number;
	RESTING: number;
	TREATING: number;
	SCHEDULED_FOR_SHIPMENT: number;
	SHIPPED: number;
	DEAD: number;
};

/**
 * ステータス別頭数取得ユースケースの関数型定義
 */
export type GetStatusCountsUseCase = (
	deps: GetStatusCountsDeps
) => (
	input: GetStatusCountsInput
) => Promise<Result<StatusCounts, CattleError>>;

/**
 * 牛のステータス別頭数取得ユースケース
 *
 * 指定されたユーザーの牛のステータス別頭数を取得します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時はステータス別頭数、失敗時は `CattleError` を含む `Result`
 */
export const getStatusCountsUseCase: GetStatusCountsUseCase =
	(deps) =>
	async (input): Promise<Result<StatusCounts, CattleError>> => {
		const result = await deps.cattleRepo.countByStatus(input.ownerUserId);
		if (!result.ok) {
			return result;
		}

		// デフォルト値を設定
		const statusCounts: StatusCounts = {
			HEALTHY: 0,
			PREGNANT: 0,
			RESTING: 0,
			TREATING: 0,
			SCHEDULED_FOR_SHIPMENT: 0,
			SHIPPED: 0,
			DEAD: 0
		};

		// 取得したデータでカウントを更新
		for (const { status, count } of result.value) {
			if (status && status in statusCounts) {
				statusCounts[status as keyof StatusCounts] = count;
			}
		}

		return ok(statusCounts);
	};

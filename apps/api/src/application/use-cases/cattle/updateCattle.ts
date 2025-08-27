/**
 * Update Cattle Use Case
 *
 * 牛更新ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { Cattle, NewCattleProps } from "../../../domain/types/cattle";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type UpdateCattleDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 牛更新コマンドの型
 */
export type UpdateCattleInput = {
	cattleId: CattleId;
	ownerUserId: UserId;
	updates: Partial<NewCattleProps>;
};

/**
 * 牛更新結果の型
 */
export type UpdateCattleResult = Cattle;

/**
 * 牛更新ユースケースの関数型定義
 */
export type UpdateCattleUseCase = (
	deps: UpdateCattleDeps
) => (
	input: UpdateCattleInput
) => Promise<Result<UpdateCattleResult, CattleError>>;

/**
 * 牛更新ユースケース
 *
 * 指定された牛の情報を更新します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const updateCattleUseCase: UpdateCattleUseCase =
	(deps: UpdateCattleDeps) =>
	async (
		input: UpdateCattleInput
	): Promise<Result<UpdateCattleResult, CattleError>> => {
		try {
			// 既存の牛を取得して存在確認
			const existingResult = await deps.cattleRepo.findById(input.cattleId);
			if (!existingResult.ok) {
				return existingResult;
			}

			if (!existingResult.value) {
				return err({
					type: "NotFound",
					entity: "Cattle",
					id: input.cattleId,
					message: "指定された牛が見つかりません"
				});
			}

			const existingCattle = existingResult.value;

			// 所有者の確認
			if (existingCattle.ownerUserId !== input.ownerUserId) {
				return err({
					type: "Forbidden",
					message: "この牛の更新権限がありません"
				});
			}

			// 更新の実行
			const updateResult = await deps.cattleRepo.update(
				input.cattleId,
				input.updates
			);
			if (!updateResult.ok) {
				return updateResult;
			}

			return ok(updateResult.value);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update cattle",
				cause
			});
		}
	};

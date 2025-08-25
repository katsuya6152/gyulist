/**
 * Delete Cattle Use Case
 *
 * 牛削除ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type DeleteCattleDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 牛削除コマンドの型
 */
export type DeleteCattleInput = {
	cattleId: CattleId;
	ownerUserId: UserId;
};

/**
 * 牛削除結果の型
 */
export type DeleteCattleResult = {
	message: string;
};

/**
 * 牛削除ユースケースの関数型定義
 */
export type DeleteCattleUseCase = (
	deps: DeleteCattleDeps
) => (
	input: DeleteCattleInput
) => Promise<Result<DeleteCattleResult, CattleError>>;

/**
 * 牛削除ユースケース
 *
 * 指定された牛を削除します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const deleteCattleUseCase: DeleteCattleUseCase =
	(deps: DeleteCattleDeps) =>
	async (
		input: DeleteCattleInput
	): Promise<Result<DeleteCattleResult, CattleError>> => {
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
					message: "この牛の削除権限がありません"
				});
			}

			// 削除の実行
			const deleteResult = await deps.cattleRepo.delete(input.cattleId);
			if (!deleteResult.ok) {
				return deleteResult;
			}

			return ok({
				message: "牛が正常に削除されました"
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to delete cattle",
				cause
			});
		}
	};

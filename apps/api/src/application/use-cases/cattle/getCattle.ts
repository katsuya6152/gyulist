/**
 * Get Cattle Use Case
 *
 * 牛の詳細取得ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { Cattle } from "../../../domain/types/cattle";
import type { CattleId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetCattleDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 取得コマンドの型
 */
export type GetCattleInput = {
	cattleId: CattleId;
};

/**
 * 牛取得ユースケースの関数型定義
 */
export type GetCattleUseCase = (
	deps: GetCattleDeps
) => (input: GetCattleInput) => Promise<Result<Cattle, CattleError>>;

/**
 * 牛の詳細取得ユースケース
 *
 * 指定されたIDの牛を取得します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は牛エンティティ、失敗時は `CattleError` を含む `Result`
 */
export const getCattleUseCase: GetCattleUseCase =
	(deps) =>
	async (input): Promise<Result<Cattle, CattleError>> => {
		const result = await deps.cattleRepo.findById(input.cattleId);
		if (!result.ok) {
			return result;
		}

		if (!result.value) {
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: input.cattleId,
				message: "指定された牛が見つかりません"
			});
		}

		return ok(result.value);
	};

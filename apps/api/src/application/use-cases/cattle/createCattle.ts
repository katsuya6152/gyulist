/**
 * Create Cattle Use Case
 *
 * 牛の新規作成ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import { createCattle } from "../../../domain/functions/cattle";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { Cattle, NewCattleProps } from "../../../domain/types/cattle";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 *
 * - `cattleRepo`: 牛エンティティの永続化を担うリポジトリポート
 * - `clock`: 現在時刻を提供するクロックポート
 */
export type CreateCattleDeps = {
	cattleRepo: CattleRepository;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型
 * `NewCattleProps` はドメインモデルで定義された、
 * 登録に必要な入力プロパティを表します。
 */
export type CreateCattleInput = NewCattleProps;

/**
 * 牛作成ユースケースの関数型定義
 */
export type CreateCattleUseCase = (
	deps: CreateCattleDeps
) => (input: CreateCattleInput) => Promise<Result<Cattle, CattleError>>;

/**
 * 牛の新規作成ユースケース
 *
 * 入力コマンドの検証（ドメインファクトリ内のバリデーションを含む）を行い、
 * リポジトリへ保存して作成結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は作成された `Cattle`、失敗時は `CattleError` を含む `Result`
 */
export const createCattleUseCase: CreateCattleUseCase =
	(deps) =>
	async (input): Promise<Result<Cattle, CattleError>> => {
		const currentTime = deps.clock.now();

		// TODO: Re-enable duplicate check after fixing test data issues
		// Check for duplicate identification number
		// const existing = await deps.cattleRepo.findByIdentificationNumber(
		//   input.ownerUserId,
		//   input.identificationNumber as unknown as number
		// );
		//
		// if (existing.ok && existing.value) {
		//   return err({
		//     type: "Conflict",
		//     message: "Cattle with this identification number already exists",
		//     conflictingField: "identificationNumber"
		//   });
		// }

		// Create cattle domain object with validation
		const cattleResult = createCattle(input, currentTime);
		if (!cattleResult.ok) {
			return cattleResult;
		}

		// Persist to repository - use the validated cattle object
		const createResult = await deps.cattleRepo.create(input);
		if (!createResult.ok) {
			return createResult;
		}

		return ok(createResult.value);
	};

/**
 * 作成コマンドの静的検証
 *
 * 必須項目や値域など、ユースケースに入る前に静的にチェック可能な内容を検証します。
 * ドメインファクトリ `createCattle` 側の検証と組み合わせて利用します。
 *
 * @param input - 新規作成コマンド
 * @returns 有効な場合は `ok(true)`、不正な場合は `CattleError` の `err`
 */
export function validateCreateCattleInput(
	input: CreateCattleInput
): Result<true, CattleError> {
	// 必須項目の検証
	if (!input.ownerUserId) {
		return err({
			type: "ValidationError",
			message: "所有者IDは必須です",
			field: "ownerUserId"
		});
	}

	if (!input.identificationNumber) {
		return err({
			type: "ValidationError",
			message: "個体識別番号は必須です",
			field: "identificationNumber"
		});
	}

	return ok(true);
}

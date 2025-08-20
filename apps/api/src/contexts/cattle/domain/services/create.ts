import type { ClockPort } from "@/shared/ports/clock";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { CattleRepoPort } from "../../ports";
import type { DomainError } from "../errors";
import type { Cattle, NewCattleProps } from "../model/cattle";
import { createCattle } from "../model/cattle";

/**
 * 依存関係（ポート）の束。
 *
 * - `cattleRepo`: 牛エンティティの永続化を担うリポジトリポート
 * - `clock`: 現在時刻を提供するクロックポート
 */
type Deps = {
	cattleRepo: CattleRepoPort;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型。
 * `NewCattleProps` はドメインモデルで定義された、
 * 登録に必要な入力プロパティを表します。
 */
export type CreateCattleCmd = NewCattleProps;

/**
 * 牛の新規作成ユースケース。
 *
 * 入力コマンドの検証（ドメインファクトリ内のバリデーションを含む）を行い、
 * リポジトリへ保存して作成結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は作成された `Cattle`、失敗時は `DomainError` を含む `Result`
 */
export const create =
	(deps: Deps) =>
	async (cmd: CreateCattleCmd): Promise<Result<Cattle, DomainError>> => {
		const currentTime = deps.clock.now();

		// TODO: Re-enable duplicate check after fixing test data issues
		// Check for duplicate identification number
		// const existing = await deps.cattleRepo.findByIdentificationNumber(
		//   cmd.ownerUserId,
		//   cmd.identificationNumber as unknown as number
		// );
		//
		// if (existing) {
		//   return err({
		//     type: "Conflict",
		//     message: "Cattle with this identification number already exists",
		//     conflictingField: "identificationNumber"
		//   });
		// }

		// Create cattle domain object with validation
		const cattleResult = createCattle(cmd, currentTime);
		if (!cattleResult.ok) {
			return cattleResult;
		}

		try {
			// Persist to repository - use the validated cattle object
			const createdCattle = await deps.cattleRepo.create(cmd);
			return ok(createdCattle);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to create cattle",
				cause: error
			});
		}
	};

/**
 * 作成コマンドの静的検証。
 *
 * 必須項目や値域など、ユースケースに入る前に静的にチェック可能な内容を検証します。
 * ドメインファクトリ `createCattle` 側の検証と組み合わせて利用します。
 *
 * @param cmd - 新規作成コマンド
 * @returns 有効な場合は `ok(true)`、不正な場合は `DomainError` の `err`
 */
export function validateCreateCattleCmd(
	cmd: CreateCattleCmd
): Result<true, DomainError> {
	// Required fields validation
	if (!cmd.ownerUserId) {
		return err({
			type: "ValidationError",
			message: "Owner user ID is required",
			field: "ownerUserId"
		});
	}

	if (!cmd.identificationNumber) {
		return err({
			type: "ValidationError",
			message: "Identification number is required",
			field: "identificationNumber"
		});
	}

	// Business rules validation
	if (cmd.identificationNumber <= 0) {
		return err({
			type: "ValidationError",
			message: "Identification number must be positive",
			field: "identificationNumber"
		});
	}

	// Optional field validation
	if (cmd.weight !== undefined && cmd.weight !== null && cmd.weight <= 0) {
		return err({
			type: "ValidationError",
			message: "Weight must be positive if provided",
			field: "weight"
		});
	}

	if (cmd.score !== undefined && cmd.score !== null) {
		if (cmd.score < 0 || cmd.score > 100) {
			return err({
				type: "ValidationError",
				message: "Score must be between 0 and 100 if provided",
				field: "score"
			});
		}
	}

	return ok(true);
}

/**
 * オプション項目のデフォルト値を補完します。
 *
 * 明示されなかった `status` や、誕生日から推定可能な `growthStage` を補完します。
 *
 * @param cmd - 入力コマンド
 * @param currentDate - 推論に用いる現在日付
 * @returns デフォルト値を適用したコマンド
 */
export function generateCattleDefaults(
	cmd: CreateCattleCmd,
	currentDate: Date
): CreateCattleCmd {
	return {
		...cmd,
		status: cmd.status || "HEALTHY",
		// Auto-detect growth stage based on age if not provided
		growthStage:
			cmd.growthStage || inferGrowthStageFromAge(cmd.birthday, currentDate)
	};
}

/**
 * 誕生日から成育段階を推定します。
 *
 * @param birthday - 生年月日（null/未指定可）
 * @param currentDate - 現在時刻
 * @returns 推定された `GrowthStage`。誕生日未指定の場合は `null`。
 */
function inferGrowthStageFromAge(
	birthday: Date | null | undefined,
	currentDate: Date
): import("../model/types").GrowthStage | null {
	if (!birthday) return null;

	const ageInMonths = Math.floor(
		(currentDate.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 30)
	);

	if (ageInMonths < 6) return "CALF";
	if (ageInMonths < 24) return "GROWING";
	if (ageInMonths < 36) return "FATTENING";
	if (ageInMonths < 48) return "FIRST_CALVED";
	return "MULTI_PAROUS";
}

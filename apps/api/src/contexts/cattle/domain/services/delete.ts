import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type {
	BloodlineRepoPort,
	BreedingRepoPort,
	MotherInfoRepoPort
} from "../../../breeding/ports";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";

/**
 * 牛削除の依存関係。
 */
type Deps = {
	/** 牛リポジトリ */ repo: CattleRepoPort;
	/** 繁殖リポジトリ（オプション） */ breedingRepo?: BreedingRepoPort;
	/** 血統リポジトリ（オプション） */ bloodlineRepo?: BloodlineRepoPort;
	/** 母牛情報リポジトリ（オプション） */ motherInfoRepo?: MotherInfoRepoPort;
};

/**
 * 牛削除コマンド。
 *
 * 牛を削除する際に必要な情報を定義します。
 */
export type DeleteCattleCmd = {
	/** リクエスト元ユーザーID */ requesterUserId: UserId;
	/** 牛ID */ id: CattleId;
};

/**
 * 牛削除ユースケース。
 *
 * 牛の削除を実行します。所有者権限をチェックし、
 * 関連する繁殖、血統、母牛情報も含めて削除します。
 *
 * @param deps - 依存関係
 * @param cmd - 牛削除コマンド
 * @returns 成功時はvoid、失敗時はドメインエラー
 */
export const remove =
	(deps: Deps) =>
	async (cmd: DeleteCattleCmd): Promise<Result<void, DomainError>> => {
		const current = await deps.repo.findById(cmd.id);
		if (!current)
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: cmd.id as unknown as number
			});
		if (
			(current.ownerUserId as unknown as number) !==
			(cmd.requesterUserId as unknown as number)
		) {
			return err({ type: "Forbidden", message: "You do not own this cattle" });
		}
		// Orchestrate cross-context deletes first when available (Hex):
		await deps.breedingRepo?.delete(cmd.id);
		await deps.bloodlineRepo?.delete(cmd.id);
		await deps.motherInfoRepo?.delete(cmd.id);
		await deps.repo.delete(cmd.id);
		return ok(undefined);
	};

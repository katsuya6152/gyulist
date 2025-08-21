import type { CattleId, UserId } from "@/shared/brand";
import type { ClockPort } from "@/shared/ports/clock";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";

/**
 * 牛ステータス更新の依存関係。
 */
type Deps = {
	/** 牛リポジトリ */ repo: CattleRepoPort;
	/** クロック */ clock: ClockPort;
};

/**
 * 牛ステータス更新コマンド。
 *
 * 牛のステータスを更新する際に必要な情報を定義します。
 */
export type UpdateStatusCmd = {
	/** リクエスト元ユーザーID */ requesterUserId: UserId;
	/** 牛ID */ id: CattleId;
	/** 新しいステータス */ newStatus: NonNullable<Cattle["status"]>;
	/** 変更理由（オプション） */ reason?: string | null;
};

/**
 * 牛ステータス更新ユースケース。
 *
 * 牛のステータスを更新し、ステータス変更履歴を記録します。
 * 所有者権限をチェックし、変更理由も記録されます。
 *
 * @param deps - 依存関係
 * @param cmd - 牛ステータス更新コマンド
 * @returns 成功時は更新された牛情報、失敗時はドメインエラー
 */
export const updateStatus =
	(deps: Deps) =>
	async (cmd: UpdateStatusCmd): Promise<Result<Cattle, DomainError>> => {
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
		const updated = await deps.repo.update(cmd.id, {
			status: cmd.newStatus
		});
		await deps.repo.appendStatusHistory({
			cattleId: cmd.id,
			oldStatus: current.status ?? null,
			newStatus: cmd.newStatus,
			changedBy: cmd.requesterUserId,
			reason: cmd.reason ?? null
		});
		return ok(updated);
	};

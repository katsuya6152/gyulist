import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleId, Event, EventsRepoPort, UserId } from "../../ports";
import type { DomainError } from "../errors";

/**
 * イベント一覧取得の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * 牛IDでイベント一覧を取得するユースケース。
 *
 * 指定された牛のすべてのイベントを取得します。
 * 所有者の権限チェックはリポジトリ層で行われます。
 *
 * @param deps - 依存関係
 * @param cattleId - 牛ID
 * @param ownerUserId - 所有者ユーザーID
 * @returns 成功時はイベント一覧、失敗時はドメインエラー
 */
export const listByCattle =
	(deps: Deps) =>
	async (
		cattleId: CattleId,
		ownerUserId: UserId
	): Promise<Result<Event[], DomainError>> => {
		try {
			const rows = await deps.repo.listByCattleId(cattleId, ownerUserId);
			return ok(rows);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to list events by cattle",
				cause
			});
		}
	};

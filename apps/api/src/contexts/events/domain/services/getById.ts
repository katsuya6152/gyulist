import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Event, EventId, EventsRepoPort, UserId } from "../../ports";
import type { DomainError } from "../errors";

/**
 * イベント取得の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * イベント詳細取得ユースケース。
 *
 * IDでイベントを取得し、所有者の権限チェックを行います。
 * 見つからない場合はNotFoundエラーを返します。
 *
 * @param deps - 依存関係
 * @param id - イベントID
 * @param ownerUserId - 所有者ユーザーID
 * @returns 成功時はイベント詳細、失敗時はドメインエラー
 */
export const getById =
	(deps: Deps) =>
	async (
		id: EventId,
		ownerUserId: UserId
	): Promise<Result<Event, DomainError>> => {
		try {
			const found = await deps.repo.findById(id, ownerUserId);
			if (!found) {
				return err({
					type: "NotFound",
					entity: "Event",
					id: id as unknown as number
				});
			}
			return ok(found);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to find event by id",
				cause
			});
		}
	};

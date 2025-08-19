import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
import type { CattleId, UserId } from "../../../events/ports";
import type { SearchEventsInput } from "../codecs/input";
import type { DomainError } from "../errors";

/**
 * イベント検索の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * イベント検索ユースケース。
 *
 * 条件に基づいてイベントを検索し、ページング対応の結果を返します。
 * 牛ID、イベントタイプ、日付範囲などでフィルタリング可能です。
 *
 * @param deps - 依存関係
 * @param ownerUserId - 所有者ユーザーID
 * @param q - 検索条件
 * @returns 成功時は検索結果、失敗時はドメインエラー
 */
export const search =
	(deps: Deps) =>
	async (
		ownerUserId: UserId,
		q: SearchEventsInput
	): Promise<
		Result<Awaited<ReturnType<EventsRepoPort["search"]>>, DomainError>
	> => {
		try {
			const res = await deps.repo.search({
				ownerUserId,
				cattleId: q.cattleId as unknown as CattleId | undefined,
				eventType: q.eventType,
				startDate: q.startDate,
				endDate: q.endDate,
				cursor: q.cursor ?? null,
				limit: q.limit
			});
			return ok(res);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to search events",
				cause
			});
		}
	};

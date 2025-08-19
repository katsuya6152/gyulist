import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Event, EventId, EventsRepoPort } from "../../../events/ports";
import type { UpdateEventInput } from "../codecs/input";
import type { DomainError } from "../errors";

/**
 * イベント更新の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * イベント更新ユースケース。
 *
 * 既存のイベントを更新し、更新日時を自動的に設定します。
 * 部分的な更新が可能で、指定されていないフィールドは既存の値が保持されます。
 *
 * @param deps - 依存関係
 * @param id - イベントID
 * @param input - 更新データ
 * @returns 成功時は更新されたイベント、失敗時はドメインエラー
 */
export const update =
	(deps: Deps) =>
	async (
		id: EventId,
		input: UpdateEventInput
	): Promise<Result<Event, DomainError>> => {
		try {
			const updated = await deps.repo.update(id, {
				...(input as Partial<Event>),
				updatedAt: new Date().toISOString()
			});
			return ok(updated);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to update event",
				cause
			});
		}
	};

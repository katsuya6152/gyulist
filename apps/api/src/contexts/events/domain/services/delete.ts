import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventId, EventsRepoPort } from "../../../events/ports";
import type { DomainError } from "../errors";

/**
 * イベント削除の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * イベント削除ユースケース。
 *
 * 指定されたイベントを削除します。
 * 削除は物理削除として実装されており、削除後は復元できません。
 *
 * @param deps - 依存関係
 * @param id - イベントID
 * @returns 成功時は削除完了、失敗時はドメインエラー
 */
export const remove =
	(deps: Deps) =>
	async (id: EventId): Promise<Result<{ success: true }, DomainError>> => {
		try {
			await deps.repo.delete(id);
			return ok({ success: true });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to delete event",
				cause
			});
		}
	};

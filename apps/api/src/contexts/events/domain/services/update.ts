import type { Event, EventId, EventsRepoPort } from "@/contexts/events/ports";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
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
			// 入力データをドメインモデルに変換
			const updateData: Partial<Event> = {
				updatedAt: new Date()
			} as Partial<Event>;

			// 各フィールドを安全に設定
			if (input.eventType !== undefined) {
				(
					updateData as Partial<Event> & { eventType?: Event["eventType"] }
				).eventType = input.eventType;
			}
			if (input.notes !== undefined) {
				(updateData as Partial<Event> & { notes?: string | null }).notes =
					input.notes;
			}
			if (input.eventDatetime && input.eventDatetime.trim() !== "") {
				(
					updateData as Partial<Event> & { eventDatetime?: Date }
				).eventDatetime = new Date(input.eventDatetime);
			}

			const updated = await deps.repo.update(id, updateData);
			return ok(updated);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to update event",
				cause
			});
		}
	};

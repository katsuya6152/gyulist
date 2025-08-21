import type { EventsRepoPort } from "@/contexts/events/ports";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { CreateEventInput } from "../codecs/input";
import type { DomainError } from "../errors";
import type { Event, NewEventProps } from "../model";
import { createEvent } from "../model";

/**
 * イベント作成の依存関係。
 */
type Deps = {
	/** イベントリポジトリ */ repo: EventsRepoPort;
};

/**
 * イベント作成ユースケース。
 *
 * 新しいイベントを作成し、リポジトリに保存します。
 * 作成日時と更新日時は自動的に設定されます。
 *
 * @param deps - 依存関係
 * @returns 成功時は作成されたイベント、失敗時はドメインエラー
 */
export const create =
	(deps: Deps) =>
	async (input: CreateEventInput): Promise<Result<Event, DomainError>> => {
		try {
			// ドメインモデルを使用してイベントを作成
			const eventProps: NewEventProps = {
				cattleId: input.cattleId as unknown as Event["cattleId"],
				eventType: input.eventType as Event["eventType"],
				eventDatetime: new Date(input.eventDatetime),
				notes: input.notes ?? null
			};

			const eventResult = createEvent(eventProps, new Date());
			if (!eventResult.ok) return eventResult;

			// リポジトリに保存
			const created = await deps.repo.create({
				cattleId: eventResult.value.cattleId,
				eventType: eventResult.value.eventType,
				eventDatetime: eventResult.value.eventDatetime,
				notes: eventResult.value.notes
			});

			return ok(created);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to create event",
				cause
			});
		}
	};

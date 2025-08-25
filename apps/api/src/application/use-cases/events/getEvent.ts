/**
 * Get Event Use Case
 *
 * イベントの詳細取得ユースケース
 */

import type { EventError } from "../../../domain/errors/events/EventErrors";
import type { EventRepository } from "../../../domain/ports/events";
import type { Event } from "../../../domain/types/events";
import type { EventId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetEventDeps = {
	eventRepo: EventRepository;
};

/**
 * 取得コマンドの型
 */
export type GetEventInput = {
	eventId: EventId;
	requestingUserId: UserId;
};

/**
 * イベント取得ユースケースの関数型定義
 */
export type GetEventUseCase = (
	deps: GetEventDeps
) => (input: GetEventInput) => Promise<Result<Event, EventError>>;

/**
 * イベントの詳細取得ユースケース
 *
 * 指定されたIDのイベントを取得します。
 * 所有者チェックも実行されます。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const getEventUseCase: GetEventUseCase =
	(deps: GetEventDeps) =>
	async (input: GetEventInput): Promise<Result<Event, EventError>> => {
		try {
			const result = await deps.eventRepo.findById(
				input.eventId,
				input.requestingUserId
			);

			if (!result.ok) return result;

			if (!result.value) {
				return err({
					type: "NotFound",
					entity: "Event",
					id: input.eventId,
					message: "Event not found"
				});
			}

			return ok(result.value);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to get event",
				cause
			});
		}
	};

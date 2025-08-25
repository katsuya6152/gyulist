/**
 * Create Event Use Case
 *
 * イベントの新規作成ユースケース
 */

import type { EventError } from "../../../domain/errors/events/EventErrors";
import { createEvent } from "../../../domain/functions/events";
import type { EventRepository } from "../../../domain/ports/events";
import type { Event, NewEventProps } from "../../../domain/types/events";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 *
 * - `eventRepo`: イベントエンティティの永続化を担うリポジトリポート
 * - `clock`: 現在時刻を提供するクロックポート
 */
export type CreateEventDeps = {
	eventRepo: EventRepository;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型
 * `NewEventProps` はドメインモデルで定義された、
 * 登録に必要な入力プロパティを表します。
 */
export type CreateEventInput = NewEventProps;

/**
 * イベント作成ユースケースの関数型定義
 */
export type CreateEventUseCase = (
	deps: CreateEventDeps
) => (input: CreateEventInput) => Promise<Result<Event, EventError>>;

/**
 * イベントの新規作成ユースケース
 *
 * 新しいイベントを作成し、リポジトリに保存します。
 * ドメインルールに基づくバリデーションを実行し、
 * 作成日時と更新日時は自動的に設定されます。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 *
 * @example
 * ```typescript
 * const result = await createEventUseCase(deps)({
 *   cattleId: 123 as CattleId,
 *   eventType: "INSEMINATION",
 *   eventDatetime: new Date("2024-01-15"),
 *   notes: "人工授精実施"
 * });
 *
 * if (result.ok) {
 *   console.log("作成されたイベント:", result.value);
 * } else {
 *   console.error("エラー:", result.error);
 * }
 * ```
 */
export const createEventUseCase: CreateEventUseCase =
	(deps: CreateEventDeps) =>
	async (input: CreateEventInput): Promise<Result<Event, EventError>> => {
		try {
			const currentTime = deps.clock.now();

			// ドメインモデルを使用してイベントを作成・バリデーション
			const eventResult = createEvent(input, currentTime);
			if (!eventResult.ok) return eventResult;

			// リポジトリに保存
			const saveResult = await deps.eventRepo.create({
				cattleId: eventResult.value.cattleId,
				eventType: eventResult.value.eventType,
				eventDatetime: eventResult.value.eventDatetime,
				notes: eventResult.value.notes
			});

			return saveResult;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create event",
				cause
			});
		}
	};

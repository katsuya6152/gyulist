/**
 * Search Events Use Case
 *
 * イベントの検索・一覧取得ユースケース
 */

import type { EventError } from "../../../domain/errors/events/EventErrors";
import type { EventRepository } from "../../../domain/ports/events";
import type {
	EventSearchCriteria,
	EventSearchResult
} from "../../../domain/types/events";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type SearchEventsDeps = {
	eventRepo: EventRepository;
};

/**
 * 検索コマンドの型
 */
export type SearchEventsInput = EventSearchCriteria;

/**
 * イベント検索ユースケースの関数型定義
 */
export type SearchEventsUseCase = (
	deps: SearchEventsDeps
) => (
	input: SearchEventsInput
) => Promise<Result<EventSearchResult, EventError>>;

/**
 * イベントの検索・一覧取得ユースケース
 *
 * 指定された条件でイベントを検索し、ページング対応の結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const searchEventsUseCase: SearchEventsUseCase =
	(deps: SearchEventsDeps) =>
	async (
		input: SearchEventsInput
	): Promise<Result<EventSearchResult, EventError>> => {
		try {
			// 検索条件の正規化
			const normalizedCriteria: EventSearchCriteria = {
				...input,
				limit: Math.min(100, Math.max(1, input.limit || 20)) // 1-100の範囲で制限
			};

			const result = await deps.eventRepo.search(normalizedCriteria);
			return result;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to search events",
				cause
			});
		}
	};

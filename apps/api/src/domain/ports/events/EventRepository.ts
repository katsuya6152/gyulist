/**
 * Event Repository Port
 *
 * イベント管理ドメインのリポジトリインターフェース定義
 */

import type { CattleId, EventId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { EventError } from "../../errors/events/EventErrors";
import type {
	Event,
	EventSearchCriteria,
	EventSearchResult,
	NewEventProps
} from "../../types/events";

/**
 * イベントエンティティのリポジトリポート
 *
 * 永続化、検索、集計、履歴管理などの操作を提供します。
 * 実装はインフラ層（DB等）に委譲されます。
 */
export interface EventRepository {
	// Basic CRUD operations
	/**
	 * IDでイベントを取得します。
	 * @param eventId - イベントID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 見つからない場合は null
	 */
	findById(
		eventId: EventId,
		ownerUserId: UserId
	): Promise<Result<Event | null, EventError>>;

	/**
	 * 牛IDでイベント一覧を取得します。
	 * @param cattleId - 牛ID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns イベント一覧
	 */
	listByCattleId(
		cattleId: CattleId,
		ownerUserId: UserId
	): Promise<Result<Event[], EventError>>;

	/**
	 * 条件検索を行います（ページング対応）。
	 * @param criteria - 検索条件
	 * @returns 検索結果とページング情報
	 */
	search(
		criteria: EventSearchCriteria
	): Promise<Result<EventSearchResult, EventError>>;

	/**
	 * 新規イベントを作成します。
	 * @param event - イベントエンティティ（IDなし）
	 * @returns 作成されたイベント
	 */
	create(
		event: Omit<Event, "eventId" | "createdAt" | "updatedAt">
	): Promise<Result<Event, EventError>>;

	/**
	 * イベントを更新します。
	 * @param eventId - イベントID
	 * @param updates - 更新データ
	 * @param ownerUserId - 所有者ユーザーID（権限チェック用）
	 * @returns 更新されたイベント
	 */
	update(
		eventId: EventId,
		updates: Partial<Event>,
		ownerUserId: UserId
	): Promise<Result<Event, EventError>>;

	/**
	 * イベントを削除します。
	 * @param eventId - イベントID
	 * @param ownerUserId - 所有者ユーザーID（権限チェック用）
	 */
	delete(
		eventId: EventId,
		ownerUserId: UserId
	): Promise<Result<void, EventError>>;

	// Specialized queries
	/**
	 * 指定期間内のイベントを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param startDate - 開始日
	 * @param endDate - 終了日
	 * @param eventTypes - イベントタイプフィルタ（オプション）
	 * @returns イベント一覧
	 */
	findByDateRange(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date,
		eventTypes?: string[]
	): Promise<Result<Event[], EventError>>;

	/**
	 * 最近のイベントを取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param limit - 取得件数
	 * @returns 最近のイベント一覧
	 */
	findRecent(
		ownerUserId: UserId,
		limit: number
	): Promise<Result<Event[], EventError>>;

	/**
	 * 予定イベントを取得します（未来のイベント）。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param limit - 取得件数
	 * @returns 予定イベント一覧
	 */
	findUpcoming(
		ownerUserId: UserId,
		limit: number
	): Promise<Result<Event[], EventError>>;

	/**
	 * イベント統計を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param startDate - 集計開始日
	 * @param endDate - 集計終了日
	 * @returns イベント統計
	 */
	getEventStats(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date
	): Promise<Result<EventStats, EventError>>;
}

/**
 * イベント統計の型定義
 */
export type EventStats = {
	totalEvents: number;
	eventsByType: Record<string, number>;
	eventsByMonth: Array<{
		month: string;
		count: number;
	}>;
	criticalEventsCount: number;
	upcomingEventsCount: number;
};

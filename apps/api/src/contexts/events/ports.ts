import type { Brand } from "../../shared/brand";
import type { Event, EventType } from "./domain/model";

/**
 * イベントIDのブランド型。
 */
export type EventId = Brand<number, "EventId">;

/**
 * 牛IDのブランド型。
 */
export type CattleId = Brand<number, "CattleId">;

/**
 * ユーザーIDのブランド型。
 */
export type UserId = Brand<number, "UserId">;

// Event型とEventType型はdomain/modelから再エクスポート
export type { Event, EventType };

/**
 * イベントリポジトリポート。
 *
 * イベントの永続化、検索、更新などの操作を提供します。
 */
export interface EventsRepoPort {
	/**
	 * IDでイベントを取得します。
	 * @param eventId - イベントID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 見つからない場合は null
	 */
	findById(eventId: EventId, ownerUserId: UserId): Promise<Event | null>;

	/**
	 * 牛IDでイベント一覧を取得します。
	 * @param cattleId - 牛ID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns イベント一覧
	 */
	listByCattleId(cattleId: CattleId, ownerUserId: UserId): Promise<Event[]>;

	/**
	 * 条件検索を行います（ページング対応）。
	 * @param q - 検索条件
	 * @returns 検索結果とページング情報
	 */
	search(q: {
		/** 所有者ユーザーID */ ownerUserId: UserId;
		/** 牛IDフィルタ */ cattleId?: CattleId;
		/** イベントタイプフィルタ */ eventType?: EventType;
		/** 開始日 */ startDate?: string;
		/** 終了日 */ endDate?: string;
		/** カーソル */ cursor?: number | null;
		/** 取得件数 */ limit: number;
	}): Promise<{
		/** 検索結果 */ results: Event[];
		/** 次ページカーソル */ nextCursor: number | null;
		/** 次ページ有無 */ hasNext: boolean;
	}>;

	/**
	 * 新規イベントを作成します。
	 * @param dto - イベントデータ
	 * @returns 作成されたイベント
	 */
	create(
		dto: Omit<Event, "eventId" | "createdAt" | "updatedAt">
	): Promise<Event>;

	/**
	 * イベントを更新します。
	 * @param eventId - イベントID
	 * @param partial - 更新データ
	 * @returns 更新されたイベント
	 */
	update(eventId: EventId, partial: Partial<Event>): Promise<Event>;

	/**
	 * イベントを削除します。
	 * @param eventId - イベントID
	 */
	delete(eventId: EventId): Promise<void>;
}

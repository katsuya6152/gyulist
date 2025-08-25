/**
 * Event Domain Entity
 *
 * イベントエンティティの定義
 */

import type { CattleId, EventId, UserId } from "../../../shared/brand";
import type { EventType } from "./EventTypes";

/**
 * イベントエンティティ
 *
 * 牛のライフサイクルにおける各種イベントを管理します。
 * 以下の特徴を持ちます：
 *
 * - 不変性（Immutability）: すべてのプロパティがreadonly
 * - ドメインルール: ビジネスルールに基づくバリデーション
 * - 値オブジェクト: 日時、メモなどの値の整合性を保証
 */
export type Event = Readonly<{
	// 識別子
	eventId: EventId;
	cattleId: CattleId;

	// イベント情報
	eventType: EventType;
	eventDatetime: Date;
	notes: string | null;

	// システム管理情報
	createdAt: Date;
	updatedAt: Date;

	// 結合時の追加情報（読み取り専用）
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
}>;

/**
 * 新規イベント作成時のプロパティ
 */
export type NewEventProps = {
	cattleId: CattleId;
	eventType: EventType;
	eventDatetime: Date;
	notes?: string | null;
};

/**
 * イベント更新時のプロパティ
 */
export type UpdateEventProps = {
	eventType?: EventType;
	eventDatetime?: Date;
	notes?: string | null;
};

/**
 * イベント検索条件
 */
export type EventSearchCriteria = {
	ownerUserId: UserId;
	cattleId?: CattleId;
	eventType?: EventType;
	startDate?: string;
	endDate?: string;
	cursor?: number | null;
	limit: number;
};

/**
 * イベント検索結果
 */
export type EventSearchResult = {
	results: Event[];
	nextCursor: number | null;
	hasNext: boolean;
};

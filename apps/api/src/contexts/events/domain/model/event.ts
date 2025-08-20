/**
 * イベント管理ドメイン - イベントエンティティの定義
 *
 * このファイルは、牛のライフサイクルにおける各種イベントを管理する
 * エンティティを定義しています。繁殖、健康管理、計測などの
 * イベントを統一的に管理し、ドメインルールに基づく
 * バリデーションとビジネスロジックを提供します。
 */

import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { CattleId, EventId, EventType, UserId } from "../../ports";
import type { DomainError } from "../errors";

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
export type Event = {
	// 識別子
	readonly eventId: EventId;
	readonly cattleId: CattleId;

	// イベント情報
	readonly eventType: EventType;
	readonly eventDatetime: Date;
	readonly notes: string | null;

	// システム管理情報
	readonly createdAt: Date;
	readonly updatedAt: Date;

	// 結合時の追加情報（読み取り専用）
	readonly cattleName?: string | null;
	readonly cattleEarTagNumber?: number | null;
};

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
 * イベント作成ファクトリ
 *
 * 新規イベントを作成し、ドメインルールに基づく
 * バリデーションを実行します。
 *
 * @param props - 新規イベントのプロパティ
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたイベント、失敗時はドメインエラー
 */
export function createEvent(
	props: NewEventProps,
	currentTime: Date
): Result<Event, DomainError> {
	// バリデーション
	const validation = validateEventProps(props);
	if (!validation.ok) return validation;

	// イベント作成
	const event: Event = {
		eventId: 0 as EventId, // データベースで自動生成
		cattleId: props.cattleId,
		eventType: props.eventType,
		eventDatetime: props.eventDatetime,
		notes: props.notes ?? null,
		createdAt: currentTime,
		updatedAt: currentTime
	};

	return ok(event);
}

/**
 * イベント更新ファクトリ
 *
 * 既存のイベントを更新し、ドメインルールに基づく
 * バリデーションを実行します。
 *
 * @param current - 現在のイベント
 * @param updates - 更新データ
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたイベント、失敗時はドメインエラー
 */
export function updateEvent(
	current: Event,
	updates: UpdateEventProps,
	currentTime: Date
): Result<Event, DomainError> {
	// バリデーション
	const validation = validateUpdateProps(updates);
	if (!validation.ok) return validation;

	// イベント更新
	const updatedEvent: Event = {
		...current,
		...updates,
		updatedAt: currentTime
	};

	return ok(updatedEvent);
}

/**
 * イベントプロパティのバリデーション
 */
function validateEventProps(props: NewEventProps): Result<true, DomainError> {
	// 必須項目チェック
	if (!props.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (!props.eventType) {
		return err({
			type: "ValidationError",
			message: "Event type is required",
			field: "eventType"
		});
	}

	if (!props.eventDatetime) {
		return err({
			type: "ValidationError",
			message: "Event datetime is required",
			field: "eventDatetime"
		});
	}

	// 日時の妥当性チェック
	if (props.eventDatetime > new Date()) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be in the future",
			field: "eventDatetime"
		});
	}

	// メモの長さチェック
	if (props.notes && props.notes.length > 1000) {
		return err({
			type: "ValidationError",
			message: "Notes cannot exceed 1000 characters",
			field: "notes"
		});
	}

	return ok(true);
}

/**
 * 更新プロパティのバリデーション
 */
function validateUpdateProps(
	updates: UpdateEventProps
): Result<true, DomainError> {
	// 日時の妥当性チェック
	if (updates.eventDatetime && updates.eventDatetime > new Date()) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be in the future",
			field: "eventDatetime"
		});
	}

	// メモの長さチェック
	if (updates.notes && updates.notes.length > 1000) {
		return err({
			type: "ValidationError",
			message: "Notes cannot exceed 1000 characters",
			field: "notes"
		});
	}

	return ok(true);
}

/**
 * イベントのドメインルール
 */
export const EventRules = {
	/**
	 * イベントが過去のものかチェック
	 */
	isPastEvent(event: Event): boolean {
		return event.eventDatetime < new Date();
	},

	/**
	 * イベントが未来のものかチェック
	 */
	isFutureEvent(event: Event): boolean {
		return event.eventDatetime > new Date();
	},

	/**
	 * イベントが今日のものかチェック
	 */
	isTodayEvent(event: Event): boolean {
		const today = new Date();
		const eventDate = new Date(event.eventDatetime);
		return (
			eventDate.getFullYear() === today.getFullYear() &&
			eventDate.getMonth() === today.getMonth() &&
			eventDate.getDate() === today.getDate()
		);
	},

	/**
	 * イベントが指定期間内にあるかチェック
	 */
	isEventInPeriod(event: Event, startDate: Date, endDate: Date): boolean {
		const eventDate = new Date(event.eventDatetime);
		return eventDate >= startDate && eventDate <= endDate;
	}
};

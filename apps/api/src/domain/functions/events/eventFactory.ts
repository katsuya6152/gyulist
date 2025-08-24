/**
 * Event Factory Functions
 *
 * イベントエンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { EventId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { EventError } from "../../errors/events/EventErrors";
import type {
	Event,
	NewEventProps,
	UpdateEventProps
} from "../../types/events";
import {
	normalizeNotes,
	validateNewEventProps,
	validateUpdateEventProps
} from "./eventValidation";

/**
 * イベントエンティティのファクトリー関数
 *
 * 新規イベントの作成を行い、ドメインルールに基づくバリデーションを実行します。
 * 以下の特徴を持ちます：
 *
 * - 純粋関数: 副作用なし、同じ入力に対して同じ出力
 * - ドメインルール: ビジネスルールに基づく検証
 * - データ正規化: 入力データの適切な正規化
 *
 * @param props - 新規イベントのプロパティ
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたイベント、失敗時はドメインエラー
 */
export function createEvent(
	props: NewEventProps,
	currentTime: Date
): Result<Event, EventError> {
	// バリデーション
	const validation = validateNewEventProps(props);
	if (!validation.ok) return validation;

	// イベント作成
	const event: Event = {
		eventId: 0 as EventId, // データベースで自動生成
		cattleId: props.cattleId,
		eventType: props.eventType,
		eventDatetime: props.eventDatetime,
		notes: normalizeNotes(props.notes),
		createdAt: currentTime,
		updatedAt: currentTime
	};

	return ok(event);
}

/**
 * イベント更新ファクトリー関数
 *
 * 既存のイベントを更新し、ドメインルールに基づくバリデーションを実行します。
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
): Result<Event, EventError> {
	// バリデーション
	const validation = validateUpdateEventProps(updates);
	if (!validation.ok) return validation;

	// イベント更新
	const updatedEvent: Event = {
		...current,
		...(updates.eventType !== undefined && { eventType: updates.eventType }),
		...(updates.eventDatetime !== undefined && {
			eventDatetime: updates.eventDatetime
		}),
		...(updates.notes !== undefined && {
			notes: normalizeNotes(updates.notes)
		}),
		updatedAt: currentTime
	};

	return ok(updatedEvent);
}

/**
 * イベントのドメインルール
 */
export const EventRules = {
	/**
	 * イベントが過去のものかチェック
	 */
	isPastEvent(event: Event, referenceTime?: Date): boolean {
		const reference = referenceTime || new Date();
		return event.eventDatetime < reference;
	},

	/**
	 * イベントが未来のものかチェック
	 */
	isFutureEvent(event: Event, referenceTime?: Date): boolean {
		const reference = referenceTime || new Date();
		return event.eventDatetime > reference;
	},

	/**
	 * イベントが今日のものかチェック
	 */
	isTodayEvent(event: Event, referenceTime?: Date): boolean {
		const reference = referenceTime || new Date();
		const eventDate = new Date(event.eventDatetime);
		return (
			eventDate.getFullYear() === reference.getFullYear() &&
			eventDate.getMonth() === reference.getMonth() &&
			eventDate.getDate() === reference.getDate()
		);
	},

	/**
	 * イベントが指定期間内にあるかチェック
	 */
	isEventInPeriod(event: Event, startDate: Date, endDate: Date): boolean {
		const eventDate = new Date(event.eventDatetime);
		return eventDate >= startDate && eventDate <= endDate;
	},

	/**
	 * 重要なイベントかどうかチェック
	 */
	isCriticalEvent(event: Event): boolean {
		const criticalEventTypes = ["CALVING", "DEATH", "STILLBIRTH"];
		return criticalEventTypes.includes(event.eventType);
	},

	/**
	 * 繁殖関連イベントかどうかチェック
	 */
	isBreedingEvent(event: Event): boolean {
		const breedingEventTypes = [
			"ESTRUS",
			"EXPECTED_ESTRUS",
			"INSEMINATION",
			"PREGNANCY_CHECK",
			"EXPECTED_CALVING"
		];
		return breedingEventTypes.includes(event.eventType);
	},

	/**
	 * 健康管理関連イベントかどうかチェック
	 */
	isHealthEvent(event: Event): boolean {
		const healthEventTypes = [
			"VACCINATION",
			"DIAGNOSIS",
			"MEDICATION",
			"TREATMENT_STARTED",
			"TREATMENT_COMPLETED"
		];
		return healthEventTypes.includes(event.eventType);
	}
};

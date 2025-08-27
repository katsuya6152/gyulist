/**
 * Event Validation Functions
 *
 * イベント管理ドメインのバリデーション関数群
 * 純粋関数として実装され、副作用を持たない
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { EventError } from "../../errors/events/EventErrors";
import type { NewEventProps, UpdateEventProps } from "../../types/events";
import { EVENT_TYPES } from "../../types/events/EventTypes";

/**
 * 新規イベントプロパティのバリデーション
 *
 * @param props - 新規イベントのプロパティ
 * @param currentTime - 現在時刻（オプション）
 * @returns バリデーション結果
 */
export function validateNewEventProps(
	props: NewEventProps,
	currentTime?: Date
): Result<true, EventError> {
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

	// イベントタイプの妥当性チェック
	if (!EVENT_TYPES.includes(props.eventType)) {
		return err({
			type: "ValidationError",
			message: "Invalid event type",
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
	const datetimeValidation = validateEventDatetime(
		props.eventDatetime,
		currentTime
	);
	if (!datetimeValidation.ok) return datetimeValidation;

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
 * イベント更新プロパティのバリデーション
 *
 * @param updates - 更新プロパティ
 * @param currentTime - 現在時刻（オプション）
 * @returns バリデーション結果
 */
export function validateUpdateEventProps(
	updates: UpdateEventProps,
	currentTime?: Date
): Result<true, EventError> {
	// イベントタイプの妥当性チェック（指定されている場合）
	if (updates.eventType && !EVENT_TYPES.includes(updates.eventType)) {
		return err({
			type: "ValidationError",
			message: "Invalid event type",
			field: "eventType"
		});
	}

	// 日時の妥当性チェック（指定されている場合）
	if (updates.eventDatetime) {
		const datetimeValidation = validateEventDatetime(
			updates.eventDatetime,
			currentTime
		);
		if (!datetimeValidation.ok) return datetimeValidation;
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
 * イベント日時のバリデーション
 *
 * @param eventDatetime - イベント日時
 * @param currentTime - 現在時刻（オプション）
 * @returns バリデーション結果
 */
export function validateEventDatetime(
	eventDatetime: Date,
	currentTime?: Date
): Result<true, EventError> {
	const now = currentTime || new Date();

	// 未来すぎる日時のチェック（2年以内）
	const twoYearsFromNow = new Date(now);
	twoYearsFromNow.setFullYear(now.getFullYear() + 2);

	if (eventDatetime > twoYearsFromNow) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be more than 2 years in the future",
			field: "eventDatetime"
		});
	}

	// 過去すぎる日時のチェック（10年以内）
	const tenYearsAgo = new Date();
	tenYearsAgo.setFullYear(now.getFullYear() - 10);

	if (eventDatetime < tenYearsAgo) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be more than 10 years in the past",
			field: "eventDatetime"
		});
	}

	return ok(true);
}

/**
 * メモ文字列の正規化
 *
 * @param notes - メモ文字列
 * @returns 正規化されたメモまたはnull
 */
export function normalizeNotes(
	notes: string | null | undefined
): string | null {
	if (!notes || typeof notes !== "string") return null;

	const trimmed = notes.trim();
	if (trimmed === "") return null;

	return trimmed;
}

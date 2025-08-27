/**
 * Alert Validation Functions
 *
 * アラート管理ドメインのバリデーション関数群
 * 純粋関数として実装され、副作用を持たない
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { AlertError } from "../../errors/alerts/AlertErrors";
import type {
	AlertSeverity,
	AlertStatus,
	NewAlertProps,
	UpdateAlertProps
} from "../../types/alerts";
import {
	ALERT_SEVERITIES,
	ALERT_STATUSES,
	ALERT_TYPES
} from "../../types/alerts/AlertTypes";

/**
 * 新規アラートプロパティのバリデーション
 *
 * @param props - 新規アラートのプロパティ
 * @param currentTime - 現在時刻（オプション）
 * @returns バリデーション結果
 */
export function validateNewAlertProps(
	props: NewAlertProps,
	currentTime?: Date
): Result<true, AlertError> {
	// 必須項目チェック
	if (!props.type) {
		return err({
			type: "ValidationError",
			message: "Alert type is required",
			field: "type"
		});
	}

	if (!props.severity) {
		return err({
			type: "ValidationError",
			message: "Alert severity is required",
			field: "severity"
		});
	}

	if (!props.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (!props.message || props.message.trim() === "") {
		return err({
			type: "ValidationError",
			message: "Alert message is required",
			field: "message"
		});
	}

	if (!props.ownerUserId) {
		return err({
			type: "ValidationError",
			message: "Owner user ID is required",
			field: "ownerUserId"
		});
	}

	// アラートタイプの妥当性チェック
	if (!ALERT_TYPES.includes(props.type)) {
		return err({
			type: "ValidationError",
			message: "Invalid alert type",
			field: "type"
		});
	}

	// 重要度の妥当性チェック
	if (!ALERT_SEVERITIES.includes(props.severity)) {
		return err({
			type: "ValidationError",
			message: "Invalid alert severity",
			field: "severity"
		});
	}

	// メッセージ長のチェック
	if (props.message.length > 500) {
		return err({
			type: "ValidationError",
			message: "Alert message cannot exceed 500 characters",
			field: "message"
		});
	}

	// メモ長のチェック
	if (props.memo && props.memo.length > 1000) {
		return err({
			type: "ValidationError",
			message: "Memo cannot exceed 1000 characters",
			field: "memo"
		});
	}

	// 期限日時のチェック
	if (props.dueAt) {
		const dueAtValidation = validateDueAt(props.dueAt, currentTime);
		if (!dueAtValidation.ok) return dueAtValidation;
	}

	return ok(true);
}

/**
 * アラート更新プロパティのバリデーション
 *
 * @param updates - 更新プロパティ
 * @returns バリデーション結果
 */
export function validateUpdateAlertProps(
	updates: UpdateAlertProps
): Result<true, AlertError> {
	// ステータスの妥当性チェック
	if (updates.status && !ALERT_STATUSES.includes(updates.status)) {
		return err({
			type: "ValidationError",
			message: "Invalid alert status",
			field: "status"
		});
	}

	// 重要度の妥当性チェック
	if (updates.severity && !ALERT_SEVERITIES.includes(updates.severity)) {
		return err({
			type: "ValidationError",
			message: "Invalid alert severity",
			field: "severity"
		});
	}

	// メッセージ長のチェック
	if (updates.message !== undefined) {
		if (updates.message.trim() === "") {
			return err({
				type: "ValidationError",
				message: "Alert message cannot be empty",
				field: "message"
			});
		}
		if (updates.message.length > 500) {
			return err({
				type: "ValidationError",
				message: "Alert message cannot exceed 500 characters",
				field: "message"
			});
		}
	}

	// メモ長のチェック
	if (updates.memo && updates.memo.length > 1000) {
		return err({
			type: "ValidationError",
			message: "Memo cannot exceed 1000 characters",
			field: "memo"
		});
	}

	return ok(true);
}

/**
 * 期限日時のバリデーション
 *
 * @param dueAt - 期限日時
 * @param currentTime - 現在時刻（オプション）
 * @returns バリデーション結果
 */
export function validateDueAt(
	dueAt: Date,
	currentTime?: Date
): Result<true, AlertError> {
	const now = currentTime || new Date();

	// 過去すぎる日時のチェック（1年以内）
	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(now.getFullYear() - 1);

	if (dueAt < oneYearAgo) {
		return err({
			type: "ValidationError",
			message: "Due date cannot be more than 1 year in the past",
			field: "dueAt"
		});
	}

	// 未来すぎる日時のチェック（2年以内）
	const twoYearsFromNow = new Date();
	twoYearsFromNow.setFullYear(now.getFullYear() + 2);

	if (dueAt > twoYearsFromNow) {
		return err({
			type: "ValidationError",
			message: "Due date cannot be more than 2 years in the future",
			field: "dueAt"
		});
	}

	return ok(true);
}

/**
 * ステータス遷移のバリデーション
 *
 * @param currentStatus - 現在のステータス
 * @param newStatus - 新しいステータス
 * @returns バリデーション結果
 */
export function validateStatusTransition(
	currentStatus: AlertStatus,
	newStatus: AlertStatus
): Result<true, AlertError> {
	const statusTransitions: Record<AlertStatus, AlertStatus[]> = {
		active: ["acknowledged", "dismissed"],
		acknowledged: ["resolved", "dismissed"],
		resolved: [], // 解決後は変更不可
		dismissed: [] // 却下後は変更不可
	};

	const allowedTransitions = statusTransitions[currentStatus];

	if (!allowedTransitions.includes(newStatus)) {
		return err({
			type: "ValidationError",
			message: `Cannot transition from ${currentStatus} to ${newStatus}`,
			field: "status"
		});
	}

	return ok(true);
}

/**
 * 文字列の正規化
 *
 * @param value - 正規化する文字列
 * @returns 正規化された文字列またはnull
 */
export function normalizeString(
	value: string | null | undefined
): string | null {
	if (!value || typeof value !== "string") return null;

	const trimmed = value.trim();
	if (trimmed === "") return null;

	return trimmed;
}

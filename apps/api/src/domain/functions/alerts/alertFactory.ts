/**
 * Alert Factory Functions
 *
 * アラートエンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { AlertError } from "../../errors/alerts/AlertErrors";
import type {
	Alert,
	AlertId,
	AlertMessage,
	AlertSeverity,
	AlertSeverityValue,
	AlertStatus,
	AlertStatusValue,
	AlertType,
	AlertTypeValue,
	DueDate,
	NewAlertProps,
	UpdateAlertProps
} from "../../types/alerts";
import {
	normalizeString,
	validateNewAlertProps,
	validateStatusTransition,
	validateUpdateAlertProps
} from "./alertValidation";

/**
 * アラートエンティティのファクトリー関数
 *
 * 新規アラートの作成を行い、ドメインルールに基づくバリデーションを実行します。
 * 以下の特徴を持ちます：
 *
 * - 純粋関数: 副作用なし、同じ入力に対して同じ出力
 * - ドメインルール: ビジネスルールに基づく検証
 * - データ正規化: 入力データの適切な正規化
 *
 * @param props - 新規アラートのプロパティ
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたアラート、失敗時はドメインエラー
 */
export function createAlert(
	props: NewAlertProps,
	currentTime: Date
): Result<Alert, AlertError> {
	// バリデーション
	const validation = validateNewAlertProps(props, currentTime);
	if (!validation.ok) return validation;

	// アラート作成
	const alert: Alert = {
		id: 0 as AlertId, // データベースで自動生成
		type: props.type,
		severity: props.severity,
		status: "active",
		cattleId: props.cattleId,
		cattleName: normalizeString(props.cattleName),
		cattleEarTagNumber: props.cattleEarTagNumber,
		dueAt: props.dueAt as DueDate | null,
		message: normalizeString(props.message) as AlertMessage,
		memo: normalizeString(props.memo),
		ownerUserId: props.ownerUserId,
		createdAt: currentTime,
		updatedAt: currentTime,
		acknowledgedAt: null,
		resolvedAt: null
	};

	return ok(alert);
}

/**
 * アラート更新ファクトリー関数
 *
 * 既存のアラートを更新し、ドメインルールに基づくバリデーションを実行します。
 *
 * @param current - 現在のアラート
 * @param updates - 更新データ
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたアラート、失敗時はドメインエラー
 */
export function updateAlert(
	current: Alert,
	updates: UpdateAlertProps,
	currentTime: Date
): Result<Alert, AlertError> {
	// バリデーション
	const validation = validateUpdateAlertProps(updates);
	if (!validation.ok) return validation;

	// ステータス遷移の検証
	if (updates.status && updates.status !== current.status) {
		const transitionValidation = validateStatusTransition(
			current.status,
			updates.status
		);
		if (!transitionValidation.ok) return transitionValidation;
	}

	// アラート更新
	const updatedAlert: Alert = {
		...current,
		...(updates.status !== undefined && { status: updates.status }),
		...(updates.severity !== undefined && { severity: updates.severity }),
		...(updates.message !== undefined && {
			message: normalizeString(updates.message) as AlertMessage
		}),
		...(updates.memo !== undefined && { memo: normalizeString(updates.memo) }),
		updatedAt: currentTime
	};

	return ok(updatedAlert);
}

/**
 * アラートステータス更新ファクトリー関数
 *
 * アラートのステータスを更新し、必要に応じて確認日時や解決日時を設定します。
 *
 * @param current - 現在のアラート
 * @param newStatus - 新しいステータス
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたアラート、失敗時はドメインエラー
 */
export function updateAlertStatus(
	current: Alert,
	newStatus: AlertStatus,
	currentTime: Date
): Result<Alert, AlertError> {
	// ステータス遷移の検証
	const transitionValidation = validateStatusTransition(
		current.status,
		newStatus
	);
	if (!transitionValidation.ok) return transitionValidation;

	// 更新データの準備
	let acknowledgedAt = current.acknowledgedAt;
	let resolvedAt = current.resolvedAt;

	// 確認済みへの遷移時に確認日時を設定
	if (newStatus === "acknowledged" && current.acknowledgedAt === null) {
		acknowledgedAt = currentTime;
	}

	// 解決済み・却下への遷移時に解決日時を設定
	if (
		(newStatus === "resolved" || newStatus === "dismissed") &&
		current.resolvedAt === null
	) {
		resolvedAt = currentTime;
	}

	const updatedAlert: Alert = {
		...current,
		status: newStatus,
		acknowledgedAt,
		resolvedAt,
		updatedAt: currentTime
	};

	return ok(updatedAlert);
}

/**
 * アラート重要度更新ファクトリー関数
 *
 * アラートの重要度を更新します。
 *
 * @param current - 現在のアラート
 * @param newSeverity - 新しい重要度
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたアラート、失敗時はドメインエラー
 */
export function updateAlertSeverity(
	current: Alert,
	newSeverity: AlertSeverity,
	currentTime: Date
): Result<Alert, AlertError> {
	const updates: UpdateAlertProps = { severity: newSeverity };
	return updateAlert(current, updates, currentTime);
}

/**
 * アラートタイプ値オブジェクトの作成
 */
export function createAlertType(type: string): AlertTypeValue {
	const typeMap: Record<string, Omit<AlertTypeValue, "value">> = {
		OPEN_DAYS_OVER60_NO_AI: {
			displayName: "空胎60日以上（AI未実施）",
			description: "最終分娩から60日以上経過し、人工授精が未実施",
			category: "breeding",
			defaultSeverity: "medium",
			requiresAction: true
		},
		CALVING_WITHIN_60: {
			displayName: "60日以内分娩予定",
			description: "分娩予定日まで60日以内（エサ強化が必要）",
			category: "management",
			defaultSeverity: "medium",
			requiresAction: true
		},
		CALVING_OVERDUE: {
			displayName: "分娩予定日超過",
			description: "分娩予定日を経過している",
			category: "health",
			defaultSeverity: "high",
			requiresAction: true
		},
		ESTRUS_OVER20_NOT_PREGNANT: {
			displayName: "発情から20日以上未妊娠",
			description: "発情から20日経過し、妊娠確認が未実施",
			category: "breeding",
			defaultSeverity: "low",
			requiresAction: true
		}
	};

	return {
		value: type as AlertType,
		...typeMap[type]
	};
}

/**
 * アラート重要度値オブジェクトの作成
 */
export function createAlertSeverity(
	severity: AlertSeverity
): AlertSeverityValue {
	const severityMap: Record<
		AlertSeverity,
		Omit<AlertSeverityValue, "value">
	> = {
		high: {
			displayName: "高",
			priority: 3,
			color: "red",
			requiresImmediateAction: true
		},
		medium: {
			displayName: "中",
			priority: 2,
			color: "orange",
			requiresImmediateAction: false
		},
		low: {
			displayName: "低",
			priority: 1,
			color: "yellow",
			requiresImmediateAction: false
		}
	};

	return {
		value: severity,
		...severityMap[severity]
	};
}

/**
 * アラートステータス値オブジェクトの作成
 */
export function createAlertStatus(status: AlertStatus): AlertStatusValue {
	const statusMap: Record<AlertStatus, Omit<AlertStatusValue, "value">> = {
		active: {
			displayName: "アクティブ",
			description: "アラートが有効で対応が必要",
			isActive: true,
			isResolved: false
		},
		acknowledged: {
			displayName: "確認済み",
			description: "アラートを確認済み",
			isActive: true,
			isResolved: false
		},
		resolved: {
			displayName: "解決済み",
			description: "アラートが解決された",
			isActive: false,
			isResolved: true
		},
		dismissed: {
			displayName: "却下",
			description: "アラートが却下された",
			isActive: false,
			isResolved: true
		}
	};

	return {
		value: status,
		...statusMap[status]
	};
}

/**
 * アラートのドメインルール
 */
export const AlertRules = {
	/**
	 * アラートがアクティブかチェック
	 */
	isAlertActive(alert: Alert): boolean {
		const statusValue = createAlertStatus(alert.status);
		return statusValue.isActive;
	},

	/**
	 * アラートが解決済みかチェック
	 */
	isAlertResolved(alert: Alert): boolean {
		const statusValue = createAlertStatus(alert.status);
		return statusValue.isResolved;
	},

	/**
	 * アラートが緊急対応が必要かチェック
	 */
	isAlertUrgent(alert: Alert): boolean {
		const severityValue = createAlertSeverity(alert.severity);
		return severityValue.requiresImmediateAction;
	},

	/**
	 * アラートの優先度を取得
	 */
	getAlertPriority(alert: Alert): number {
		const severityValue = createAlertSeverity(alert.severity);
		return severityValue.priority;
	},

	/**
	 * アラートの期限が近いかチェック
	 */
	isAlertDueSoon(alert: Alert, daysThreshold = 7): boolean {
		if (!alert.dueAt) return false;

		const dueDate = new Date(alert.dueAt);
		const now = new Date();
		const diffTime = dueDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays <= daysThreshold && diffDays >= 0;
	},

	/**
	 * アラートの期限が過ぎているかチェック
	 */
	isAlertOverdue(alert: Alert): boolean {
		if (!alert.dueAt) return false;

		const dueDate = new Date(alert.dueAt);
		const now = new Date();

		return dueDate < now;
	},

	/**
	 * ステータス変更が許可されているかチェック
	 */
	canChangeStatus(currentStatus: AlertStatus, newStatus: AlertStatus): boolean {
		const statusTransitions: Record<AlertStatus, AlertStatus[]> = {
			active: ["acknowledged", "dismissed"],
			acknowledged: ["resolved", "dismissed"],
			resolved: [], // 解決後は変更不可
			dismissed: [] // 却下後は変更不可
		};

		return statusTransitions[currentStatus].includes(newStatus);
	}
};

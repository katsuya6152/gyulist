import type { Brand } from "../../../../shared/brand";
import type {
	AlertId,
	AlertMessage,
	AlertSeverity,
	AlertStatus,
	AlertType,
	CattleId,
	CattleName,
	DueDate,
	EarTagNumber,
	Timestamp,
	UserId
} from "./types";

// ============================================================================
// 値オブジェクト
// ============================================================================

/**
 * アラートタイプ値オブジェクト
 */
export type AlertTypeValue = {
	readonly value: AlertType;
	readonly displayName: string;
	readonly description: string;
	readonly category: "breeding" | "health" | "management";
	readonly defaultSeverity: AlertSeverity;
	readonly requiresAction: boolean;
};

/**
 * アラートタイプのファクトリ関数
 */
export function createAlertType(type: AlertType): AlertTypeValue {
	const typeMap: Record<AlertType, Omit<AlertTypeValue, "value">> = {
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
		value: type,
		...typeMap[type]
	};
}

/**
 * アラート重要度値オブジェクト
 */
export type AlertSeverityValue = {
	readonly value: AlertSeverity;
	readonly displayName: string;
	readonly priority: number;
	readonly color: string;
	readonly requiresImmediateAction: boolean;
};

/**
 * アラート重要度のファクトリ関数
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
 * アラートステータス値オブジェクト
 */
export type AlertStatusValue = {
	readonly value: AlertStatus;
	readonly displayName: string;
	readonly description: string;
	readonly isActive: boolean;
	readonly isResolved: boolean;
};

/**
 * アラートステータスのファクトリ関数
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

// ============================================================================
// Alertエンティティ
// ============================================================================

/**
 * 新規アラート作成用のプロパティ。
 *
 * アラートエンティティの作成に必要な情報を定義します。
 */
export type NewAlertProps = {
	/** アラートタイプ */ readonly type: AlertType;
	/** 重要度 */ readonly severity: AlertSeverity;
	/** 牛ID */ readonly cattleId: CattleId;
	/** 牛名 */ readonly cattleName: CattleName | null;
	/** 耳標番号 */ readonly cattleEarTagNumber: EarTagNumber | null;
	/** 期限日時 */ readonly dueAt: DueDate | null;
	/** アラートメッセージ */ readonly message: AlertMessage;
	/** 所有者ユーザーID */ readonly ownerUserId: UserId;
};

/**
 * Alertエンティティ。
 *
 * 牛の繁殖管理、健康管理、スケジュール管理に関するアラートを表現します。
 * ステータス管理、重要度管理、期限管理などの機能を提供します。
 */
export type Alert = {
	/** アラートID */ readonly id: AlertId;
	/** アラートタイプ */ readonly type: AlertType;
	/** 重要度 */ readonly severity: AlertSeverity;
	/** ステータス */ readonly status: AlertStatus;
	/** 牛ID */ readonly cattleId: CattleId;
	/** 牛名 */ readonly cattleName: CattleName | null;
	/** 耳標番号 */ readonly cattleEarTagNumber: EarTagNumber | null;
	/** 期限日時 */ readonly dueAt: DueDate | null;
	/** アラートメッセージ */ readonly message: AlertMessage;
	/** 所有者ユーザーID */ readonly ownerUserId: UserId;
	/** 作成日時 */ readonly createdAt: Timestamp;
	/** 更新日時 */ readonly updatedAt: Timestamp;
	/** 確認日時 */ readonly acknowledgedAt: Timestamp | null;
	/** 解決日時 */ readonly resolvedAt: Timestamp | null;
};

/**
 * Alertエンティティのファクトリ関数。
 *
 * 新規アラートを作成し、初期状態を設定します。
 * @param props - 新規アラートのプロパティ
 * @param id - アラートID
 * @param currentTime - 現在時刻
 * @returns 作成されたアラートエンティティ
 */
export function createAlert(
	props: NewAlertProps,
	id: AlertId,
	currentTime: Timestamp
): Alert {
	return {
		id,
		type: props.type,
		severity: props.severity,
		status: "active",
		cattleId: props.cattleId,
		cattleName: props.cattleName,
		cattleEarTagNumber: props.cattleEarTagNumber,
		dueAt: props.dueAt,
		message: props.message,
		ownerUserId: props.ownerUserId,
		createdAt: currentTime,
		updatedAt: currentTime,
		acknowledgedAt: null,
		resolvedAt: null
	};
}

/**
 * Alertエンティティの更新。
 *
 * アラートの一部プロパティを更新します。
 * @param alert - 更新対象のアラート
 * @param updates - 更新内容
 * @param currentTime - 現在時刻
 * @returns 更新されたアラートエンティティ
 */
export function updateAlert(
	alert: Alert,
	updates: Partial<Pick<Alert, "status" | "severity" | "message">>,
	currentTime: Timestamp
): Alert {
	return {
		...alert,
		...updates,
		updatedAt: currentTime
	};
}

/**
 * Alertエンティティのステータス更新。
 *
 * アラートのステータスを更新し、必要に応じて確認日時や解決日時を設定します。
 * @param alert - 更新対象のアラート
 * @param newStatus - 新しいステータス
 * @param currentTime - 現在時刻
 * @returns 更新されたアラートエンティティ
 */
export function updateAlertStatus(
	alert: Alert,
	newStatus: AlertStatus,
	currentTime: Timestamp
): Alert {
	const updates: {
		status: AlertStatus;
		acknowledgedAt?: Timestamp;
		resolvedAt?: Timestamp;
	} = { status: newStatus };

	if (newStatus === "acknowledged" && alert.acknowledgedAt === null) {
		updates.acknowledgedAt = currentTime;
	}

	if (
		(newStatus === "resolved" || newStatus === "dismissed") &&
		alert.resolvedAt === null
	) {
		updates.resolvedAt = currentTime;
	}

	return updateAlert(alert, updates, currentTime);
}

/**
 * Alertエンティティの重要度更新。
 *
 * アラートの重要度を更新します。
 * @param alert - 更新対象のアラート
 * @param newSeverity - 新しい重要度
 * @param currentTime - 現在時刻
 * @returns 更新されたアラートエンティティ
 */
export function updateAlertSeverity(
	alert: Alert,
	newSeverity: AlertSeverity,
	currentTime: Timestamp
): Alert {
	return updateAlert(alert, { severity: newSeverity }, currentTime);
}

// ============================================================================
// ドメインルール
// ============================================================================

/**
 * アラートステータスの変更が許可されているかチェックします。
 *
 * 現在のステータスから新しいステータスへの遷移が有効かどうかを判定します。
 * @param currentStatus - 現在のステータス
 * @param newStatus - 新しいステータス
 * @returns 遷移が許可されている場合は true
 */
export function canChangeStatus(
	currentStatus: AlertStatus,
	newStatus: AlertStatus
): boolean {
	const statusTransitions: Record<AlertStatus, AlertStatus[]> = {
		active: ["acknowledged", "resolved", "dismissed"],
		acknowledged: ["resolved", "dismissed"],
		resolved: [], // 解決後は変更不可
		dismissed: [] // 却下後は変更不可
	};

	return statusTransitions[currentStatus].includes(newStatus);
}

/**
 * アラートがアクティブかチェック
 */
export function isAlertActive(alert: Alert): boolean {
	const statusValue = createAlertStatus(alert.status);
	return statusValue.isActive;
}

/**
 * アラートが解決済みかチェック
 */
export function isAlertResolved(alert: Alert): boolean {
	const statusValue = createAlertStatus(alert.status);
	return statusValue.isResolved;
}

/**
 * アラートが緊急対応が必要かチェック
 */
export function isAlertUrgent(alert: Alert): boolean {
	const severityValue = createAlertSeverity(alert.severity);
	return severityValue.requiresImmediateAction;
}

/**
 * アラートの優先度を取得
 */
export function getAlertPriority(alert: Alert): number {
	const severityValue = createAlertSeverity(alert.severity);
	return severityValue.priority;
}

/**
 * アラートの期限が近いかチェック
 */
export function isAlertDueSoon(alert: Alert, daysThreshold = 7): boolean {
	if (!alert.dueAt) return false;

	const dueDate = new Date(alert.dueAt);
	const now = new Date();
	const diffTime = dueDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays <= daysThreshold && diffDays >= 0;
}

/**
 * アラートの期限が過ぎているかチェック
 */
export function isAlertOverdue(alert: Alert): boolean {
	if (!alert.dueAt) return false;

	const dueDate = new Date(alert.dueAt);
	const now = new Date();

	return dueDate < now;
}

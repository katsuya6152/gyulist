// ============================================================================
// Alertsドメインエラー
// ============================================================================

/**
 * Alertsドメインエラーの型
 */
export type AlertsDomainError =
	| { type: "ValidationError"; message: string; field?: string }
	| { type: "BusinessRuleError"; message: string; rule?: string }
	| { type: "AlertNotFoundError"; message: string; alertId?: string }
	| {
			type: "StatusTransitionError";
			message: string;
			currentStatus: string;
			newStatus: string;
	  }
	| { type: "PermissionError"; message: string; userId?: number }
	| { type: "CattleNotFoundError"; message: string; cattleId?: number }
	| { type: "InfraError"; message: string; cause?: unknown };

// ============================================================================
// エラーファクトリ関数
// ============================================================================

/**
 * バリデーションエラーを作成
 */
export function createValidationError(
	message: string,
	field?: string
): AlertsDomainError {
	return {
		type: "ValidationError",
		message,
		field
	};
}

/**
 * ビジネスルールエラーを作成
 */
export function createBusinessRuleError(
	message: string,
	rule?: string
): AlertsDomainError {
	return {
		type: "BusinessRuleError",
		message,
		rule
	};
}

/**
 * アラート見つからないエラーを作成
 */
export function createAlertNotFoundError(alertId?: string): AlertsDomainError {
	return {
		type: "AlertNotFoundError",
		message: `アラートが見つかりません${alertId ? `: ${alertId}` : ""}`,
		alertId
	};
}

/**
 * ステータス遷移エラーを作成
 */
export function createStatusTransitionError(
	currentStatus: string,
	newStatus: string
): AlertsDomainError {
	return {
		type: "StatusTransitionError",
		message: `ステータス ${currentStatus} から ${newStatus} への変更は許可されていません`,
		currentStatus,
		newStatus
	};
}

/**
 * 権限エラーを作成
 */
export function createPermissionError(
	message: string,
	userId?: number
): AlertsDomainError {
	return {
		type: "PermissionError",
		message,
		userId
	};
}

/**
 * 牛が見つからないエラーを作成
 */
export function createCattleNotFoundError(
	cattleId?: number
): AlertsDomainError {
	return {
		type: "CattleNotFoundError",
		message: `牛が見つかりません${cattleId ? `: ${cattleId}` : ""}`,
		cattleId
	};
}

/**
 * インフラエラーを作成
 */
export function createInfraError(
	message: string,
	cause?: unknown
): AlertsDomainError {
	return {
		type: "InfraError",
		message,
		cause
	};
}

// ============================================================================
// エラーユーティリティ
// ============================================================================

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: AlertsDomainError): string {
	switch (error.type) {
		case "ValidationError":
			return `バリデーションエラー: ${error.message}`;
		case "BusinessRuleError":
			return `ビジネスルールエラー: ${error.message}`;
		case "AlertNotFoundError":
			return error.message;
		case "StatusTransitionError":
			return error.message;
		case "PermissionError":
			return `権限エラー: ${error.message}`;
		case "CattleNotFoundError":
			return error.message;
		case "InfraError":
			return `インフラエラー: ${error.message}`;
		default: {
			const _exhaustive: never = error;
			return "不明なエラーが発生しました";
		}
	}
}

/**
 * エラーの詳細情報を取得
 */
export function getErrorDetails(
	error: AlertsDomainError
): Record<string, unknown> {
	switch (error.type) {
		case "ValidationError":
			return { field: error.field, message: error.message };
		case "BusinessRuleError":
			return { rule: error.rule, message: error.message };
		case "AlertNotFoundError":
			return { alertId: error.alertId, message: error.message };
		case "StatusTransitionError":
			return {
				currentStatus: error.currentStatus,
				newStatus: error.newStatus,
				message: error.message
			};
		case "PermissionError":
			return { userId: error.userId, message: error.message };
		case "CattleNotFoundError":
			return { cattleId: error.cattleId, message: error.message };
		case "InfraError":
			return { cause: error.cause, message: error.message };
		default: {
			const _exhaustive: never = error;
			return { message: "不明なエラーが発生しました" };
		}
	}
}

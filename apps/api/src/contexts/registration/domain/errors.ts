// ============================================================================
// Registrationドメインエラー
// ============================================================================

/**
 * Registrationドメインエラーの型
 */
export type RegistrationDomainError =
	| { type: "ValidationError"; message: string; field?: string }
	| { type: "BusinessRuleError"; message: string; rule?: string }
	| { type: "DuplicateEmailError"; message: string; email: string }
	| {
			type: "StatusTransitionError";
			message: string;
			currentStatus: string;
			newStatus: string;
	  }
	| { type: "EmailSendError"; message: string; cause?: string }
	| { type: "TurnstileError"; message: string; token?: string }
	| { type: "NotFoundError"; message: string; id?: string }
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
): RegistrationDomainError {
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
): RegistrationDomainError {
	return {
		type: "BusinessRuleError",
		message,
		rule
	};
}

/**
 * 重複メールエラーを作成
 */
export function createDuplicateEmailError(
	email: string
): RegistrationDomainError {
	return {
		type: "DuplicateEmailError",
		message: `メールアドレス ${email} は既に登録されています`,
		email
	};
}

/**
 * ステータス遷移エラーを作成
 */
export function createStatusTransitionError(
	currentStatus: string,
	newStatus: string
): RegistrationDomainError {
	return {
		type: "StatusTransitionError",
		message: `ステータス ${currentStatus} から ${newStatus} への変更は許可されていません`,
		currentStatus,
		newStatus
	};
}

/**
 * メール送信エラーを作成
 */
export function createEmailSendError(
	message: string,
	cause?: string
): RegistrationDomainError {
	return {
		type: "EmailSendError",
		message,
		cause
	};
}

/**
 * Turnstileエラーを作成
 */
export function createTurnstileError(
	message: string,
	token?: string
): RegistrationDomainError {
	return {
		type: "TurnstileError",
		message,
		token
	};
}

/**
 * 見つからないエラーを作成
 */
export function createNotFoundError(
	message: string,
	id?: string
): RegistrationDomainError {
	return {
		type: "NotFoundError",
		message,
		id
	};
}

/**
 * インフラエラーを作成
 */
export function createInfraError(
	message: string,
	cause?: unknown
): RegistrationDomainError {
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
export function getErrorMessage(error: RegistrationDomainError): string {
	switch (error.type) {
		case "ValidationError":
			return `バリデーションエラー: ${error.message}`;
		case "BusinessRuleError":
			return `ビジネスルールエラー: ${error.message}`;
		case "DuplicateEmailError":
			return error.message;
		case "StatusTransitionError":
			return error.message;
		case "EmailSendError":
			return `メール送信エラー: ${error.message}`;
		case "TurnstileError":
			return `Turnstileエラー: ${error.message}`;
		case "NotFoundError":
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
	error: RegistrationDomainError
): Record<string, unknown> {
	switch (error.type) {
		case "ValidationError":
			return { field: error.field, message: error.message };
		case "BusinessRuleError":
			return { rule: error.rule, message: error.message };
		case "DuplicateEmailError":
			return { email: error.email, message: error.message };
		case "StatusTransitionError":
			return {
				currentStatus: error.currentStatus,
				newStatus: error.newStatus,
				message: error.message
			};
		case "EmailSendError":
			return { cause: error.cause, message: error.message };
		case "TurnstileError":
			return { token: error.token, message: error.message };
		case "NotFoundError":
			return { id: error.id, message: error.message };
		case "InfraError":
			return { cause: error.cause, message: error.message };
		default: {
			const _exhaustive: never = error;
			return { message: "不明なエラーが発生しました" };
		}
	}
}

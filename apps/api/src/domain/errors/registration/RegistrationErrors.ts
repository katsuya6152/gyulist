/**
 * Registration Domain Errors
 *
 * 事前登録ドメインのエラー定義
 */

// ============================================================================
// Domain Error Types
// ============================================================================

/**
 * バリデーションエラー
 * 入力データの検証に失敗した場合に使用されます
 */
export type ValidationError = {
	readonly type: "ValidationError";
	readonly message: string;
	readonly field?: string;
};

/**
 * ビジネスルールエラー
 * ビジネスルールに違反した場合に使用されます
 */
export type BusinessRuleError = {
	readonly type: "BusinessRuleError";
	readonly message: string;
	readonly rule?: string;
};

/**
 * 重複メールエラー
 * 既に登録されているメールアドレスが使用された場合に使用されます
 */
export type DuplicateEmailError = {
	readonly type: "DuplicateEmailError";
	readonly message: string;
	readonly email: string;
};

/**
 * ステータス遷移エラー
 * 許可されていないステータス変更が試行された場合に使用されます
 */
export type StatusTransitionError = {
	readonly type: "StatusTransitionError";
	readonly message: string;
	readonly currentStatus: string;
	readonly newStatus: string;
};

/**
 * メール送信エラー
 * メール送信に失敗した場合に使用されます
 */
export type EmailSendError = {
	readonly type: "EmailSendError";
	readonly message: string;
	readonly cause?: string;
};

/**
 * Turnstileエラー
 * Cloudflare Turnstile認証に失敗した場合に使用されます
 */
export type TurnstileError = {
	readonly type: "TurnstileError";
	readonly message: string;
	readonly token?: string;
};

/**
 * リソース未発見エラー
 * 指定されたリソースが見つからない場合に使用されます
 */
export type NotFoundError = {
	readonly type: "NotFoundError";
	readonly message: string;
	readonly id?: string;
};

/**
 * インフラエラー
 * データベース接続エラーなど、インフラ層でのエラーに使用されます
 */
export type InfraError = {
	readonly type: "InfraError";
	readonly message: string;
	readonly cause?: unknown;
};

/**
 * 事前登録ドメインのエラー型
 * 事前登録関連のすべてのエラーを統合した型です
 */
export type RegistrationError =
	| ValidationError
	| BusinessRuleError
	| DuplicateEmailError
	| StatusTransitionError
	| EmailSendError
	| TurnstileError
	| NotFoundError
	| InfraError;

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * バリデーションエラーを作成
 */
export function createValidationError(
	message: string,
	field?: string
): ValidationError {
	return {
		type: "ValidationError",
		message,
		...(field && { field })
	};
}

/**
 * ビジネスルールエラーを作成
 */
export function createBusinessRuleError(
	message: string,
	rule?: string
): BusinessRuleError {
	return {
		type: "BusinessRuleError",
		message,
		...(rule && { rule })
	};
}

/**
 * 重複メールエラーを作成
 */
export function createDuplicateEmailError(email: string): DuplicateEmailError {
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
): StatusTransitionError {
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
): EmailSendError {
	return {
		type: "EmailSendError",
		message,
		...(cause && { cause })
	};
}

/**
 * Turnstileエラーを作成
 */
export function createTurnstileError(
	message: string,
	token?: string
): TurnstileError {
	return {
		type: "TurnstileError",
		message,
		...(token && { token })
	};
}

/**
 * 見つからないエラーを作成
 */
export function createNotFoundError(
	message: string,
	id?: string
): NotFoundError {
	return {
		type: "NotFoundError",
		message,
		...(id && { id })
	};
}

/**
 * インフラエラーを作成
 */
export function createInfraError(message: string, cause?: unknown): InfraError {
	return {
		type: "InfraError",
		message,
		...(cause && { cause })
	};
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: RegistrationError): string {
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
	error: RegistrationError
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

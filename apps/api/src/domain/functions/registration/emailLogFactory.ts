/**
 * Email Log Factory Functions
 *
 * メールログエンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { Result } from "../../../shared/result";
import { ok } from "../../../shared/result";
import type { RegistrationError } from "../../errors/registration/RegistrationErrors";
import type {
	Email,
	EmailLog,
	EmailLogId,
	EmailType,
	EmailTypeValue,
	ErrorMessage,
	HttpStatus,
	HttpStatusValue,
	NewEmailLogProps,
	ResendId,
	Timestamp
} from "../../types/registration";

// ============================================================================
// Email Log Factory Functions
// ============================================================================

/**
 * メールログエンティティのファクトリー関数
 *
 * 新規メールログの作成を行い、ドメインルールに基づくバリデーションを実行します。
 *
 * @param props - 新規メールログのプロパティ
 * @param id - メールログID
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたメールログ、失敗時はドメインエラー
 */
export function createEmailLog(
	props: NewEmailLogProps,
	id: EmailLogId,
	currentTime: Timestamp
): Result<EmailLog, RegistrationError> {
	// メールログ作成
	const emailLog: EmailLog = {
		id,
		email: props.email,
		type: props.type,
		httpStatus: props.httpStatus,
		resendId: props.resendId ?? null,
		error: props.error ?? null,
		createdAt: currentTime
	};

	return ok(emailLog);
}

/**
 * メールログ更新ファクトリー関数
 *
 * 既存のメールログを更新します。
 *
 * @param current - 現在のメールログ
 * @param updates - 更新データ
 * @returns 成功時は更新されたメールログ、失敗時はドメインエラー
 */
export function updateEmailLog(
	current: EmailLog,
	updates: Partial<Pick<EmailLog, "httpStatus" | "resendId" | "error">>
): Result<EmailLog, RegistrationError> {
	// メールログ更新
	const updatedEmailLog: EmailLog = {
		...current,
		...updates
	};

	return ok(updatedEmailLog);
}

// ============================================================================
// Value Object Factory Functions
// ============================================================================

/**
 * メールタイプ値オブジェクトのファクトリー関数
 *
 * メールタイプ値から値オブジェクトを生成します。
 * @param type - メールタイプ
 * @returns メールタイプ値オブジェクト
 */
export function createEmailTypeValue(type: EmailType): EmailTypeValue {
	const typeMap: Record<EmailType, Omit<EmailTypeValue, "value">> = {
		completed: {
			displayName: "完了通知",
			description: "登録完了時の通知メール",
			isRetryable: true,
			maxRetries: 3
		},
		verification: {
			displayName: "確認メール",
			description: "登録確認用のメール",
			isRetryable: true,
			maxRetries: 5
		},
		reminder: {
			displayName: "リマインダー",
			description: "登録完了のリマインダー",
			isRetryable: true,
			maxRetries: 2
		},
		notification: {
			displayName: "通知",
			description: "一般的な通知メール",
			isRetryable: false,
			maxRetries: 0
		}
	};

	return {
		value: type,
		...typeMap[type]
	};
}

/**
 * HTTPステータス値オブジェクトのファクトリー関数
 *
 * HTTPステータスコードから値オブジェクトを生成します。
 * @param status - HTTPステータスコード
 * @returns HTTPステータス値オブジェクト
 */
export function createHttpStatusValue(status: HttpStatus): HttpStatusValue {
	const statusMap: Record<HttpStatus, Omit<HttpStatusValue, "value">> = {
		200: {
			isSuccess: true,
			category: "success",
			description: "OK"
		},
		201: {
			isSuccess: true,
			category: "success",
			description: "Created"
		},
		400: {
			isSuccess: false,
			category: "client_error",
			description: "Bad Request"
		},
		401: {
			isSuccess: false,
			category: "client_error",
			description: "Unauthorized"
		},
		403: {
			isSuccess: false,
			category: "client_error",
			description: "Forbidden"
		},
		404: {
			isSuccess: false,
			category: "client_error",
			description: "Not Found"
		},
		500: {
			isSuccess: false,
			category: "server_error",
			description: "Internal Server Error"
		},
		502: {
			isSuccess: false,
			category: "server_error",
			description: "Bad Gateway"
		}
	};

	return {
		value: status,
		...statusMap[status]
	};
}

// ============================================================================
// Business Rules
// ============================================================================

/**
 * メール送信が成功したかチェック
 *
 * メールログにエラーがなく、HTTPステータスが成功コードであるかを確認します。
 * @param emailLog - メールログ
 * @returns 成功した場合はtrue、それ以外はfalse
 */
export function isEmailSentSuccessfully(emailLog: EmailLog): boolean {
	if (emailLog.error) return false;
	if (emailLog.httpStatus) {
		const statusValue = createHttpStatusValue(emailLog.httpStatus);
		return statusValue.isSuccess;
	}
	return false;
}

/**
 * メール送信が再試行可能かチェック
 *
 * メールタイプのリトライ設定に基づいて、メール送信が再試行可能かを判断します。
 * @param emailLog - メールログ
 * @returns 再試行可能な場合はtrue、それ以外はfalse
 */
export function isEmailRetryable(emailLog: EmailLog): boolean {
	const typeValue = createEmailTypeValue(emailLog.type);
	return typeValue.isRetryable;
}

/**
 * メール送信の最大再試行回数を取得
 *
 * メールタイプのリトライ設定から最大再試行回数を取得します。
 * @param emailLog - メールログ
 * @returns 最大再試行回数
 */
export function getMaxRetries(emailLog: EmailLog): number {
	const typeValue = createEmailTypeValue(emailLog.type);
	return typeValue.maxRetries;
}

/**
 * メール送信のカテゴリを取得
 *
 * HTTPステータスコードに基づいて、メール送信のカテゴリを判断します。
 * @param emailLog - メールログ
 * @returns カテゴリ（success, client_error, server_error, unknown）
 */
export function getEmailCategory(
	emailLog: EmailLog
): "success" | "client_error" | "server_error" | "unknown" {
	if (emailLog.httpStatus) {
		const statusValue = createHttpStatusValue(emailLog.httpStatus);
		return statusValue.category;
	}
	return "unknown";
}

// ============================================================================
// Domain Rules
// ============================================================================

/**
 * メールログビジネスルール
 */
export const EmailLogRules = {
	/**
	 * メール送信が成功したかチェック
	 */
	isSentSuccessfully: isEmailSentSuccessfully,

	/**
	 * メール送信が再試行可能かチェック
	 */
	isRetryable: isEmailRetryable,

	/**
	 * 最大再試行回数を取得
	 */
	getMaxRetries,

	/**
	 * メール送信のカテゴリを取得
	 */
	getCategory: getEmailCategory,

	/**
	 * メール送信が失敗したかチェック
	 */
	isFailed(emailLog: EmailLog): boolean {
		return !isEmailSentSuccessfully(emailLog);
	},

	/**
	 * メール送信がサーバーエラーかチェック
	 */
	isServerError(emailLog: EmailLog): boolean {
		return getEmailCategory(emailLog) === "server_error";
	},

	/**
	 * メール送信がクライアントエラーかチェック
	 */
	isClientError(emailLog: EmailLog): boolean {
		return getEmailCategory(emailLog) === "client_error";
	}
};

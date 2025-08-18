import type { Brand } from "../../../../shared/brand";
import type { Email, Timestamp } from "./types";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * メールタイプの定数
 */
export const EMAIL_TYPES = [
	"completed",
	"verification",
	"reminder",
	"notification"
] as const;

/**
 * メールタイプの型
 */
export type EmailType = (typeof EMAIL_TYPES)[number];

/**
 * HTTPステータスコードの型
 */
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * メールログID
 */
export type EmailLogId = Brand<string, "EmailLogId">;

/**
 * Resend ID
 */
export type ResendId = Brand<string, "ResendId">;

/**
 * エラーメッセージ
 */
export type ErrorMessage = Brand<string, "ErrorMessage">;

// ============================================================================
// 値オブジェクト
// ============================================================================

/**
 * メールタイプ値オブジェクト
 */
export type EmailTypeValue = {
	readonly value: EmailType;
	readonly displayName: string;
	readonly description: string;
	readonly isRetryable: boolean;
	readonly maxRetries: number;
};

/**
 * メールタイプのファクトリ関数
 */
export function createEmailType(type: EmailType): EmailTypeValue {
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
 * HTTPステータス値オブジェクト
 */
export type HttpStatusValue = {
	readonly value: HttpStatus;
	readonly isSuccess: boolean;
	readonly category: "success" | "client_error" | "server_error";
	readonly description: string;
};

/**
 * HTTPステータスのファクトリ関数
 */
export function createHttpStatus(status: HttpStatus): HttpStatusValue {
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
// EmailLogエンティティ
// ============================================================================

/**
 * 新規メールログ作成用のプロパティ
 */
export type NewEmailLogProps = {
	readonly email: Email;
	readonly type: EmailType;
	readonly httpStatus?: HttpStatus;
	readonly resendId?: ResendId | null;
	readonly error?: ErrorMessage | null;
};

/**
 * EmailLogエンティティ
 */
export type EmailLog = {
	readonly id: EmailLogId;
	readonly email: Email;
	readonly type: EmailType;
	readonly httpStatus?: HttpStatus;
	readonly resendId?: ResendId | null;
	readonly error?: ErrorMessage | null;
	readonly createdAt: Timestamp;
};

/**
 * EmailLogエンティティのファクトリ関数
 */
export function createEmailLog(
	props: NewEmailLogProps,
	id: EmailLogId,
	currentTime: Timestamp
): EmailLog {
	return {
		id,
		email: props.email,
		type: props.type,
		httpStatus: props.httpStatus,
		resendId: props.resendId ?? null,
		error: props.error ?? null,
		createdAt: currentTime
	};
}

/**
 * EmailLogエンティティの更新
 */
export function updateEmailLog(
	emailLog: EmailLog,
	updates: Partial<Pick<EmailLog, "httpStatus" | "resendId" | "error">>
): EmailLog {
	return {
		...emailLog,
		...updates
	};
}

// ============================================================================
// ドメインルール
// ============================================================================

/**
 * メール送信が成功したかチェック
 */
export function isEmailSentSuccessfully(emailLog: EmailLog): boolean {
	if (emailLog.error) return false;
	if (emailLog.httpStatus) {
		const statusValue = createHttpStatus(emailLog.httpStatus);
		return statusValue.isSuccess;
	}
	return false;
}

/**
 * メール送信が再試行可能かチェック
 */
export function isEmailRetryable(emailLog: EmailLog): boolean {
	const typeValue = createEmailType(emailLog.type);
	return typeValue.isRetryable;
}

/**
 * メール送信の最大再試行回数を取得
 */
export function getMaxRetries(emailLog: EmailLog): number {
	const typeValue = createEmailType(emailLog.type);
	return typeValue.maxRetries;
}

/**
 * メール送信のカテゴリを取得
 */
export function getEmailCategory(
	emailLog: EmailLog
): "success" | "client_error" | "server_error" | "unknown" {
	if (emailLog.httpStatus) {
		const statusValue = createHttpStatus(emailLog.httpStatus);
		return statusValue.category;
	}
	return "unknown";
}

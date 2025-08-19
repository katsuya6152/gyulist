import type { Brand } from "../../../../shared/brand";
import type { Email, Timestamp } from "./types";

// ============================================================================
// 基本型定義
// ============================================================================

/**
 * メールタイプの定数配列。
 * 登録プロセスで使用されるメールの種類を定義します。
 */
export const EMAIL_TYPES = [
	"completed",
	"verification",
	"reminder",
	"notification"
] as const;

/**
 * メールタイプの型。
 * 定数配列から生成される型安全なメールタイプです。
 */
export type EmailType = (typeof EMAIL_TYPES)[number];

/**
 * HTTPステータスコードの型。
 * メール送信の結果を表現するHTTPステータスコードです。
 */
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502;

// ============================================================================
// Brand型定義
// ============================================================================

/**
 * メールログIDのブランド型。
 * メールログの一意識別子を表現します。
 */
export type EmailLogId = Brand<string, "EmailLogId">;

/**
 * Resend IDのブランド型。
 * Resendサービスでのメール送信IDを表現します。
 */
export type ResendId = Brand<string, "ResendId">;

/**
 * エラーメッセージのブランド型。
 * メール送信時のエラーメッセージを表現します。
 */
export type ErrorMessage = Brand<string, "ErrorMessage">;

// ============================================================================
// 値オブジェクト
// ============================================================================

/**
 * メールタイプ値オブジェクト。
 *
 * メールタイプの表示名、説明、リトライ設定などの情報を管理します。
 */
export type EmailTypeValue = {
	/** メールタイプ値 */ readonly value: EmailType;
	/** 表示名 */ readonly displayName: string;
	/** 説明 */ readonly description: string;
	/** リトライ可能フラグ */ readonly isRetryable: boolean;
	/** 最大リトライ回数 */ readonly maxRetries: number;
};

/**
 * メールタイプのファクトリ関数。
 *
 * メールタイプ値から値オブジェクトを生成します。
 * @param type - メールタイプ
 * @returns メールタイプ値オブジェクト
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
 * HTTPステータス値オブジェクト。
 *
 * HTTPステータスコードとその意味を表現します。
 */
export type HttpStatusValue = {
	/** HTTPステータスコード */ readonly value: HttpStatus;
	/** 成功フラグ */ readonly isSuccess: boolean;
	/** カテゴリ */ readonly category:
		| "success"
		| "client_error"
		| "server_error";
	/** 説明 */ readonly description: string;
};

/**
 * HTTPステータスのファクトリ関数。
 *
 * HTTPステータスコードから値オブジェクトを生成します。
 * @param status - HTTPステータスコード
 * @returns HTTPステータス値オブジェクト
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
 * 新規メールログ作成用のプロパティ。
 *
 * メールログを作成する際に必要な情報を定義します。
 */
export type NewEmailLogProps = {
	/** メールアドレス */ readonly email: Email;
	/** メールタイプ */ readonly type: EmailType;
	/** HTTPステータス */ readonly httpStatus?: HttpStatus;
	/** Resend ID */ readonly resendId?: ResendId | null;
	/** エラーメッセージ */ readonly error?: ErrorMessage | null;
};

/**
 * EmailLogエンティティ。
 *
 * メール送信の履歴を表現します。
 */
export type EmailLog = {
	/** メールログID */ readonly id: EmailLogId;
	/** メールアドレス */ readonly email: Email;
	/** メールタイプ */ readonly type: EmailType;
	/** HTTPステータス */ readonly httpStatus?: HttpStatus;
	/** Resend ID */ readonly resendId?: ResendId | null;
	/** エラーメッセージ */ readonly error?: ErrorMessage | null;
	/** 作成日時 */ readonly createdAt: Timestamp;
};

/**
 * EmailLogエンティティのファクトリ関数。
 *
 * 新規メールログを作成します。
 * @param props - 新規メールログのプロパティ
 * @param id - メールログID
 * @param currentTime - 現在時刻
 * @returns 作成されたメールログ
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
 * EmailLogエンティティの更新。
 *
 * メールログの一部のプロパティを更新します。
 * @param emailLog - 更新対象のメールログ
 * @param updates - 更新するプロパティ
 * @returns 更新後のメールログ
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
 * メール送信が成功したかチェック。
 *
 * メールログにエラーがなく、HTTPステータスが成功コードであるかを確認します。
 * @param emailLog - メールログ
 * @returns 成功した場合はtrue、それ以外はfalse
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
 * メール送信が再試行可能かチェック。
 *
 * メールタイプのリトライ設定に基づいて、メール送信が再試行可能かを判断します。
 * @param emailLog - メールログ
 * @returns 再試行可能な場合はtrue、それ以外はfalse
 */
export function isEmailRetryable(emailLog: EmailLog): boolean {
	const typeValue = createEmailType(emailLog.type);
	return typeValue.isRetryable;
}

/**
 * メール送信の最大再試行回数を取得。
 *
 * メールタイプのリトライ設定から最大再試行回数を取得します。
 * @param emailLog - メールログ
 * @returns 最大再試行回数
 */
export function getMaxRetries(emailLog: EmailLog): number {
	const typeValue = createEmailType(emailLog.type);
	return typeValue.maxRetries;
}

/**
 * メール送信のカテゴリを取得。
 *
 * HTTPステータスコードに基づいて、メール送信のカテゴリを判断します。
 * @param emailLog - メールログ
 * @returns カテゴリ（success, client_error, server_error, unknown）
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

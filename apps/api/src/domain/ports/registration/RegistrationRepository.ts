/**
 * Registration Repository Port
 *
 * 事前登録ドメインのリポジトリポート定義
 */

import type { Result } from "../../../shared/result";
import type { RegistrationError } from "../../errors/registration/RegistrationErrors";
import type {
	Email,
	EmailLog,
	EmailLogId,
	NewEmailLogProps,
	ReferralSource,
	Registration,
	RegistrationId,
	RegistrationStatus
} from "../../types/registration";

// ============================================================================
// Search Parameters
// ============================================================================

export type SearchRegistrationsParams = Readonly<{
	/** 検索クエリ */
	query?: string;
	/** 開始日時 */
	fromDate?: Date;
	/** 終了日時 */
	toDate?: Date;
	/** 紹介元フィルタ */
	referralSource?: string;
	/** 取得件数 */
	limit: number;
	/** オフセット */
	offset: number;
}>;

export type SearchRegistrationsResult = Readonly<{
	/** 検索結果 */
	items: Registration[];
	/** 総件数 */
	total: number;
}>;

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * 事前登録リポジトリポート
 *
 * 事前登録の永続化、検索、更新などの操作を提供します。
 * Result型を使用して統一されたエラーハンドリングを実現します。
 */
export interface RegistrationRepository {
	/**
	 * メールアドレスで登録を検索します
	 * @param email - メールアドレス
	 * @returns 成功時は登録（見つからない場合はnull）、失敗時はRegistrationError
	 */
	findByEmail(
		email: string
	): Promise<Result<Registration | null, RegistrationError>>;

	/**
	 * IDで登録を検索します
	 * @param id - 登録ID
	 * @returns 成功時は登録（見つからない場合はnull）、失敗時はRegistrationError
	 */
	findById(
		id: RegistrationId
	): Promise<Result<Registration | null, RegistrationError>>;

	/**
	 * 新規登録を作成します
	 * @param registration - 登録データ
	 * @returns 成功時は作成された登録、失敗時はRegistrationError
	 */
	create(
		registration: Registration
	): Promise<Result<Registration, RegistrationError>>;

	/**
	 * 登録を検索します
	 * @param params - 検索パラメータ
	 * @returns 成功時は検索結果、失敗時はRegistrationError
	 */
	search(
		params: SearchRegistrationsParams
	): Promise<Result<SearchRegistrationsResult, RegistrationError>>;

	/**
	 * 登録ステータスを更新します
	 * @param id - 登録ID
	 * @param status - 新しいステータス
	 * @param reason - 更新理由（オプション）
	 * @returns 成功時は更新された登録、失敗時はRegistrationError
	 */
	updateStatus(
		id: RegistrationId,
		status: RegistrationStatus,
		reason?: string
	): Promise<Result<Registration, RegistrationError>>;

	/**
	 * 紹介元を更新します
	 * @param id - 登録ID
	 * @param referralSource - 新しい紹介元
	 * @returns 成功時は更新された登録、失敗時はRegistrationError
	 */
	updateReferralSource(
		id: RegistrationId,
		referralSource: ReferralSource | null
	): Promise<Result<Registration, RegistrationError>>;

	/**
	 * 登録を削除します
	 * @param id - 登録ID
	 * @returns 成功時はvoid、失敗時はRegistrationError
	 */
	delete(id: RegistrationId): Promise<Result<void, RegistrationError>>;

	/**
	 * メールログを作成します
	 * @param emailLog - メールログデータ
	 * @returns 成功時は作成されたメールログ、失敗時はRegistrationError
	 */
	createEmailLog(
		emailLog: EmailLog
	): Promise<Result<EmailLog, RegistrationError>>;

	/**
	 * メールログを検索します
	 * @param email - メールアドレス
	 * @param limit - 取得件数
	 * @returns 成功時はメールログ一覧、失敗時はRegistrationError
	 */
	findEmailLogsByEmail(
		email: string,
		limit?: number
	): Promise<Result<EmailLog[], RegistrationError>>;
}

// ============================================================================
// Email Service Port
// ============================================================================

/**
 * メール送信サービスポート
 */
export interface EmailService {
	/**
	 * 確認メールを送信します
	 * @param to - 送信先メールアドレス
	 * @param verificationUrl - 確認URL
	 * @returns 成功時はResend ID、失敗時はエラー
	 */
	sendVerificationEmail(
		to: string,
		verificationUrl: string
	): Promise<Result<string, RegistrationError>>;

	/**
	 * 完了通知メールを送信します
	 * @param to - 送信先メールアドレス
	 * @param userName - ユーザー名
	 * @returns 成功時はResend ID、失敗時はエラー
	 */
	sendCompletionEmail(
		to: string,
		userName: string
	): Promise<Result<string, RegistrationError>>;

	/**
	 * リマインダーメールを送信します
	 * @param to - 送信先メールアドレス
	 * @param verificationUrl - 確認URL
	 * @returns 成功時はResend ID、失敗時はエラー
	 */
	sendReminderEmail(
		to: string,
		verificationUrl: string
	): Promise<Result<string, RegistrationError>>;
}

// ============================================================================
// Turnstile Service Port
// ============================================================================

/**
 * Turnstile検証サービスポート
 */
export interface TurnstileService {
	/**
	 * Turnstileトークンを検証します
	 * @param token - Turnstileトークン
	 * @param remoteIp - クライアントIP
	 * @returns 成功時はtrue、失敗時はエラー
	 */
	verify(
		token: string,
		remoteIp?: string
	): Promise<Result<boolean, RegistrationError>>;
}

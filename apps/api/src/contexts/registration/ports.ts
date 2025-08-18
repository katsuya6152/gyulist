import type {
	Email,
	LocaleValue,
	ReferralSource,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "./domain/model/types";

// ============================================================================
// 登録レコード型（インフラ層用）
// ============================================================================

export type RegistrationRecord = {
	id: string;
	email: string;
	referralSource: string | null;
	status: string;
	locale: string;
	createdAt: number;
	updatedAt: number;
};

// ============================================================================
// メールログレコード型（インフラ層用）
// ============================================================================

export type EmailLogRecord = {
	id: string;
	email: string;
	type: string;
	httpStatus?: number;
	resendId?: string | null;
	error?: string | null;
	createdAt: number;
};

// ============================================================================
// 検索パラメータ型
// ============================================================================

export type SearchParams = {
	q?: string;
	from?: number;
	to?: number;
	source?: string;
	limit: number;
	offset: number;
};

// ============================================================================
// 登録リポジトリポート
// ============================================================================

export interface RegistrationRepoPort {
	/**
	 * メールアドレスで登録を検索
	 */
	findByEmail(email: string): Promise<RegistrationRecord | null>;

	/**
	 * 新規登録を挿入
	 */
	insert(reg: RegistrationRecord): Promise<void>;

	/**
	 * 登録を検索
	 */
	search(
		params: SearchParams
	): Promise<{ items: RegistrationRecord[]; total: number }>;

	/**
	 * メールログを挿入
	 */
	insertEmailLog(log: EmailLogRecord): Promise<void>;

	/**
	 * 登録ステータスを更新
	 */
	updateStatus(
		id: string,
		status: string,
		reason?: string
	): Promise<RegistrationRecord>;

	/**
	 * 紹介元を更新
	 */
	updateReferralSource(
		id: string,
		referralSource: string | null
	): Promise<RegistrationRecord>;

	/**
	 * 登録を削除
	 */
	delete(id: string): Promise<void>;
}

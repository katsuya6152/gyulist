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

/**
 * 登録レコード型。
 * データベースに保存される登録の完全なレコードを表現します。
 */
export type RegistrationRecord = {
	/** 登録ID */ id: string;
	/** メールアドレス */ email: string;
	/** 紹介元 */ referralSource: string | null;
	/** 登録ステータス */ status: string;
	/** ロケール */ locale: string;
	/** 作成日時（UNIX timestamp） */ createdAt: number;
	/** 更新日時（UNIX timestamp） */ updatedAt: number;
};

// ============================================================================
// メールログレコード型（インフラ層用）
// ============================================================================

/**
 * メールログレコード型。
 * メール送信の履歴を記録するレコードを表現します。
 */
export type EmailLogRecord = {
	/** ログID */ id: string;
	/** メールアドレス */ email: string;
	/** メールタイプ */ type: string;
	/** HTTPステータスコード */ httpStatus?: number;
	/** Resend ID */ resendId?: string | null;
	/** エラーメッセージ */ error?: string | null;
	/** 作成日時（UNIX timestamp） */ createdAt: number;
};

// ============================================================================
// 検索パラメータ型
// ============================================================================

/**
 * 検索パラメータ型。
 * 登録データの検索条件を定義します。
 */
export type SearchParams = {
	/** 検索クエリ */ q?: string;
	/** 開始日時（UNIX timestamp） */ from?: number;
	/** 終了日時（UNIX timestamp） */ to?: number;
	/** 紹介元フィルタ */ source?: string;
	/** 取得件数 */ limit: number;
	/** オフセット */ offset: number;
};

// ============================================================================
// 登録リポジトリポート
// ============================================================================

/**
 * 登録リポジトリポート。
 *
 * 事前登録の永続化、検索、更新などの操作を提供します。
 * メール送信ログの記録も含みます。
 */
export interface RegistrationRepoPort {
	/**
	 * メールアドレスで登録を検索します。
	 * @param email - メールアドレス
	 * @returns 見つからない場合は null
	 */
	findByEmail(email: string): Promise<RegistrationRecord | null>;

	/**
	 * 新規登録を挿入します。
	 * @param reg - 登録レコード
	 */
	insert(reg: RegistrationRecord): Promise<void>;

	/**
	 * 登録を検索します。
	 * @param params - 検索パラメータ
	 * @returns 検索結果と総件数
	 */
	search(
		params: SearchParams
	): Promise<{ items: RegistrationRecord[]; total: number }>;

	/**
	 * メールログを挿入します。
	 * @param log - メールログレコード
	 */
	insertEmailLog(log: EmailLogRecord): Promise<void>;

	/**
	 * 登録ステータスを更新します。
	 * @param id - 登録ID
	 * @param status - 新しいステータス
	 * @param reason - 更新理由（オプション）
	 * @returns 更新された登録レコード
	 */
	updateStatus(
		id: string,
		status: string,
		reason?: string
	): Promise<RegistrationRecord>;

	/**
	 * 紹介元を更新します。
	 * @param id - 登録ID
	 * @param referralSource - 新しい紹介元
	 * @returns 更新された登録レコード
	 */
	updateReferralSource(
		id: string,
		referralSource: string | null
	): Promise<RegistrationRecord>;

	/**
	 * 登録を削除します。
	 * @param id - 登録ID
	 */
	delete(id: string): Promise<void>;
}

import type {
	AlertId,
	AlertSeverity,
	AlertStatus,
	AlertType,
	CattleId,
	Timestamp,
	UserId
} from "./domain/model/types";

// ============================================================================
// 生アラート行型（インフラ層用）
// ============================================================================

/**
 * 生アラート行型。
 * データベースから取得される生のアラートデータを表現します。
 */
export type RawAlertRow = {
	/** 牛ID */ cattleId: number;
	/** 牛名 */ cattleName: string | null;
	/** 耳標番号 */ cattleEarTagNumber: string | null;
	/** 期限日時 */ dueAt: string | null;
};

// ============================================================================
// アラートレコード型（インフラ層用）
// ============================================================================

/**
 * アラートレコード型。
 * データベースに保存されるアラートの完全なレコードを表現します。
 */
export type AlertRecord = {
	/** アラートID */ id: string;
	/** アラートタイプ */ type: string;
	/** 重要度 */ severity: string;
	/** ステータス */ status: string;
	/** 牛ID */ cattleId: number;
	/** 牛名 */ cattleName: string | null;
	/** 耳標番号 */ cattleEarTagNumber: string | null;
	/** 期限日時 */ dueAt: string | null;
	/** メッセージ */ message: string;
	/** 所有者ユーザーID */ ownerUserId: number;
	/** 作成日時（UNIX timestamp） */ createdAt: number;
	/** 更新日時（UNIX timestamp） */ updatedAt: number;
	/** 確認日時（UNIX timestamp） */ acknowledgedAt: number | null;
	/** 解決日時（UNIX timestamp） */ resolvedAt: number | null;
};

// ============================================================================
// 検索パラメータ型
// ============================================================================

/**
 * アラート検索パラメータ。
 * アラートの検索条件を定義します。
 */
export type AlertSearchParams = {
	/** 重要度フィルタ */ severity?: string;
	/** ステータスフィルタ */ status?: string;
	/** 牛IDフィルタ */ cattleId?: number;
	/** 取得件数 */ limit: number;
	/** オフセット */ offset: number;
};

// ============================================================================
// アラートリポジトリポート
// ============================================================================

/**
 * アラートリポジトリポート。
 *
 * アラートの永続化、検索、更新などの操作を提供します。
 * 繁殖管理、健康管理、スケジュール管理などの各種アラートを統合管理します。
 */
export interface AlertsRepoPort {
	/**
	 * 空胎60日以上（AI未実施）の牛を検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param nowIso - 現在日時（ISO8601）
	 * @returns 該当する牛の情報
	 */
	findOpenDaysOver60NoAI(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 60日以内分娩予定の牛を検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param nowIso - 現在日時（ISO8601）
	 * @returns 該当する牛の情報
	 */
	findCalvingWithin60(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 分娩予定日超過の牛を検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param nowIso - 現在日時（ISO8601）
	 * @returns 該当する牛の情報
	 */
	findCalvingOverdue(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 発情から20日以上未妊娠の牛を検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param nowIso - 現在日時（ISO8601）
	 * @returns 該当する牛の情報
	 */
	findEstrusOver20NotPregnant(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * アラートを検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param params - 検索パラメータ
	 * @returns 検索結果と総件数
	 */
	search(
		ownerUserId: number,
		params: AlertSearchParams
	): Promise<{ items: AlertRecord[]; total: number }>;

	/**
	 * アラートをIDで取得します。
	 * @param id - アラートID
	 * @returns 見つからない場合は null
	 */
	findById(id: string): Promise<AlertRecord | null>;

	/**
	 * アラートを作成します。
	 * @param alert - アラートレコード
	 */
	create(alert: AlertRecord): Promise<void>;

	/**
	 * アラートを更新します。
	 * @param id - アラートID
	 * @param updates - 更新データ
	 * @returns 更新されたアラートレコード
	 */
	update(id: string, updates: Partial<AlertRecord>): Promise<AlertRecord>;

	/**
	 * アラートを削除します。
	 * @param id - アラートID
	 */
	delete(id: string): Promise<void>;

	/**
	 * アラートステータスを更新します。
	 * @param id - アラートID
	 * @param status - 新しいステータス
	 * @param reason - 更新理由（オプション）
	 * @returns 更新されたアラートレコード
	 */
	updateStatus(
		id: string,
		status: string,
		reason?: string
	): Promise<AlertRecord>;

	/**
	 * アラート重要度を更新します。
	 * @param id - アラートID
	 * @param severity - 新しい重要度
	 * @param reason - 更新理由（オプション）
	 * @returns 更新されたアラートレコード
	 */
	updateSeverity(
		id: string,
		severity: string,
		reason?: string
	): Promise<AlertRecord>;
}

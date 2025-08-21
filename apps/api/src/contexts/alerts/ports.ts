import type { Result } from "@/shared/result";
import type { AlertsDomainError } from "./domain/errors";
import type { Alert, AlertHistory } from "./domain/model";
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

	// ============================================================================
	// 新規追加メソッド
	// ============================================================================

	/**
	 * ユーザーのアクティブなアラートを取得します。
	 * @param userId - ユーザーID
	 * @returns アクティブなアラート一覧
	 */
	findActiveAlertsByUserId(userId: number): Promise<Alert[]>;

	/**
	 * アラートIDでアラートを取得します。
	 * @param alertId - アラートID
	 * @returns アラート、見つからない場合はnull
	 */
	findAlertById(alertId: AlertId): Promise<Alert | null>;

	/**
	 * アラートのステータスを更新します。
	 * @param alertId - アラートID
	 * @param newStatus - 新しいステータス
	 * @param currentTime - 現在時刻
	 * @returns 更新されたアラート
	 */
	updateAlertStatus(
		alertId: AlertId,
		newStatus: AlertStatus,
		currentTime: Timestamp
	): Promise<Result<Alert, AlertsDomainError>>;

	/**
	 * アラートのメモを更新します。
	 * @param alertId - アラートID
	 * @param memo - 新しいメモ
	 * @param currentTime - 現在時刻
	 * @returns 更新されたアラート
	 */
	updateAlertMemo(
		alertId: AlertId,
		memo: string,
		currentTime: Timestamp
	): Promise<Result<Alert, AlertsDomainError>>;

	/**
	 * 新規アラートを作成します。
	 * @param alert - 作成するアラート
	 * @returns 作成結果
	 */
	createAlert(alert: Alert): Promise<Result<Alert, AlertsDomainError>>;

	/**
	 * アラート履歴を追加します。
	 * @param history - 追加するアラート履歴
	 * @returns 追加結果
	 */
	addAlertHistory(
		history: AlertHistory
	): Promise<Result<void, AlertsDomainError>>;

	/**
	 * ユーザーのアラートを生成します。
	 * @param userId - ユーザーID
	 * @param nowIso - 現在日時（ISO8601）
	 * @returns 生成されたアラート一覧
	 */
	generateAlertsForUser(
		userId: number,
		nowIso: string
	): Promise<Result<Alert[], AlertsDomainError>>;

	/**
	 * アラートテーブルから重複除去したユーザーID一覧を取得します。
	 * @returns ユーザーID一覧
	 */
	findDistinctUserIds(): Promise<UserId[]>;

	/**
	 * アラートテーブルからユーザーIDを取得するフォールバックメソッド。
	 * @returns ユーザーID一覧
	 */
	findDistinctUserIdsFallback(): Promise<UserId[]>;

	/**
	 * 特定の牛に関連するアラートを取得します。
	 * @param cattleId - 牛ID
	 * @param userId - ユーザーID
	 * @returns アラート一覧
	 */
	listByCattleId(cattleId: CattleId, userId: UserId): Promise<Alert[]>;
}

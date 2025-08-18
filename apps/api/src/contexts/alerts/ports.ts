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

export type RawAlertRow = {
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
};

// ============================================================================
// アラートレコード型（インフラ層用）
// ============================================================================

export type AlertRecord = {
	id: string;
	type: string;
	severity: string;
	status: string;
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
	message: string;
	ownerUserId: number;
	createdAt: number;
	updatedAt: number;
	acknowledgedAt: number | null;
	resolvedAt: number | null;
};

// ============================================================================
// 検索パラメータ型
// ============================================================================

export type AlertSearchParams = {
	severity?: string;
	status?: string;
	cattleId?: number;
	limit: number;
	offset: number;
};

// ============================================================================
// アラートリポジトリポート
// ============================================================================

export interface AlertsRepoPort {
	/**
	 * 空胎60日以上（AI未実施）の牛を検索
	 */
	findOpenDaysOver60NoAI(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 60日以内分娩予定の牛を検索
	 */
	findCalvingWithin60(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 分娩予定日超過の牛を検索
	 */
	findCalvingOverdue(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * 発情から20日以上未妊娠の牛を検索
	 */
	findEstrusOver20NotPregnant(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;

	/**
	 * アラートを検索
	 */
	search(
		ownerUserId: number,
		params: AlertSearchParams
	): Promise<{ items: AlertRecord[]; total: number }>;

	/**
	 * アラートをIDで取得
	 */
	findById(id: string): Promise<AlertRecord | null>;

	/**
	 * アラートを作成
	 */
	create(alert: AlertRecord): Promise<void>;

	/**
	 * アラートを更新
	 */
	update(id: string, updates: Partial<AlertRecord>): Promise<AlertRecord>;

	/**
	 * アラートを削除
	 */
	delete(id: string): Promise<void>;

	/**
	 * アラートステータスを更新
	 */
	updateStatus(
		id: string,
		status: string,
		reason?: string
	): Promise<AlertRecord>;

	/**
	 * アラート重要度を更新
	 */
	updateSeverity(
		id: string,
		severity: string,
		reason?: string
	): Promise<AlertRecord>;
}

/**
 * Alert Repository Port
 *
 * アラート管理ドメインのリポジトリインターフェース定義
 */

import type { AlertId, CattleId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { AlertError } from "../../errors/alerts/AlertErrors";
import type {
	Alert,
	AlertSearchCriteria,
	AlertSearchResult,
	AlertSeverity,
	AlertStats,
	AlertStatus,
	AlertType,
	NewAlertProps
} from "../../types/alerts";

/**
 * アラートエンティティのリポジトリポート
 *
 * 永続化、検索、集計、統計などの操作を提供します。
 * 実装はインフラ層（DB等）に委譲されます。
 */
export interface AlertRepository {
	// Basic CRUD operations
	/**
	 * IDでアラートを取得します。
	 * @param alertId - アラートID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 見つからない場合は null
	 */
	findById(
		alertId: AlertId,
		ownerUserId: UserId
	): Promise<Result<Alert | null, AlertError>>;

	/**
	 * 牛IDでアラート一覧を取得します。
	 * @param cattleId - 牛ID
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns アラート一覧
	 */
	listByCattleId(
		cattleId: CattleId,
		ownerUserId: UserId
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 条件検索を行います（ページング対応）。
	 * @param criteria - 検索条件
	 * @returns 検索結果とページング情報
	 */
	search(
		criteria: AlertSearchCriteria
	): Promise<Result<AlertSearchResult, AlertError>>;

	/**
	 * 新規アラートを作成します。
	 * @param alert - アラートエンティティ（IDなし）
	 * @returns 作成されたアラート
	 */
	create(
		alert: Omit<Alert, "id" | "createdAt" | "updatedAt">
	): Promise<Result<Alert, AlertError>>;

	/**
	 * アラートを更新します。
	 * @param alertId - アラートID
	 * @param updates - 更新データ
	 * @param ownerUserId - 所有者ユーザーID（権限チェック用）
	 * @returns 更新されたアラート
	 */
	update(
		alertId: AlertId,
		updates: Partial<Alert>,
		ownerUserId: UserId
	): Promise<Result<Alert, AlertError>>;

	/**
	 * アラートを削除します。
	 * @param alertId - アラートID
	 * @param ownerUserId - 所有者ユーザーID（権限チェック用）
	 */
	delete(
		alertId: AlertId,
		ownerUserId: UserId
	): Promise<Result<void, AlertError>>;

	// Specialized queries
	/**
	 * アクティブなアラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param limit - 取得件数
	 * @returns アクティブアラート一覧
	 */
	findActiveAlerts(
		ownerUserId: UserId,
		limit?: number
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 重要度でフィルタしたアラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param severity - 重要度
	 * @param limit - 取得件数
	 * @returns 指定重要度のアラート一覧
	 */
	findBySeverity(
		ownerUserId: UserId,
		severity: AlertSeverity,
		limit?: number
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * アラートタイプでフィルタしたアラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param alertType - アラートタイプ
	 * @param limit - 取得件数
	 * @returns 指定タイプのアラート一覧
	 */
	findByType(
		ownerUserId: UserId,
		alertType: AlertType,
		limit?: number
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 期限が近いアラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param daysThreshold - 期限までの日数閾値
	 * @param limit - 取得件数
	 * @returns 期限が近いアラート一覧
	 */
	findDueSoon(
		ownerUserId: UserId,
		daysThreshold: number,
		limit?: number
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 期限超過アラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param limit - 取得件数
	 * @returns 期限超過アラート一覧
	 */
	findOverdue(
		ownerUserId: UserId,
		limit?: number
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 指定期間内のアラート一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param startDate - 開始日
	 * @param endDate - 終了日
	 * @param statuses - ステータスフィルタ（オプション）
	 * @returns 期間内のアラート一覧
	 */
	findByDateRange(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date,
		statuses?: AlertStatus[]
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * アラート統計を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param startDate - 集計開始日
	 * @param endDate - 集計終了日
	 * @returns アラート統計
	 */
	getAlertStats(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date
	): Promise<Result<AlertStats, AlertError>>;

	// Batch operations
	/**
	 * 複数のアラートのステータスを一括更新します。
	 * @param alertIds - アラートID一覧
	 * @param newStatus - 新しいステータス
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 更新件数
	 */
	batchUpdateStatus(
		alertIds: AlertId[],
		newStatus: AlertStatus,
		ownerUserId: UserId
	): Promise<Result<number, AlertError>>;

	/**
	 * 指定条件のアラートを一括削除します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param criteria - 削除条件
	 * @returns 削除件数
	 */
	batchDelete(
		ownerUserId: UserId,
		criteria: {
			status?: AlertStatus[];
			olderThan?: Date;
			cattleIds?: CattleId[];
		}
	): Promise<Result<number, AlertError>>;

	// Specialized alert type queries
	/**
	 * 空胎60日以上（AI未実施）のアラートを検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 該当アラート一覧
	 */
	findOpenDaysOver60NoAI(
		ownerUserId: UserId
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 60日以内分娩予定のアラートを検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 該当アラート一覧
	 */
	findCalvingWithin60(
		ownerUserId: UserId
	): Promise<Result<Alert[], AlertError>>;

	/**
	 * 分娩予定日超過のアラートを検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 該当アラート一覧
	 */
	findCalvingOverdue(ownerUserId: UserId): Promise<Result<Alert[], AlertError>>;

	/**
	 * 発情から20日以上未妊娠のアラートを検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 該当アラート一覧
	 */
	findEstrusOver20NotPregnant(
		ownerUserId: UserId
	): Promise<Result<Alert[], AlertError>>;
}

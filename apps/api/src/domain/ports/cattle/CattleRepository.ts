/**
 * Cattle Repository Port
 *
 * 牛管理ドメインのリポジトリインターフェース定義
 */

import type { CattleId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { CattleError } from "../../errors/cattle/CattleErrors";
import type {
	Cattle,
	CattleSearchCriteria,
	NewCattleProps
} from "../../types/cattle";

/**
 * 牛エンティティのリポジトリポート
 *
 * 永続化、検索、集計、状態履歴などの操作を提供します。
 * 実装はインフラ層（DB等）に委譲されます。
 */
export interface CattleRepository {
	// Basic CRUD operations
	/**
	 * IDで牛を取得します。
	 * @param id - 牛ID
	 * @returns 見つからない場合は null
	 */
	findById(id: CattleId): Promise<Result<Cattle | null, CattleError>>;

	findByIds(ids: CattleId[]): Promise<Result<Cattle[], CattleError>>;

	findByIdentificationNumber(
		ownerUserId: UserId,
		identificationNumber: number
	): Promise<Result<Cattle | null, CattleError>>;

	// Search and query operations
	/**
	 * 条件検索を行います（ページング対応）。
	 * @param criteria - 検索条件
	 * @returns 条件に一致する牛一覧
	 */
	search(
		criteria: CattleSearchCriteria & {
			cursor?: {
				id: number;
				value: string | number;
			};
			limit: number;
			sortBy: "id" | "name" | "days_old" | "days_open";
			sortOrder: "asc" | "desc";
			hasAlert?: boolean;
			minAge?: number;
			maxAge?: number;
			barn?: string;
			breed?: string;
		}
	): Promise<Result<Cattle[], CattleError>>;

	/**
	 * 条件検索の総件数を返します（ページング用）。
	 */
	searchCount(
		criteria: CattleSearchCriteria
	): Promise<Result<number, CattleError>>;

	// Aggregate operations
	/** 新規作成 */
	create(props: NewCattleProps): Promise<Result<Cattle, CattleError>>;

	/** 部分更新 */
	update(
		id: CattleId,
		updates: Partial<NewCattleProps>
	): Promise<Result<Cattle, CattleError>>;

	/** 削除 */
	delete(id: CattleId): Promise<Result<void, CattleError>>;

	// Status and history tracking
	/**
	 * 状態を更新し、履歴行を追加します。
	 * @param id - 牛ID
	 * @param newStatus - 新しい状態
	 * @param changedBy - 操作者
	 * @param reason - 理由（任意）
	 */
	updateStatus(
		id: CattleId,
		newStatus: NonNullable<Cattle["status"]>,
		changedBy: UserId,
		reason?: string | null
	): Promise<Result<Cattle, CattleError>>;

	getStatusHistory(
		cattleId: CattleId,
		limit?: number
	): Promise<
		Result<
			Array<{
				/** 変更前の状態 */ oldStatus: Cattle["status"] | null;
				/** 変更後の状態 */ newStatus: NonNullable<Cattle["status"]>;
				/** 操作者 */ changedBy: UserId;
				/** 理由 */ reason: string | null;
				/** 変更日時 */ changedAt: Date;
			}>,
			CattleError
		>
	>;

	// Statistics and reporting
	/** ステータス別件数 */
	countByStatus(
		ownerUserId: UserId
	): Promise<
		Result<Array<{ status: Cattle["status"]; count: number }>, CattleError>
	>;

	getAgeDistribution(
		ownerUserId: UserId
	): Promise<Result<Array<{ ageRange: string; count: number }>, CattleError>>;

	getBreedDistribution(
		ownerUserId: UserId
	): Promise<Result<Array<{ breed: string; count: number }>, CattleError>>;

	// Health and maintenance
	getCattleNeedingAttention(
		ownerUserId: UserId,
		currentDate: Date
	): Promise<
		Result<
			Array<{
				/** 対象牛 */ cattle: Cattle;
				/** 注意喚起の理由 */ reasons: string[];
			}>,
			CattleError
		>
	>;

	// Batch operations
	batchUpdate(
		updates: Array<{
			/** 牛ID */ id: CattleId;
			/** 更新内容 */ updates: Partial<NewCattleProps>;
		}>
	): Promise<Result<Cattle[], CattleError>>;

	// Optimistic concurrency control
	updateWithVersion(
		id: CattleId,
		updates: Partial<NewCattleProps>,
		expectedVersion: number
	): Promise<Result<Cattle, CattleError>>;
}

/**
 * 牛詳細のリードモデル取得用ポート（Projection）
 *
 * 詳細画面に必要な関連情報（血統、母情報、繁殖状態、サマリ等）を集約して取得します。
 */
export interface CattleDetailsQuery {
	/** 血統情報を取得 */
	getBloodline(cattleId: CattleId): Promise<
		Result<
			{
				bloodlineId: number;
				cattleId: number;
				fatherCattleName: string | null;
				motherFatherCattleName: string | null;
				motherGrandFatherCattleName: string | null;
				motherGreatGrandFatherCattleName: string | null;
			} | null,
			CattleError
		>
	>;

	/** 母情報を取得 */
	getMotherInfo(cattleId: CattleId): Promise<
		Result<
			{
				motherInfoId: number;
				cattleId: number;
				motherCattleId: number;
				motherName: string | null;
				motherIdentificationNumber: string | null;
				motherScore: number | null;
			} | null,
			CattleError
		>
	>;

	/** 繁殖状態を取得 */
	getBreedingStatus(cattleId: CattleId): Promise<
		Result<
			{
				breedingStatusId: number;
				cattleId: number;
				parity: number | null;
				expectedCalvingDate: string | null;
				scheduledPregnancyCheckDate: string | null;
				daysAfterCalving: number | null;
				daysOpen: number | null;
				pregnancyDays: number | null;
				daysAfterInsemination: number | null;
				inseminationCount: number | null;
				breedingMemo: string | null;
				isDifficultBirth: boolean | null;
				createdAt: string;
				updatedAt: string;
			} | null,
			CattleError
		>
	>;

	/** 繁殖サマリを取得 */
	getBreedingSummary(cattleId: CattleId): Promise<
		Result<
			{
				breedingSummaryId: number;
				cattleId: number;
				totalInseminationCount: number | null;
				averageDaysOpen: number | null;
				averagePregnancyPeriod: number | null;
				averageCalvingInterval: number | null;
				difficultBirthCount: number | null;
				pregnancyHeadCount: number | null;
				pregnancySuccessRate: number | null;
				createdAt: string;
				updatedAt: string;
			} | null,
			CattleError
		>
	>;
}

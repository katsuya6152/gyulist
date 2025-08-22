import type { CattleId, UserId } from "../../shared/brand";
import type { Cattle, NewCattleProps } from "./domain/model/cattle";

/**
 * 牛エンティティのリポジトリポート。
 *
 * 永続化、検索、集計、状態履歴などの操作を提供します。
 * 実装はインフラ層（DB等）に委譲されます。
 */
export interface CattleRepoPort {
	// Basic CRUD operations
	/**
	 * IDで牛を取得します。
	 * @param id - 牛ID
	 * @returns 見つからない場合は null
	 */
	findById(id: CattleId): Promise<Cattle | null>;
	findByIds(ids: CattleId[]): Promise<Cattle[]>;
	findByIdentificationNumber(
		ownerUserId: UserId,
		identificationNumber: number
	): Promise<Cattle | null>;

	// Search and query operations
	/**
	 * 条件検索を行います（ページング対応）。
	 * @param q - 検索条件
	 * @returns 条件に一致する牛一覧
	 */
	search(q: {
		/** 所有ユーザーID（必須） */ ownerUserId: UserId;
		/** カーソル（前回の最後の `id` とソート値） */ cursor?: {
			id: number;
			value: string | number;
		};
		/** 取得件数（1ページ） */ limit: number;
		/** ソートキー */ sortBy:
			| "id"
			| "name"
			| "days_old"
			| "days_open"
			| "created_at"
			| "updated_at";
		/** ソート順序 */ sortOrder: "asc" | "desc";
		/** 名前・耳標などのキーワード検索 */ search?: string;
		/** 成長段階フィルタ */ growthStage?: string[];
		/** 性別フィルタ */ gender?: string[];
		/** 状態フィルタ */ status?: string[];
		/** アラート有無フィルタ */ hasAlert?: boolean;
		/** 最小年齢（日齢換算可） */ minAge?: number;
		/** 最大年齢（日齢換算可） */ maxAge?: number;
		/** 牛舎フィルタ */ barn?: string;
		/** 品種フィルタ */ breed?: string;
	}): Promise<Cattle[]>;

	/**
	 * 条件検索の総件数を返します（ページング用）。
	 */
	searchCount(q: {
		/** 所有ユーザーID（必須） */ ownerUserId: UserId;
		/** キーワード */ search?: string;
		/** 成長段階フィルタ */ growthStage?: string[];
		/** 性別フィルタ */ gender?: string[];
		/** 状態フィルタ */ status?: string[];
		/** 最小年齢 */ minAge?: number;
		/** 最大年齢 */ maxAge?: number;
		/** 牛舎フィルタ */ barn?: string;
		/** 品種フィルタ */ breed?: string;
	}): Promise<number>;

	// Aggregate operations
	/** 新規作成 */
	create(props: NewCattleProps): Promise<Cattle>;
	/** 部分更新 */
	update(id: CattleId, updates: Partial<NewCattleProps>): Promise<Cattle>;
	/** 削除 */
	delete(id: CattleId): Promise<void>;

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
	): Promise<Cattle>;

	getStatusHistory(
		cattleId: CattleId,
		limit?: number
	): Promise<
		Array<{
			/** 変更前の状態 */ oldStatus: Cattle["status"] | null;
			/** 変更後の状態 */ newStatus: NonNullable<Cattle["status"]>;
			/** 操作者 */ changedBy: UserId;
			/** 理由 */ reason: string | null;
			/** 変更日時 */ changedAt: Date;
		}>
	>;

	// Statistics and reporting
	/** ステータス別件数 */
	countByStatus(
		ownerUserId: UserId
	): Promise<Array<{ status: Cattle["status"]; count: number }>>;

	getAgeDistribution(
		ownerUserId: UserId
	): Promise<Array<{ ageRange: string; count: number }>>;

	getBreedDistribution(
		ownerUserId: UserId
	): Promise<Array<{ breed: string; count: number }>>;

	// Health and maintenance
	getCattleNeedingAttention(
		ownerUserId: UserId,
		currentDate: Date
	): Promise<
		Array<{
			/** 対象牛 */ cattle: Cattle;
			/** 注意喚起の理由 */ reasons: string[];
		}>
	>;

	// Batch operations
	batchUpdate(
		updates: Array<{
			/** 牛ID */ id: CattleId;
			/** 更新内容 */ updates: Partial<NewCattleProps>;
		}>
	): Promise<Cattle[]>;

	// Optimistic concurrency control
	updateWithVersion(
		id: CattleId,
		updates: Partial<NewCattleProps>,
		expectedVersion: number
	): Promise<Cattle>;

	// Legacy methods still used by some routes (will be removed in future FDM refactoring)
	appendStatusHistory(e: {
		cattleId: CattleId;
		oldStatus?: import("./domain/model/cattle").Cattle["status"] | null;
		newStatus: NonNullable<import("./domain/model/cattle").Cattle["status"]>;
		changedBy: UserId;
		reason?: string | null;
	}): Promise<void>;
}

/**
 * 牛詳細のリードモデル取得用ポート（Projection）。
 *
 * 詳細画面に必要な関連情報（血統、母情報、繁殖状態、サマリ等）を集約して取得します。
 */
export interface CattleDetailsQueryPort {
	/** 血統情報を取得 */
	getBloodline(cattleId: CattleId): Promise<{
		/** 血統ID */ bloodlineId: number;
		/** 牛ID */ cattleId: number;
		/** 父名 */ fatherCattleName: string | null;
		/** 母方父名 */ motherFatherCattleName: string | null;
		/** 母方祖父名 */ motherGrandFatherCattleName: string | null;
		/** 母方曾祖父名 */ motherGreatGrandFatherCattleName: string | null;
	} | null>;

	/** 母情報を取得 */
	getMotherInfo(cattleId: CattleId): Promise<{
		/** 母情報ID */ motherInfoId: number;
		/** 牛ID */ cattleId: number;
		/** 母牛ID */ motherCattleId: number;
		/** 母名 */ motherName: string | null;
		/** 母牛の個体識別番号 */ motherIdentificationNumber: string | null;
		/** 母牛の評価スコア */ motherScore: number | null;
	} | null>;

	/** 繁殖状態を取得 */
	getBreedingStatus(cattleId: CattleId): Promise<{
		/** 繁殖状態ID */ breedingStatusId: number;
		/** 牛ID */ cattleId: number;
		/** 産次 */ parity: number | null;
		/** 予定分娩日 */ expectedCalvingDate: string | null;
		/** 予定妊娠確認日 */ scheduledPregnancyCheckDate: string | null;
		/** 分娩後日数 */ daysAfterCalving: number | null;
		/** 空胎日数 */ daysOpen: number | null;
		/** 妊娠日数 */ pregnancyDays: number | null;
		/** 授精後日数 */ daysAfterInsemination: number | null;
		/** 授精回数 */ inseminationCount: number | null;
		/** 繁殖メモ */ breedingMemo: string | null;
		/** 難産フラグ */ isDifficultBirth: boolean | null;
		/** 作成日時 */ createdAt: string;
		/** 更新日時 */ updatedAt: string;
	} | null>;

	/** 繁殖サマリを取得 */
	getBreedingSummary(cattleId: CattleId): Promise<{
		/** 繁殖サマリID */ breedingSummaryId: number;
		/** 牛ID */ cattleId: number;
		/** 総授精回数 */ totalInseminationCount: number | null;
		/** 平均空胎日数 */ averageDaysOpen: number | null;
		/** 平均妊娠期間 */ averagePregnancyPeriod: number | null;
		/** 平均分娩間隔 */ averageCalvingInterval: number | null;
		/** 難産回数 */ difficultBirthCount: number | null;
		/** 妊娠頭数 */ pregnancyHeadCount: number | null;
		/** 妊娠成功率（%） */ pregnancySuccessRate: number | null;
		/** 作成日時 */ createdAt: string;
		/** 更新日時 */ updatedAt: string;
	} | null>;
}

import type { CattleId } from "../../shared/brand";
import type { BreedingAggregate } from "../cattle/domain/model/breedingAggregate";
import type { BreedingEvent } from "../cattle/domain/model/breedingStatus";

/**
 * 繁殖リポジトリポート。
 *
 * 繁殖集約の永続化、イベント履歴、統計情報の取得を提供します。
 */
export interface BreedingRepoPort {
	// Aggregate operations
	/**
	 * 牛IDで繁殖集約を取得します。
	 * @param cattleId - 牛ID
	 * @returns 見つからない場合は null
	 */
	findByCattleId(cattleId: CattleId): Promise<BreedingAggregate | null>;

	/**
	 * 繁殖集約を保存します。
	 * @param aggregate - 繁殖集約
	 * @returns 保存された繁殖集約
	 */
	save(aggregate: BreedingAggregate): Promise<void>;

	/**
	 * 繁殖集約を削除します。
	 * @param cattleId - 牛ID
	 */
	delete(cattleId: CattleId): Promise<void>;

	// Event history operations
	/**
	 * 繁殖イベント履歴を取得します。
	 * @param cattleId - 牛ID
	 * @param startDate - 開始日（オプション）
	 * @param endDate - 終了日（オプション）
	 * @returns 繁殖イベント履歴
	 */
	getBreedingHistory(
		cattleId: CattleId,
		startDate?: Date,
		endDate?: Date
	): Promise<BreedingEvent[]>;

	/**
	 * 繁殖イベントを追加します。
	 * @param cattleId - 牛ID
	 * @param event - 繁殖イベント
	 */
	appendBreedingEvent(cattleId: CattleId, event: BreedingEvent): Promise<void>;

	// Query operations
	/**
	 * 注意が必要な牛のID一覧を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param currentDate - 現在日時
	 * @returns 注意が必要な牛のID一覧
	 */
	findCattleNeedingAttention(
		ownerUserId: import("../../shared/brand").UserId,
		currentDate: Date
	): Promise<CattleId[]>;

	/**
	 * 繁殖統計情報を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param startDate - 開始日
	 * @param endDate - 終了日
	 * @returns 繁殖統計情報
	 */
	getBreedingStatistics(
		ownerUserId: import("../../shared/brand").UserId,
		startDate: Date,
		endDate: Date
	): Promise<{
		/** 総授精回数 */ totalInseminations: number;
		/** 総妊娠数 */ totalPregnancies: number;
		/** 総分娩数 */ totalCalvings: number;
		/** 平均妊娠率 */ averagePregnancyRate: number;
		/** 難産率 */ difficultBirthRate: number;
	}>;

	/**
	 * 繁殖状態の日数を更新します（バッチ処理用）。
	 * @param cattleId - 牛ID
	 * @param currentTime - 現在時刻
	 */
	updateBreedingStatusDays(
		cattleId: CattleId,
		currentTime: Date
	): Promise<void>;

	/** データベースの繁殖状態生データを取得 */
	getBreedingStatusRow(cattleId: CattleId): Promise<{
		breedingStatusId: number;
		cattleId: number;
		breedingMemo: string | null;
		isDifficultBirth: boolean | null;
		createdAt: string | null;
		updatedAt: string | null;
	} | null>;
	/** データベースの繁殖統計生データを取得 */
	getBreedingSummaryRow(cattleId: CattleId): Promise<{
		breedingSummaryId: number;
		cattleId: number;
		createdAt: string | null;
		updatedAt: string | null;
	} | null>;
}

/**
 * 血統リポジトリポート。
 *
 * 血統情報の永続化、検索を提供します。
 */
export interface BloodlineRepoPort {
	/**
	 * 牛IDで血統情報を取得します。
	 * @param cattleId - 牛ID
	 * @returns 見つからない場合は null
	 */
	findByCattleId(
		cattleId: CattleId
	): Promise<import("../cattle/domain/model/bloodline").Bloodline | null>;

	/**
	 * 血統情報を保存します。
	 * @param cattleId - 牛ID
	 * @param bloodline - 血統情報
	 */
	save(
		cattleId: CattleId,
		bloodline: import("../cattle/domain/model/bloodline").Bloodline
	): Promise<void>;

	/**
	 * 血統情報を削除します。
	 * @param cattleId - 牛ID
	 */
	delete(cattleId: CattleId): Promise<void>;

	// Query operations
	/**
	 * 血統条件で牛を検索します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @param searchCriteria - 検索条件
	 * @returns 条件に一致する牛のID一覧
	 */
	searchByBloodline(
		ownerUserId: import("../../shared/brand").UserId,
		searchCriteria: {
			/** 父名 */ fatherName?: string;
			/** 母方父名 */ motherFatherName?: string;
			/** 母方祖父名 */ motherGrandFatherName?: string;
			/** 母方曾祖父名 */ motherGreatGrandFatherName?: string;
		}
	): Promise<CattleId[]>;
}

/**
 * 母情報リポジトリポート。
 *
 * 母牛情報の永続化、検索を提供します。
 */
export interface MotherInfoRepoPort {
	/**
	 * 牛IDで母情報を取得します。
	 * @param cattleId - 牛ID
	 * @returns 見つからない場合は null
	 */
	findByCattleId(
		cattleId: CattleId
	): Promise<import("../cattle/domain/model/motherInfo").MotherInfo | null>;

	/**
	 * 母情報を保存します。
	 * @param cattleId - 牛ID
	 * @param motherInfo - 母情報
	 */
	save(
		cattleId: CattleId,
		motherInfo: import("../cattle/domain/model/motherInfo").MotherInfo
	): Promise<void>;

	/**
	 * 母情報を削除します。
	 * @param cattleId - 牛ID
	 */
	delete(cattleId: CattleId): Promise<void>;

	// Query operations
	/**
	 * 母牛IDで子牛のID一覧を取得します。
	 * @param motherCattleId - 母牛ID
	 * @returns 子牛のID一覧
	 */
	findByMotherCattleId(motherCattleId: CattleId): Promise<CattleId[]>; // Find offspring

	/**
	 * 母情報の充足度を取得します。
	 * @param ownerUserId - 所有者ユーザーID
	 * @returns 牛IDと充足度の一覧
	 */
	getMotherInfoCompleteness(
		ownerUserId: import("../../shared/brand").UserId
	): Promise<
		Array<{
			/** 牛ID */ cattleId: CattleId;
			/** 充足度（%） */ completenessPercentage: number;
		}>
	>;
}

/**
 * KPI Event Entity
 *
 * KPI計算の基となる繁殖イベントエンティティ
 */

import type { CattleId } from "../../../shared/brand";
import type { BreedingEventType, KpiEventId } from "./KpiTypes";

// ============================================================================
// KPI Event Entity
// ============================================================================

/**
 * KPIイベントのメタデータ
 * イベント固有の追加情報を管理
 */
export type KpiEventMetadata = {
	readonly notes?: string | null;
	readonly result?: string | null;
	readonly technician?: string | null;
	readonly location?: string | null;
	readonly equipment?: string | null;
	readonly [key: string]: unknown;
};

/**
 * KPIイベントエンティティ
 *
 * 繁殖指標計算に必要なイベント情報を管理します。
 * 不変性を保ち、ビジネスルールに基づく検証を提供します。
 */
export type KpiEvent = {
	/** イベントID */
	readonly eventId: KpiEventId;
	/** 牛ID */
	readonly cattleId: CattleId;
	/** イベントタイプ */
	readonly eventType: BreedingEventType;
	/** イベント日時 */
	readonly eventDatetime: Date;
	/** メタデータ */
	readonly metadata: KpiEventMetadata;
	/** 作成日時 */
	readonly createdAt: Date;
	/** 更新日時 */
	readonly updatedAt: Date;
};

/**
 * 新規KPIイベント作成時のプロパティ
 */
export type NewKpiEventProps = {
	cattleId: CattleId;
	eventType: BreedingEventType;
	eventDatetime: Date;
	metadata?: KpiEventMetadata;
};

/**
 * KPIイベント更新時のプロパティ
 */
export type UpdateKpiEventProps = Partial<
	Pick<NewKpiEventProps, "eventType" | "eventDatetime" | "metadata">
>;

// ============================================================================
// KPI Event Statistics
// ============================================================================

/**
 * KPIイベントの統計情報
 */
export type KpiEventStats = {
	totalEvents: number;
	eventsByType: Record<BreedingEventType, number>;
	dateRange: {
		from: Date;
		to: Date;
	} | null;
};

/**
 * KPIイベントの検索条件
 */
export type KpiEventSearchCriteria = {
	ownerUserId: import("../../../shared/brand").UserId;
	cattleId?: CattleId;
	eventType?: BreedingEventType;
	startDate?: Date;
	endDate?: Date;
	limit: number;
	cursor?: string;
};

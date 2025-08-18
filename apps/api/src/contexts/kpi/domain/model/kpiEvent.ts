/**
 * KPIイベント - ドメインモデル
 *
 * KPI計算の基となる繁殖イベントを表現するエンティティです。
 * 人工授精、分娩、発情などの繁殖関連イベントを管理します。
 */

import type { CattleId } from "../../../../shared/brand";
import type { BreedingEventType } from "./types";

/**
 * KPIイベントエンティティ
 *
 * 繁殖指標計算に必要なイベント情報を管理します。
 * 不変性を保ち、ビジネスルールに基づく検証を提供します。
 */
export type KpiEvent = {
	readonly eventId: string;
	readonly cattleId: CattleId;
	readonly eventType: BreedingEventType;
	readonly eventDatetime: Date;
	readonly metadata: KpiEventMetadata;
	readonly createdAt: Date;
	readonly updatedAt: Date;
};

/**
 * KPIイベントのメタデータ
 *
 * イベント固有の追加情報を管理します。
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
 * 新規KPIイベント作成時のプロパティ
 */
export type NewKpiEventProps = {
	cattleId: CattleId;
	eventType: BreedingEventType;
	eventDatetime: Date;
	metadata?: KpiEventMetadata;
};

/**
 * KPIイベントの作成
 *
 * 新規イベントを作成し、ドメインルールに基づく検証を実行します。
 */
export function createKpiEvent(
	props: NewKpiEventProps,
	eventId: string,
	currentTime: Date
): KpiEvent {
	// ドメインルールの検証
	validateKpiEventProps(props);

	return {
		eventId,
		cattleId: props.cattleId,
		eventType: props.eventType,
		eventDatetime: props.eventDatetime,
		metadata: props.metadata || {},
		createdAt: currentTime,
		updatedAt: currentTime
	};
}

/**
 * KPIイベントプロパティの検証
 */
function validateKpiEventProps(props: NewKpiEventProps): void {
	if (!props.cattleId) {
		throw new Error("Cattle ID is required");
	}

	if (!props.eventType) {
		throw new Error("Event type is required");
	}

	if (!props.eventDatetime) {
		throw new Error("Event datetime is required");
	}

	// 未来の日付は許可しない
	if (props.eventDatetime > new Date()) {
		throw new Error("Event datetime cannot be in the future");
	}

	// 過去30年より前の日付は許可しない
	const thirtyYearsAgo = new Date();
	thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
	if (props.eventDatetime < thirtyYearsAgo) {
		throw new Error("Event datetime cannot be more than 30 years ago");
	}
}

/**
 * KPIイベントの更新
 *
 * 既存イベントの情報を更新します。
 */
export function updateKpiEvent(
	event: KpiEvent,
	updates: Partial<
		Pick<NewKpiEventProps, "eventType" | "eventDatetime" | "metadata">
	>,
	currentTime: Date
): KpiEvent {
	// 更新可能なフィールドのみ更新
	const updatedEvent: KpiEvent = {
		...event,
		...updates,
		updatedAt: currentTime
	};

	// 更新後の検証
	if (updates.eventDatetime) {
		validateKpiEventProps({
			cattleId: event.cattleId,
			eventType: updates.eventType || event.eventType,
			eventDatetime: updates.eventDatetime,
			metadata: updates.metadata || event.metadata
		});
	}

	return updatedEvent;
}

/**
 * KPIイベントの比較
 *
 * イベントの発生順序を比較します。
 */
export function compareKpiEvents(a: KpiEvent, b: KpiEvent): number {
	return a.eventDatetime.getTime() - b.eventDatetime.getTime();
}

/**
 * KPIイベントの期間内判定
 *
 * イベントが指定された期間内に発生したかを判定します。
 */
export function isKpiEventInPeriod(
	event: KpiEvent,
	from: Date,
	to: Date
): boolean {
	return event.eventDatetime >= from && event.eventDatetime <= to;
}

/**
 * KPIイベントの種類別フィルタリング
 *
 * 指定された種類のイベントのみを抽出します。
 */
export function filterKpiEventsByType(
	events: KpiEvent[],
	eventType: BreedingEventType
): KpiEvent[] {
	return events.filter((event) => event.eventType === eventType);
}

/**
 * KPIイベントの牛別グループ化
 *
 * 牛ID別にイベントをグループ化します。
 */
export function groupKpiEventsByCattle(
	events: KpiEvent[]
): Map<CattleId, KpiEvent[]> {
	const grouped = new Map<CattleId, KpiEvent[]>();

	for (const event of events) {
		const cattleEvents = grouped.get(event.cattleId) || [];
		cattleEvents.push(event);
		grouped.set(event.cattleId, cattleEvents);
	}

	// 各牛のイベントを時系列順にソート
	for (const [, cattleEvents] of grouped) {
		cattleEvents.sort(compareKpiEvents);
	}

	return grouped;
}

/**
 * KPIイベントの統計情報
 *
 * イベントの基本統計を計算します。
 */
export function calculateKpiEventStats(events: KpiEvent[]): {
	totalEvents: number;
	eventsByType: Record<BreedingEventType, number>;
	dateRange: { from: Date; to: Date } | null;
} {
	if (events.length === 0) {
		return {
			totalEvents: 0,
			eventsByType: {} as Record<BreedingEventType, number>,
			dateRange: null
		};
	}

	const eventsByType: Record<BreedingEventType, number> = {} as Record<
		BreedingEventType,
		number
	>;
	let earliestDate = events[0].eventDatetime;
	let latestDate = events[0].eventDatetime;

	for (const event of events) {
		// イベントタイプ別カウント
		eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

		// 日付範囲の更新
		if (event.eventDatetime < earliestDate) {
			earliestDate = event.eventDatetime;
		}
		if (event.eventDatetime > latestDate) {
			latestDate = event.eventDatetime;
		}
	}

	return {
		totalEvents: events.length,
		eventsByType,
		dateRange: { from: earliestDate, to: latestDate }
	};
}

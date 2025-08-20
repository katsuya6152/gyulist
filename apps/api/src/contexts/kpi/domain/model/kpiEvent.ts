/**
 * KPIイベント - ドメインモデル
 *
 * KPI計算の基となる繁殖イベントを表現するエンティティです。
 * 人工授精、分娩、発情などの繁殖関連イベントを管理します。
 */

import type { CattleId } from "../../../../shared/brand";
import type { BreedingEventType } from "./types";

/**
 * KPIイベントエンティティ。
 *
 * 繁殖指標計算に必要なイベント情報を管理します。
 * 不変性を保ち、ビジネスルールに基づく検証を提供します。
 */
export type KpiEvent = {
	/** イベントID */ readonly eventId: string;
	/** 牛ID */ readonly cattleId: CattleId;
	/** イベントタイプ */ readonly eventType: BreedingEventType;
	/** イベント日時 */ readonly eventDatetime: Date;
	/** メタデータ */ readonly metadata: KpiEventMetadata;
	/** 作成日時 */ readonly createdAt: Date;
	/** 更新日時 */ readonly updatedAt: Date;
};

/**
 * KPIイベントのメタデータ。
 *
 * イベント固有の追加情報を管理します。
 */
export type KpiEventMetadata = {
	/** 備考 */ readonly notes?: string | null;
	/** 結果 */ readonly result?: string | null;
	/** 技術者 */ readonly technician?: string | null;
	/** 場所 */ readonly location?: string | null;
	/** 設備 */ readonly equipment?: string | null;
	/** その他のメタデータ */ readonly [key: string]: unknown;
};

/**
 * 新規KPIイベント作成時のプロパティ。
 */
export type NewKpiEventProps = {
	/** 牛ID */ cattleId: CattleId;
	/** イベントタイプ */ eventType: BreedingEventType;
	/** イベント日時 */ eventDatetime: Date;
	/** メタデータ（オプション） */ metadata?: KpiEventMetadata;
};

/**
 * KPIイベントの作成。
 *
 * 新規イベントを作成し、ドメインルールに基づく検証を実行します。
 * @param props - 新規イベントのプロパティ
 * @param eventId - イベントID
 * @param currentTime - 現在時刻
 * @returns 作成されたKPIイベント
 * @throws ドメインルール違反の場合
 */
export function createKpiEvent(
	props: NewKpiEventProps,
	eventId: string,
	currentTime: Date
): KpiEvent {
	// ドメインルールの検証
	validateKpiEventProps(props, currentTime);

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
 * KPIイベントプロパティの検証。
 *
 * ドメインルールに基づいてプロパティの妥当性をチェックします。
 * @param props - 検証するプロパティ
 * @param currentTime - 現在時刻（テスト用）
 * @throws ドメインルール違反の場合
 */
function validateKpiEventProps(
	props: NewKpiEventProps,
	currentTime: Date
): void {
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
	if (props.eventDatetime > currentTime) {
		throw new Error("Event datetime cannot be in the future");
	}

	// 過去30年より前の日付は許可しない
	const thirtyYearsAgo = new Date(currentTime);
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
		validateKpiEventProps(
			{
				cattleId: event.cattleId,
				eventType: updates.eventType || event.eventType,
				eventDatetime: updates.eventDatetime,
				metadata: updates.metadata || event.metadata
			},
			currentTime
		);
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

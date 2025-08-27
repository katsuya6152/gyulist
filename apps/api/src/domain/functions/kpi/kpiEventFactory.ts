/**
 * KPI Event Factory Functions
 *
 * KPIイベントの作成・更新を行うファクトリー関数群
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { KpiError } from "../../errors/kpi/KpiErrors";
import type {
	BreedingEventType,
	KpiEvent,
	KpiEventId,
	NewKpiEventProps,
	UpdateKpiEventProps
} from "../../types/kpi";
import { BREEDING_EVENT_TYPES } from "../../types/kpi/KpiTypes";

/**
 * KPIイベントの作成
 *
 * 新規KPIイベントを作成し、ドメインルールに基づくバリデーションを実行
 *
 * @param props - 新規イベントのプロパティ
 * @param eventId - イベントID
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたKPIイベント、失敗時はドメインエラー
 */
export function createKpiEvent(
	props: NewKpiEventProps,
	eventId: KpiEventId,
	currentTime: Date
): Result<KpiEvent, KpiError> {
	// バリデーション
	const validation = validateKpiEventProps(props, currentTime);
	if (!validation.ok) return validation;

	const kpiEvent: KpiEvent = {
		eventId,
		cattleId: props.cattleId,
		eventType: props.eventType,
		eventDatetime: props.eventDatetime,
		metadata: props.metadata || {},
		createdAt: currentTime,
		updatedAt: currentTime
	};

	return ok(kpiEvent);
}

/**
 * KPIイベントの更新
 *
 * 既存のKPIイベントを更新し、ドメインルールに基づくバリデーションを実行
 *
 * @param current - 現在のKPIイベント
 * @param updates - 更新データ
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたKPIイベント、失敗時はドメインエラー
 */
export function updateKpiEvent(
	current: KpiEvent,
	updates: UpdateKpiEventProps,
	currentTime: Date
): Result<KpiEvent, KpiError> {
	// 更新用のプロパティを作成
	const updatedProps: NewKpiEventProps = {
		cattleId: current.cattleId,
		eventType: updates.eventType ?? current.eventType,
		eventDatetime: updates.eventDatetime ?? current.eventDatetime,
		metadata: updates.metadata ?? current.metadata
	};

	// 更新後のプロパティをバリデーション
	const validation = validateKpiEventProps(updatedProps, currentTime);
	if (!validation.ok) return validation;

	const updatedEvent: KpiEvent = {
		...current,
		...updates,
		updatedAt: currentTime
	};

	return ok(updatedEvent);
}

/**
 * KPIイベントプロパティのバリデーション
 *
 * @param props - 検証するプロパティ
 * @param currentTime - 現在時刻
 * @returns バリデーション結果
 */
export function validateKpiEventProps(
	props: NewKpiEventProps,
	currentTime: Date
): Result<true, KpiError> {
	// 必須項目チェック
	if (!props.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (!props.eventType) {
		return err({
			type: "ValidationError",
			message: "Event type is required",
			field: "eventType"
		});
	}

	if (!props.eventDatetime) {
		return err({
			type: "ValidationError",
			message: "Event datetime is required",
			field: "eventDatetime"
		});
	}

	// イベントタイプの妥当性チェック
	if (!BREEDING_EVENT_TYPES.includes(props.eventType)) {
		return err({
			type: "ValidationError",
			message: "Invalid event type",
			field: "eventType"
		});
	}

	// 未来の日付は許可しない
	if (props.eventDatetime > currentTime) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be in the future",
			field: "eventDatetime"
		});
	}

	// 過去30年より前の日付は許可しない
	const thirtyYearsAgo = new Date(currentTime);
	thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
	if (props.eventDatetime < thirtyYearsAgo) {
		return err({
			type: "ValidationError",
			message: "Event datetime cannot be more than 30 years ago",
			field: "eventDatetime"
		});
	}

	return ok(true);
}

/**
 * KPIイベントの比較
 * イベントの発生順序を比較
 */
export function compareKpiEvents(a: KpiEvent, b: KpiEvent): number {
	return a.eventDatetime.getTime() - b.eventDatetime.getTime();
}

/**
 * KPIイベントの期間内判定
 * イベントが指定された期間内に発生したかを判定
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
 * 指定された種類のイベントのみを抽出
 */
export function filterKpiEventsByType(
	events: KpiEvent[],
	eventType: BreedingEventType
): KpiEvent[] {
	return events.filter((event) => event.eventType === eventType);
}

/**
 * KPIイベントの牛別グループ化
 * 牛ID別にイベントをグループ化
 */
export function groupKpiEventsByCattle(
	events: KpiEvent[]
): Map<import("../../../shared/brand").CattleId, KpiEvent[]> {
	const grouped = new Map<
		import("../../../shared/brand").CattleId,
		KpiEvent[]
	>();

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
 * KPIイベントの統計情報計算
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

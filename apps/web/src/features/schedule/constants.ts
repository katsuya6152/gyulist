import type { SearchEventsResType } from "@/services/eventService";
import { EVENT_TYPE_LABELS } from "@repo/api";
import { addDays } from "date-fns";

export type Event = SearchEventsResType["results"][0];
export type DateFilter =
	| "all"
	| "today"
	| "tomorrow"
	| "dayAfterTomorrow"
	| "custom";

// イベントタイプの日本語マッピング
export const eventTypeLabels: Record<string, string> = EVENT_TYPE_LABELS;

// フィルターボタンの定義（静的）
export const FILTER_BUTTONS = [
	{
		key: "today" as const,
		label: "今日",
		getDate: () => new Date()
	},
	{
		key: "tomorrow" as const,
		label: "明日",
		getDate: () => addDays(new Date(), 1)
	},
	{
		key: "dayAfterTomorrow" as const,
		label: "明後日",
		getDate: () => addDays(new Date(), 2)
	},
	{
		key: "all" as const,
		label: "全て",
		getDate: () => null
	}
];

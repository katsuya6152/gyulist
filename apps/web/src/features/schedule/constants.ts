import type { SearchEventsResType } from "@/services/eventService";
import { addDays } from "date-fns";

export type Event = SearchEventsResType["results"][0];
export type DateFilter =
	| "all"
	| "today"
	| "tomorrow"
	| "dayAfterTomorrow"
	| "custom";

// イベントタイプの日本語マッピング
export const eventTypeLabels: Record<string, string> = {
	ESTRUS: "発情",
	INSEMINATION: "人工授精",
	CALVING: "分娩",
	VACCINATION: "ワクチン接種",
	SHIPMENT: "出荷",
	HOOF_TRIMMING: "削蹄",
	OTHER: "その他",
};

// イベントタイプの色マッピング
export const eventTypeColors: Record<string, string> = {
	ESTRUS: "bg-pink-100 text-pink-800 border-pink-300",
	INSEMINATION: "bg-blue-100 text-blue-800 border-blue-300",
	CALVING: "bg-green-100 text-green-800 border-green-300",
	VACCINATION: "bg-purple-100 text-purple-800 border-purple-300",
	SHIPMENT: "bg-orange-100 text-orange-800 border-orange-300",
	HOOF_TRIMMING: "bg-yellow-100 text-yellow-800 border-yellow-300",
	OTHER: "bg-gray-100 text-gray-800 border-gray-300",
};

// フィルターボタンの定義（静的）
export const FILTER_BUTTONS = [
	{
		key: "today" as const,
		label: "今日",
		getDate: () => new Date(),
	},
	{
		key: "tomorrow" as const,
		label: "明日",
		getDate: () => addDays(new Date(), 1),
	},
	{
		key: "dayAfterTomorrow" as const,
		label: "明後日",
		getDate: () => addDays(new Date(), 2),
	},
	{
		key: "all" as const,
		label: "全て",
		getDate: () => null,
	},
];

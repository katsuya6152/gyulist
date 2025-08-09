import { addDays, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { Event } from "./constants";

// 日付フォーマット関数をメモ化
export const formatEventDate = (dateString: string) => {
	return format(parseISO(dateString), "M月d日 (E)", { locale: ja });
};

export const formatEventTime = (dateString: string) => {
	return format(parseISO(dateString), "HH:mm");
};

export const formatFilterDate = (date: Date) => {
	return format(date, "M/d", { locale: ja });
};

// イベントデータをフィルタリングする関数
export const filterEventsByDate = (
	events: Event[],
	targetDate: Date,
): Event[] => {
	return events
		.filter((event) => {
			const eventDate = new Date(event.eventDatetime);
			return (
				eventDate.getFullYear() === targetDate.getFullYear() &&
				eventDate.getMonth() === targetDate.getMonth() &&
				eventDate.getDate() === targetDate.getDate()
			);
		})
		.sort(
			(a, b) =>
				new Date(b.eventDatetime).getTime() -
				new Date(a.eventDatetime).getTime(),
		);
};

// 全イベントをソートする関数
export const sortAllEvents = (events: Event[]): Event[] => {
	return [...events].sort(
		(a, b) =>
			new Date(b.eventDatetime).getTime() - new Date(a.eventDatetime).getTime(),
	);
};

// フィルター別のイベントデータを準備する関数
export const prepareFilterEventData = (events: Event[]) => {
	const today = new Date();
	const tomorrow = addDays(today, 1);
	const dayAfterTomorrow = addDays(today, 2);

	return {
		today: filterEventsByDate(events, today),
		tomorrow: filterEventsByDate(events, tomorrow),
		dayAfterTomorrow: filterEventsByDate(events, dayAfterTomorrow),
		all: sortAllEvents(events),
	};
};

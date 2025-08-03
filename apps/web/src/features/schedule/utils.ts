import { addDays } from "date-fns";

export type DateFilter =
	| "all"
	| "today"
	| "tomorrow"
	| "dayAfterTomorrow"
	| "custom";

/**
 * 日付フィルターに基づいてtargetDateを取得
 * @param filter 日付フィルター
 * @param customDate カスタム日付（文字列形式）
 * @returns 対象の日付またはnull
 */
export function getTargetDate(
	filter: DateFilter,
	customDate?: string,
): Date | null {
	const today = new Date();

	switch (filter) {
		case "today":
			return today;
		case "tomorrow":
			return addDays(today, 1);
		case "dayAfterTomorrow":
			return addDays(today, 2);
		case "custom":
			return customDate ? new Date(customDate) : null;
		default:
			return null;
	}
}

/**
 * 日付と時刻を日本語形式でフォーマットする
 * 例: 2025/08/22 14:30
 */
export function formatDateTime(isoString: string | null | undefined): string {
	if (!isoString) return "-";

	try {
		const date = new Date(isoString);
		return date.toLocaleString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		});
	} catch (error) {
		console.warn("Invalid date string:", isoString, error);
		return "-";
	}
}

/**
 * 日付のみを日本語形式でフォーマットする
 * 例: 2025/08/22
 */
export function formatDate(isoString: string | null | undefined): string {
	if (!isoString) return "-";

	try {
		const date = new Date(isoString);
		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		});
	} catch (error) {
		console.warn("Invalid date string:", isoString, error);
		return "-";
	}
}

/**
 * 時刻のみを日本語形式でフォーマットする
 * 例: 14:30
 */
export function formatTime(isoString: string | null | undefined): string {
	if (!isoString) return "-";

	try {
		const date = new Date(isoString);
		return date.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		});
	} catch (error) {
		console.warn("Invalid date string:", isoString, error);
		return "-";
	}
}

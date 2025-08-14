export type QueryParams = {
	q?: string;
	from?: string;
	to?: string;
	source?: string;
	limit?: number;
	offset?: number;
};

export function buildQuery(params: QueryParams): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") {
			search.set(key, String(value));
		}
	}
	return search.toString();
}

export function formatDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleString("ja-JP", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		timeZone: "UTC"
	});
}

export async function downloadCsv(blob: Blob, filename: string) {
	const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
	const text = await blob.text();
	const csvBlob = new Blob([bom, text], { type: "text/csv" });
	const url = URL.createObjectURL(csvBlob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

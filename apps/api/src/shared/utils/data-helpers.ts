/**
 * データ変換共通ユーティリティ
 * データ処理・変換・フォーマット・日付計算の共通ロジック
 */

// =============================================================================
// 日付・時間ユーティリティ
// =============================================================================

type AgeUnit = "years" | "months" | "days";

/**
 * 誕生日から年齢を計算
 * @param birthday 誕生日
 * @param unit 単位 (years, months, days)
 * @returns 計算された年齢
 */
export function calculateAge(birthday: Date, unit: AgeUnit = "years"): number {
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - birthday.getTime());

	switch (unit) {
		case "years":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
		case "months":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
		case "days":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24));
		default:
			return 0;
	}
}

/**
 * 誕生日から年齢情報を計算（表示用）
 * @param birthday 誕生日
 * @param currentDate 現在日時（デフォルト: 現在時刻）
 * @returns 年齢情報オブジェクト
 */
export function calculateAgeInfo(
	birthday: Date | null,
	currentDate: Date = new Date()
): {
	age: number | null;
	monthsOld: number | null;
	daysOld: number | null;
} {
	if (!birthday) {
		return { age: null, monthsOld: null, daysOld: null };
	}

	const diffMs = currentDate.getTime() - birthday.getTime();
	return {
		age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)), // 年齢（365.25日で割算）
		monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)), // 月齢（30.44日で割算）
		daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24)) // 日齢（24時間で割算）
	};
}

/**
 * 日付を ISO 文字列にフォーマット
 * @param date 日付オブジェクト
 * @returns ISO文字列 (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function formatDateToISO(date: Date): string {
	return date.toISOString();
}

/**
 * ISO 文字列から日付オブジェクトに変換
 * @param isoString ISO文字列
 * @returns 日付オブジェクト
 */
export function parseDateFromISO(isoString: string): Date {
	return new Date(isoString);
}

/**
 * 日付が有効かチェック
 * @param date 日付オブジェクト
 * @returns 有効な日付かどうか
 */
export function isValidDate(date: Date): boolean {
	return !Number.isNaN(date.getTime());
}

/**
 * 日付の差分を日数で計算
 * @param date1 日付1
 * @param date2 日付2
 * @returns 日数差（絶対値）
 */
export function calculateDaysDifference(date1: Date, date2: Date): number {
	const diffMs = Math.abs(date2.getTime() - date1.getTime());
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 日付の差分を月数で計算
 * @param date1 日付1
 * @param date2 日付2
 * @returns 月数差（絶対値）
 */
export function calculateMonthsDifference(date1: Date, date2: Date): number {
	const yearDiff = date2.getFullYear() - date1.getFullYear();
	const monthDiff = date2.getMonth() - date1.getMonth();
	return Math.abs(yearDiff * 12 + monthDiff);
}

/**
 * 日付の差分を年数で計算
 * @param date1 日付1
 * @param date2 日付2
 * @returns 年数差（絶対値）
 */
export function calculateYearsDifference(date1: Date, date2: Date): number {
	const yearDiff = date2.getFullYear() - date1.getFullYear();
	const monthDiff = date2.getMonth() - date1.getMonth();
	const dayDiff = date2.getDate() - date1.getDate();

	// 月日を考慮した年数計算
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		return Math.abs(yearDiff - 1);
	}
	return Math.abs(yearDiff);
}

/**
 * 日付を日本語形式でフォーマット
 * @param date 日付オブジェクト
 * @returns 日本語形式の日付文字列 (YYYY年MM月DD日)
 */
export function formatDateToJapanese(date: Date): string {
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}

// =============================================================================
// CSV生成ユーティリティ
// =============================================================================

/**
 * CSVデータ生成ユーティリティ
 */
export class CsvBuilder {
	private headers: string[];
	private rows: string[][];

	constructor(headers: string[]) {
		this.headers = headers;
		this.rows = [];
	}

	addRow(row: (string | number | null | undefined)[]): void {
		// CSVエスケープ処理
		const escapedRow = row.map((cell) => this.escapeCsvCell(cell));
		this.rows.push(escapedRow);
	}

	private escapeCsvCell(value: string | number | null | undefined): string {
		if (value == null) return "";

		const str = String(value);

		// カンマ、改行、ダブルクォートを含む場合はクォートで囲む
		if (
			str.includes(",") ||
			str.includes("\n") ||
			str.includes("\r") ||
			str.includes('"')
		) {
			// ダブルクォートをエスケープ
			const escaped = str.replace(/"/g, '""');
			return `"${escaped}"`;
		}

		return str;
	}

	build(): string {
		const allRows = [this.headers, ...this.rows];
		return allRows.map((row) => row.join(",")).join("\n");
	}

	buildWithBom(): Uint8Array {
		const csvContent = this.build();
		const encoder = new TextEncoder();
		const content = encoder.encode(csvContent);

		// UTF-8 BOM を追加
		return new Uint8Array([0xef, 0xbb, 0xbf, ...content]);
	}
}

/**
 * 日付フォーマットユーティリティ
 */
export function formatDateForFilename(date: Date = new Date()): string {
	return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export function formatDateTimeForLog(date: Date = new Date()): string {
	return date.toISOString();
}

/**
 * オブジェクトの安全なプロパティ取得
 */
export function safeGet<T>(obj: unknown, path: string[], defaultValue: T): T {
	try {
		let current: unknown = obj;
		for (const key of path) {
			if (current == null || typeof current !== "object") {
				return defaultValue;
			}
			current = (current as Record<string, unknown>)[key];
		}
		return (current ?? defaultValue) as T;
	} catch {
		return defaultValue;
	}
}

/**
 * 配列のチャンク分割
 */
export function chunk<T>(array: T[], size: number): T[][] {
	if (size <= 0) throw new Error("Chunk size must be positive");

	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * オブジェクトのnull/undefined値を除去
 */
export function removeNullish<T extends Record<string, unknown>>(
	obj: T
): Partial<T> {
	const result = {} as Partial<T>;

	for (const [key, value] of Object.entries(obj)) {
		if (value != null) {
			result[key as keyof T] = value as T[keyof T];
		}
	}

	return result;
}

/**
 * 文字列の安全なトリム
 */
export function safeTrim(value: unknown): string {
	if (typeof value !== "string") return "";
	return value.trim();
}

/**
 * 数値の範囲チェック
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * 配列の重複除去
 */
export function unique<T>(array: T[]): T[] {
	return [...new Set(array)];
}

/**
 * オブジェクトのディープコピー（JSONシリアライザブルなもののみ）
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") return obj;
	return JSON.parse(JSON.stringify(obj));
}

/**
 * 条件付きオブジェクトプロパティ
 */
export function conditionalProperty<T>(
	condition: boolean,
	property: T
): T | Record<string, never> {
	return condition ? property : {};
}

/**
 * 配列のグループ化
 */
export function groupBy<T, K extends string | number>(
	array: T[],
	keyFn: (item: T) => K
): Record<K, T[]> {
	const groups = {} as Record<K, T[]>;

	for (const item of array) {
		const key = keyFn(item);
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
	}

	return groups;
}

/**
 * 非同期配列処理（順次実行）
 */
export async function asyncMap<T, U>(
	array: T[],
	asyncFn: (item: T, index: number) => Promise<U>
): Promise<U[]> {
	const results: U[] = [];
	for (let i = 0; i < array.length; i++) {
		results.push(await asyncFn(array[i], i));
	}
	return results;
}

/**
 * 非同期配列処理（並列実行）
 */
export async function asyncMapParallel<T, U>(
	array: T[],
	asyncFn: (item: T, index: number) => Promise<U>
): Promise<U[]> {
	return Promise.all(array.map(asyncFn));
}

/**
 * リトライ処理
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxAttempts = 3,
	delay = 1000
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt === maxAttempts) {
				throw lastError;
			}

			// 指数バックオフ
			const waitTime = delay * 2 ** (attempt - 1);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}

	// この行に到達することはないが、TypeScript の満足のために
	throw lastError || new Error("Retry failed");
}

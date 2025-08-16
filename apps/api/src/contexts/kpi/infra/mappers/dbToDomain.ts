/**
 * KPI コンテキスト用 Mapper
 * KPI計算結果のデータ変換を担当
 */

/**
 * データベース行からドメインモデルに変換
 * KPIデータの型安全性を確保
 */
export function toDomain<T>(row: T): T {
	return row;
}

/**
 * KPI集計結果の配列を変換
 */
export function toDomainList<T>(rows: T[]): T[] {
	return rows.map(toDomain);
}

/**
 * KPI計算用の生データを整形
 * 数値の正規化、null値の処理等
 */
export function normalizeKpiData(
	data: Record<string, unknown>
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		// null値を0に変換（KPI計算では0として扱う）
		if (value === null || value === undefined) {
			result[key] = 0;
		} else if (typeof value === "number" && Number.isNaN(value)) {
			result[key] = 0;
		} else {
			result[key] = value;
		}
	}

	return result;
}

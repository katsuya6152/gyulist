/**
 * Registration コンテキスト用 Mapper
 * 仮登録・本登録データの変換を担当
 */

/**
 * データベース行からドメインモデルに変換
 * 登録データの型安全性を確保
 */
export function toDomain<T>(row: T): T {
	return row;
}

/**
 * 登録データの配列を変換
 */
export function toDomainList<T>(rows: T[]): T[] {
	return rows.map(toDomain);
}

/**
 * 登録ステータスの正規化
 * データベースの文字列値をドメインの型に変換
 */
export function normalizeRegistrationStatus(status: string | null): string {
	if (!status) return "pending";

	const validStatuses = ["pending", "completed", "cancelled"];
	return validStatuses.includes(status) ? status : "pending";
}

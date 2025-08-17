/**
 * Alerts コンテキスト用 Mapper
 * 現在はシンプルなデータ構造のため、基本的な変換のみ
 */

/**
 * データベース行からドメインモデルに変換
 * 現在のアラート機能では複雑な変換は不要だが、
 * 将来的な拡張に備えてマッパーを用意
 */
export function toDomain<T>(row: T): T {
	return row;
}

/**
 * データベース行の配列をドメインモデルの配列に変換
 */
export function toDomainList<T>(rows: T[]): T[] {
	return rows.map(toDomain);
}

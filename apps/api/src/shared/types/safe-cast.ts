/**
 * 型安全なキャストユーティリティ
 * Brand型の一貫した活用と型安全性の向上を目的とする
 */

import type { UserId } from "../brand";
// CattleId は Brand型として定義
type CattleId = number & { readonly __brand: "CattleId" };

/**
 * 数値をUserIdに安全にキャストする
 */
export function toUserId(value: number | string): UserId {
	const numValue =
		typeof value === "string" ? Number.parseInt(value, 10) : value;
	if (Number.isNaN(numValue) || numValue <= 0) {
		throw new Error(`Invalid UserId: ${value}`);
	}
	return numValue as UserId;
}

/**
 * 数値をCattleIdに安全にキャストする
 */
export function toCattleId(value: number | string): CattleId {
	const numValue =
		typeof value === "string" ? Number.parseInt(value, 10) : value;
	if (Number.isNaN(numValue) || numValue <= 0) {
		throw new Error(`Invalid CattleId: ${value}`);
	}
	return numValue as CattleId;
}

/**
 * パラメータ値を数値IDに安全に変換する汎用関数
 */
export function parseIdParam(param: string, entityName: string): number {
	const id = Number.parseInt(param, 10);
	if (Number.isNaN(id) || id <= 0) {
		throw new Error(`Invalid ${entityName} ID parameter: ${param}`);
	}
	return id;
}

/**
 * JWTペイロードからUserIdを安全に取得する
 */
export function extractUserId(jwtPayload: { userId: number }): UserId {
	return toUserId(jwtPayload.userId);
}

/**
 * オプショナルな値を安全にキャストする
 */
export function toOptionalUserId(
	value: number | string | null | undefined
): UserId | null {
	if (value == null) return null;
	try {
		return toUserId(value);
	} catch {
		return null;
	}
}

export function toOptionalCattleId(
	value: number | string | null | undefined
): CattleId | null {
	if (value == null) return null;
	try {
		return toCattleId(value);
	} catch {
		return null;
	}
}

/**
 * 型ガード関数
 */
export function isValidUserId(value: unknown): value is UserId {
	return typeof value === "number" && value > 0 && Number.isInteger(value);
}

export function isValidCattleId(value: unknown): value is CattleId {
	return typeof value === "number" && value > 0 && Number.isInteger(value);
}

/**
 * 配列の要素を安全にキャストする
 */
export function toUserIds(values: (number | string)[]): UserId[] {
	return values.map((value) => toUserId(value));
}

export function toCattleIds(values: (number | string)[]): CattleId[] {
	return values.map((value) => toCattleId(value));
}

/**
 * Brand型キャスト結果の型
 */
export type SafeCastResult<T> =
	| {
			success: true;
			value: T;
	  }
	| {
			success: false;
			error: string;
	  };

/**
 * 失敗しうるキャスト（Result型パターン）
 */
export function tryCastUserId(value: unknown): SafeCastResult<UserId> {
	try {
		if (typeof value !== "number" && typeof value !== "string") {
			return {
				success: false,
				error: `Expected number or string, got ${typeof value}`
			};
		}
		return { success: true, value: toUserId(value) };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

export function tryCastCattleId(value: unknown): SafeCastResult<CattleId> {
	try {
		if (typeof value !== "number" && typeof value !== "string") {
			return {
				success: false,
				error: `Expected number or string, got ${typeof value}`
			};
		}
		return { success: true, value: toCattleId(value) };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

/**
 * API レスポンス検証ユーティリティ
 * Hono RPCと組み合わせて使用するランタイムバリデーション
 */

import type { z } from "zod";

/**
 * APIレスポンスをZodスキーマで検証する
 */
export function validateApiResponse<T>(
	data: unknown,
	schema: z.ZodSchema<T>
): T {
	try {
		return schema.parse(data);
	} catch (error) {
		console.error("API response validation failed:", error);
		throw new Error("Invalid API response format");
	}
}

/**
 * APIレスポンスを安全にパースする（エラー時はnullを返す）
 */
export function safeParseApiResponse<T>(
	data: unknown,
	schema: z.ZodSchema<T>
): T | null {
	try {
		return schema.parse(data);
	} catch (error) {
		console.warn("API response validation failed:", error);
		return null;
	}
}

/**
 * 開発環境でのみAPIレスポンスを検証する
 */
export function validateInDev<T>(data: unknown, schema: z.ZodSchema<T>): T {
	if (process.env.NODE_ENV === "development") {
		return validateApiResponse(data, schema);
	}
	return data as T;
}

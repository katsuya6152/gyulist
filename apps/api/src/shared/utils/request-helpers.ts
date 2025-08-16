/**
 * リクエスト処理共通ユーティリティ
 * ルート横断で使用される共通ロジックを集約
 */

import type { Context } from "hono";
import { getLogger } from "../logging/logger";
import { extractUserId } from "../types/safe-cast";

/**
 * リクエストID生成（トレーシング用）
 */
export function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * APIリクエストの基本情報を取得する
 */
export function getRequestInfo(c: Context) {
	const method = c.req.method;
	const url = new URL(c.req.url);
	const endpoint = url.pathname;
	const requestId = generateRequestId();

	return {
		method,
		endpoint,
		requestId,
		userAgent: c.req.header("User-Agent"),
		ip:
			c.req.header("CF-Connecting-IP") ||
			c.req.header("X-Forwarded-For") ||
			"unknown"
	};
}

/**
 * JWTからユーザー情報を安全に取得する
 */
export function getAuthenticatedUser(c: Context) {
	try {
		const jwtPayload = c.get("jwtPayload");
		if (!jwtPayload) {
			return null;
		}
		return {
			userId: extractUserId(jwtPayload),
			rawPayload: jwtPayload
		};
	} catch (error) {
		const logger = getLogger(c);
		logger.warn("Failed to extract user from JWT", {
			error: error instanceof Error ? error.message : "Unknown error"
		});
		return null;
	}
}

/**
 * APIレスポンス時間測定用のタイマー
 */
export class RequestTimer {
	private startTime: number;

	constructor() {
		this.startTime = Date.now();
	}

	getDuration(): number {
		return Date.now() - this.startTime;
	}

	logResponse(
		method: string,
		endpoint: string,
		statusCode: number,
		context?: { env?: { ENVIRONMENT?: string } },
		userId?: number,
		requestId?: string
	): void {
		const duration = this.getDuration();
		const logger = getLogger(context);
		logger.apiResponse(
			method,
			endpoint,
			statusCode,
			duration,
			userId,
			requestId
		);
	}
}

/**
 * クエリパラメータの安全な取得
 */
export function getQueryParam(c: Context, key: string): string | undefined {
	return c.req.query(key) || undefined;
}

export function getRequiredQueryParam(c: Context, key: string): string {
	const value = c.req.query(key);
	if (!value) {
		throw new Error(`Required query parameter '${key}' is missing`);
	}
	return value;
}

export function getQueryParamAsNumber(
	c: Context,
	key: string
): number | undefined {
	const value = c.req.query(key);
	if (!value) return undefined;

	const num = Number.parseInt(value, 10);
	if (Number.isNaN(num)) {
		throw new Error(
			`Query parameter '${key}' must be a valid number, got: ${value}`
		);
	}
	return num;
}

export function getQueryParamAsBoolean(
	c: Context,
	key: string
): boolean | undefined {
	const value = c.req.query(key);
	if (!value) return undefined;

	if (value === "true") return true;
	if (value === "false") return false;

	throw new Error(
		`Query parameter '${key}' must be 'true' or 'false', got: ${value}`
	);
}

/**
 * ページネーション用のクエリパラメータ取得
 */
export type PaginationParams = {
	page: number;
	limit: number;
	offset: number;
};

export function getPaginationParams(
	c: Context,
	defaultLimit = 20,
	maxLimit = 100
): PaginationParams {
	const page = Math.max(1, getQueryParamAsNumber(c, "page") || 1);
	const requestedLimit = getQueryParamAsNumber(c, "limit") || defaultLimit;
	const limit = Math.min(maxLimit, Math.max(1, requestedLimit));
	const offset = (page - 1) * limit;

	return { page, limit, offset };
}

/**
 * 日時範囲クエリパラメータの取得
 */
export type DateRangeParams = {
	from?: string;
	to?: string;
};

export function getDateRangeParams(c: Context): DateRangeParams {
	const from = getQueryParam(c, "from");
	const to = getQueryParam(c, "to");

	// 日時形式の簡単な検証
	if (from && !isValidDateString(from)) {
		throw new Error(`Invalid 'from' date format: ${from}`);
	}
	if (to && !isValidDateString(to)) {
		throw new Error(`Invalid 'to' date format: ${to}`);
	}

	return { from, to };
}

/**
 * ISO 8601 日時文字列の簡単な検証
 */
function isValidDateString(dateStr: string): boolean {
	const date = new Date(dateStr);
	return (
		!Number.isNaN(date.getTime()) &&
		date.toISOString().startsWith(dateStr.split("T")[0])
	);
}

/**
 * レスポンスヘッダーの共通設定
 */
export function setCommonHeaders(c: Context): void {
	// セキュリティヘッダー
	c.header("X-Content-Type-Options", "nosniff");
	c.header("X-Frame-Options", "DENY");
	c.header("X-XSS-Protection", "1; mode=block");

	// API識別
	c.header("X-API-Version", "1.0");
}

/**
 * CSV レスポンス用のヘッダー設定
 */
export function setCsvHeaders(c: Context, filename: string): void {
	setCommonHeaders(c);
	c.header("Content-Type", "text/csv; charset=utf-8");
	c.header("Content-Disposition", `attachment; filename="${filename}"`);
}

/**
 * JSON レスポンス用のヘッダー設定
 */
export function setJsonHeaders(c: Context): void {
	setCommonHeaders(c);
	c.header("Content-Type", "application/json");
}

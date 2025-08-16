import type { Context } from "hono";
import type { JSONValue } from "hono/utils/types";
import { getLogger } from "../logging/logger";
import type { Result } from "../result";
import { getAuthenticatedUser, getRequestInfo } from "../utils/request-helpers";
import { type HttpMappableDomainError, toHttpStatus } from "./error-mapper";

/**
 * FDMのResult型を統一的にHTTPレスポンスに変換するヘルパー
 */
export async function handleResult<T extends JSONValue, E>(
	c: Context,
	result: Result<T, E>,
	options?: {
		successStatus?: 200 | 201 | 204;
		transform?: (value: T) => T;
		// Success payload envelope policy
		envelope?: "none" | "result" | "data";
	}
): Promise<Response> {
	if (!result.ok) {
		// カスタムHTTPステータスがある場合はそれを使用、なければtoHttpStatusで決定
		const errorObj = result.error as Record<string, unknown>;
		const status =
			(typeof errorObj === "object" && (errorObj?.httpStatus as number)) ??
			toHttpStatus(result.error as HttpMappableDomainError);
		c.status(status as 400 | 401 | 403 | 404 | 409 | 500);
		return c.json({ error: result.error });
	}

	const successStatus = options?.successStatus ?? 200;
	if (successStatus === 204) {
		// No Content
		return c.body(null, 204);
	}

	const raw = options?.transform
		? options.transform(result.value)
		: result.value;
	const envelope = options?.envelope ?? "none";
	const payload =
		envelope === "result"
			? ({ ok: true, value: raw } as unknown)
			: envelope === "data"
				? ({ data: raw } as unknown)
				: (raw as unknown);

	return c.json(payload as T, successStatus);
}

/**
 * try-catchブロックの統一的なエラーハンドリング
 */
export function handleUnexpectedError(c: Context, error: unknown): Response {
	const requestInfo = getRequestInfo(c);
	const user = getAuthenticatedUser(c);
	const logger = getLogger(c);

	logger.unexpectedError(
		"Unexpected error occurred",
		error instanceof Error ? error : new Error(String(error)),
		{
			...requestInfo,
			userId: user?.userId
		}
	);

	return c.json({ message: "Internal Server Error" }, 500);
}

/**
 * バリデーション失敗の統一的なハンドリング
 */
export function handleValidationError(c: Context, error: unknown): Response {
	const requestInfo = getRequestInfo(c);
	const user = getAuthenticatedUser(c);
	const logger = getLogger(c);

	logger.validationError(requestInfo.endpoint, error, user?.userId);

	// Attempt to extract zod-like issues for client-side display
	type IssueShape = { path?: unknown; message?: unknown };
	const maybeIssues = (error as { issues?: unknown })?.issues;
	const issues = Array.isArray(maybeIssues)
		? (maybeIssues as IssueShape[]).map((i) => ({
				path: Array.isArray(i.path)
					? i.path.map((p) => String(p)).join(".")
					: typeof i.path === "string"
						? i.path
						: undefined,
				message: typeof i.message === "string" ? i.message : "Invalid value"
			}))
		: undefined;

	return c.json(
		{
			ok: false,
			code: "VALIDATION_FAILED",
			message: "Validation failed",
			...(issues ? { issues } : {})
		},
		400
	);
}

/**
 * FDMユースケースを実行し、統一的にHTTPレスポンスを返すヘルパー
 */
export async function executeUseCase<T extends JSONValue, E>(
	c: Context,
	useCase: () => Promise<Result<T, E>>,
	options?: {
		successStatus?: 200 | 201 | 204;
		transform?: (value: T) => T;
		envelope?: "none" | "result" | "data";
	}
): Promise<Response> {
	try {
		const result = await useCase();
		return await handleResult(c, result, options);
	} catch (error) {
		return handleUnexpectedError(c, error);
	}
}

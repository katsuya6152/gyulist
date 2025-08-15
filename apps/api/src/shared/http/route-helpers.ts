import type { Context } from "hono";
import { getLogger } from "../logging/logger";
import type { Result } from "../result";
import { getAuthenticatedUser, getRequestInfo } from "../utils/request-helpers";
import { type HttpMappableDomainError, toHttpStatus } from "./error-mapper";

/**
 * FDMのResult型を統一的にHTTPレスポンスに変換するヘルパー
 */
export async function handleResult<T, E>(
	c: Context,
	result: Result<T, E>,
	options?: {
		successStatus?: 200 | 201;
		transform?: (value: T) => unknown;
	}
): Promise<Response> {
	if (!result.ok) {
		// カスタムHTTPステータスがある場合はそれを使用、なければtoHttpStatusで決定
		const errorObj = result.error as Record<string, unknown>;
		const status =
			(typeof errorObj === "object" && (errorObj?.httpStatus as number)) ??
			toHttpStatus(result.error as HttpMappableDomainError);
		c.status(status as 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500);
		return c.json({ error: result.error });
	}

	const responseData = options?.transform
		? options.transform(result.value)
		: result.value;
	return c.json(
		responseData as Record<string, unknown>,
		options?.successStatus ?? 200
	);
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

	return c.json(
		{ ok: false, code: "VALIDATION_FAILED", message: "Validation failed" },
		400
	);
}

/**
 * FDMユースケースを実行し、統一的にHTTPレスポンスを返すヘルパー
 */
export async function executeUseCase<T, E>(
	c: Context,
	useCase: () => Promise<Result<T, E>>,
	options?: {
		successStatus?: 200 | 201;
		transform?: (value: T) => unknown;
	}
): Promise<Response> {
	try {
		const result = await useCase();
		return await handleResult(c, result, options);
	} catch (error) {
		return handleUnexpectedError(c, error);
	}
}

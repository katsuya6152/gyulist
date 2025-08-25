/**
 * Auth Domain Errors
 *
 * 認証・ユーザー管理ドメインのエラー定義
 */

// ============================================================================
// Domain Error Types
// ============================================================================

/**
 * バリデーションエラー
 * 入力データの検証に失敗した場合に使用されます。
 */
export type ValidationError = {
	readonly type: "ValidationError";
	readonly message: string;
	readonly field?: string;
	readonly issues?: Array<{
		readonly path: string;
		readonly message: string;
	}>;
};

/**
 * 認証エラー
 * 認証に失敗した場合に使用されます。
 */
export type Unauthorized = {
	readonly type: "Unauthorized";
	readonly message?: string;
};

/**
 * 権限エラー
 * 認証済みだが権限がない場合に使用されます。
 */
export type Forbidden = {
	readonly type: "Forbidden";
	readonly message?: string;
};

/**
 * リソース未発見エラー
 * 指定されたリソースが見つからない場合に使用されます。
 */
export type NotFound = {
	readonly type: "NotFound";
	readonly entity: string;
	readonly id?: string | number;
	readonly message?: string;
};

/**
 * 競合エラー
 * リソースの競合が発生した場合に使用されます。
 */
export type Conflict = {
	readonly type: "Conflict";
	readonly message: string;
	readonly conflictingField?: string;
};

/**
 * インフラエラー
 * データベース接続エラーなど、インフラ層でのエラーに使用されます。
 */
export type InfraError = {
	readonly type: "InfraError";
	readonly message: string;
	readonly cause?: unknown;
};

/**
 * 認証ドメインのエラー型
 * 認証関連のすべてのエラーを統合した型です。
 */
export type AuthError =
	| ValidationError
	| Unauthorized
	| Forbidden
	| NotFound
	| Conflict
	| InfraError;

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * バリデーションエラーを作成
 */
export function createValidationError(
	message: string,
	field?: string,
	issues?: Array<{ path: string; message: string }>
): ValidationError {
	return {
		type: "ValidationError",
		message,
		...(field && { field }),
		...(issues && { issues })
	};
}

/**
 * 認証エラーを作成
 */
export function createUnauthorizedError(message?: string): Unauthorized {
	return {
		type: "Unauthorized",
		...(message && { message })
	};
}

/**
 * 権限エラーを作成
 */
export function createForbiddenError(message?: string): Forbidden {
	return {
		type: "Forbidden",
		...(message && { message })
	};
}

/**
 * リソース未発見エラーを作成
 */
export function createNotFoundError(
	entity: string,
	id?: string | number,
	message?: string
): NotFound {
	return {
		type: "NotFound",
		entity,
		...(id !== undefined && { id }),
		...(message && { message })
	};
}

/**
 * 競合エラーを作成
 */
export function createConflictError(
	message: string,
	conflictingField?: string
): Conflict {
	return {
		type: "Conflict",
		message,
		...(conflictingField && { conflictingField })
	};
}

/**
 * インフラエラーを作成
 */
export function createInfraError(message: string, cause?: unknown): InfraError {
	return {
		type: "InfraError",
		message,
		...(cause && { cause })
	};
}

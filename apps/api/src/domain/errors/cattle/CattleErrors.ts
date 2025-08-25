/**
 * Cattle Domain Errors
 *
 * 牛管理ドメインで発生するエラーの型定義
 */

export type ValidationError = {
	type: "ValidationError";
	message: string;
	field?: string;
	issues?: Array<{ path: string; message: string }>;
};

export type Unauthorized = {
	type: "Unauthorized";
	message?: string;
};

export type Forbidden = {
	type: "Forbidden";
	message?: string;
};

export type NotFound = {
	type: "NotFound";
	entity: string;
	id?: string | number;
	message?: string;
};

export type Conflict = {
	type: "Conflict";
	message: string;
	conflictingField?: string;
};

export type InfraError = {
	type: "InfraError";
	message: string;
	cause?: unknown;
};

/**
 * 牛管理ドメインで発生する可能性のあるエラーの統合型
 */
export type CattleError =
	| ValidationError
	| Unauthorized
	| Forbidden
	| NotFound
	| Conflict
	| InfraError;

// 互換性のため、既存のDomainErrorも維持
export type DomainError = CattleError;

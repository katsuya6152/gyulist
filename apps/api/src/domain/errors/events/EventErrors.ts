/**
 * Event Domain Errors
 *
 * イベント管理ドメインで発生するエラーの型定義
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
 * イベント管理ドメインで発生する可能性のあるエラーの統合型
 */
export type EventError =
	| ValidationError
	| Unauthorized
	| Forbidden
	| NotFound
	| Conflict
	| InfraError;

// 互換性のための別名エクスポート
export type DomainError = EventError;

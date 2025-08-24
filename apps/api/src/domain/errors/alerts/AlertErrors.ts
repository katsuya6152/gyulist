/**
 * Alert Domain Errors
 *
 * アラート管理ドメインで発生するエラーの型定義
 */

export type ValidationError = {
	type: "ValidationError";
	message: string;
	field?: string;
	issues?: Array<{ path: string; message: string }>;
};

export type BusinessRuleError = {
	type: "BusinessRuleError";
	message: string;
	rule?: string;
};

export type AlertNotFoundError = {
	type: "AlertNotFoundError";
	message?: string;
	alertId?: number;
};

export type StatusTransitionError = {
	type: "StatusTransitionError";
	message: string;
	currentStatus: string;
	targetStatus: string;
};

export type PermissionError = {
	type: "PermissionError";
	message: string;
	userId?: number;
};

export type CattleNotFoundError = {
	type: "CattleNotFoundError";
	message?: string;
	cattleId?: number;
};

export type InfraError = {
	type: "InfraError";
	message: string;
	cause?: unknown;
};

/**
 * アラート管理ドメインで発生する可能性のあるエラーの統合型
 */
export type AlertError =
	| ValidationError
	| BusinessRuleError
	| AlertNotFoundError
	| StatusTransitionError
	| PermissionError
	| CattleNotFoundError
	| InfraError;

// 互換性のための別名エクスポート
export type DomainError = AlertError;

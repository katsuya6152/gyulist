/**
 * バリデーションエラー。
 * 入力データの検証に失敗した場合に使用されます。
 */
export type ValidationError = {
	/** エラータイプ */ type: "ValidationError";
	/** エラーメッセージ */ message: string;
	/** 詳細な検証エラー（Zod等から） */ issues?: Array<{
		path: string;
		message: string;
	}>;
};

/**
 * 認証エラー。
 * 認証に失敗した場合に使用されます。
 */
export type Unauthorized = {
	/** エラータイプ */ type: "Unauthorized";
	/** エラーメッセージ */ message?: string;
};

/**
 * 権限エラー。
 * 認証済みだが権限がない場合に使用されます。
 */
export type Forbidden = {
	/** エラータイプ */ type: "Forbidden";
	/** エラーメッセージ */ message?: string;
};

/**
 * リソース未発見エラー。
 * 指定されたリソースが見つからない場合に使用されます。
 */
export type NotFound = {
	/** エラータイプ */ type: "NotFound";
	/** エンティティ名 */ entity: string;
	/** リソースID */ id?: string | number;
	/** エラーメッセージ */ message?: string;
};

/**
 * 競合エラー。
 * リソースの競合が発生した場合に使用されます。
 */
export type Conflict = {
	/** エラータイプ */ type: "Conflict";
	/** エラーメッセージ */ message: string;
};

/**
 * インフラエラー。
 * データベース接続エラーなど、インフラ層でのエラーに使用されます。
 */
export type InfraError = {
	/** エラータイプ */ type: "InfraError";
	/** エラーメッセージ */ message: string;
	/** 原因となったエラー */ cause?: unknown;
};

/**
 * 認証ドメインのエラー型。
 * 認証関連のすべてのエラーを統合した型です。
 */
export type DomainError =
	| ValidationError
	| Unauthorized
	| Forbidden
	| NotFound
	| Conflict
	| InfraError;

/**
 * Auth Database Mappers
 *
 * 認証・ユーザー管理ドメインのデータベースマッピング関数群
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { users as UsersTable } from "../../../db/schema";
import type {
	AvatarUrl,
	EmailAddress,
	GoogleId,
	LineId,
	OAuthProvider,
	PasswordHash,
	Theme,
	User,
	UserId,
	UserName,
	VerificationToken
} from "../../../domain/types/auth";

// ============================================================================
// Raw Database Types
// ============================================================================

export type RawUserRecord = InferSelectModel<typeof UsersTable>;
export type RawUserInsert = InferInsertModel<typeof UsersTable>;

// ============================================================================
// Database to Domain Mapping
// ============================================================================

/**
 * データベース行からドメインUserモデルに変換
 *
 * @param row - データベース行
 * @returns ドメインUserエンティティ
 */
export function mapRawUserToUser(row: RawUserRecord): User {
	return {
		id: row.id as UserId,
		userName: (row.userName ?? "") as UserName,
		email: row.email as EmailAddress,
		isVerified: row.isVerified ?? false,
		passwordHash: row.passwordHash ? (row.passwordHash as PasswordHash) : null,
		googleId: row.googleId ? (row.googleId as GoogleId) : null,
		lineId: row.lineId ? (row.lineId as LineId) : null,
		oauthProvider: (row.oauthProvider as OAuthProvider) ?? "email",
		avatarUrl: row.avatarUrl ? (row.avatarUrl as AvatarUrl) : null,
		lastLoginAt: row.lastLoginAt ?? null,
		theme: row.theme ? (row.theme as Theme) : null,
		createdAt: row.createdAt ?? new Date().toISOString(),
		updatedAt: row.updatedAt ?? new Date().toISOString(),
		verificationToken: row.verificationToken
			? (row.verificationToken as VerificationToken)
			: null
	};
}

// ============================================================================
// Domain to Database Mapping
// ============================================================================

/**
 * ユーザー登録用のデータベース挿入オブジェクトに変換
 *
 * @param input - 登録入力データ
 * @returns データベース挿入用オブジェクト
 */
export function mapRegistrationToDbInsert(input: {
	readonly email: string;
	readonly verificationToken: string;
}): RawUserInsert {
	const now = new Date().toISOString();
	return {
		email: input.email,
		passwordHash: "",
		isVerified: false,
		verificationToken: input.verificationToken,
		createdAt: now,
		updatedAt: now
	};
}

/**
 * ユーザー登録完了用のデータベース更新オブジェクトに変換
 *
 * @param input - 登録完了入力データ
 * @returns データベース更新用オブジェクト
 */
export function mapCompletionToDbUpdate(input: {
	readonly name: string;
	readonly passwordHash: string;
}): Partial<RawUserInsert> {
	return {
		userName: input.name,
		passwordHash: input.passwordHash,
		isVerified: true,
		verificationToken: null,
		updatedAt: new Date().toISOString()
	};
}

/**
 * 最終ログイン時刻更新用のデータベース更新オブジェクトに変換
 *
 * @param loginTime - ログイン時刻
 * @returns データベース更新用オブジェクト
 */
export function mapLastLoginToDbUpdate(
	loginTime: Date
): Partial<RawUserInsert> {
	return {
		lastLoginAt: loginTime.toISOString(),
		updatedAt: loginTime.toISOString()
	};
}

/**
 * テーマ更新用のデータベース更新オブジェクトに変換
 *
 * @param theme - テーマ名
 * @param updateTime - 更新時刻
 * @returns データベース更新用オブジェクト
 */
export function mapThemeToDbUpdate(
	theme: string,
	updateTime: Date
): Partial<RawUserInsert> {
	return {
		theme,
		updatedAt: updateTime.toISOString()
	};
}

/**
 * OAuthユーザー作成用のデータベース挿入オブジェクトに変換
 *
 * @param input - OAuthユーザー入力データ
 * @returns データベース挿入用オブジェクト
 */
export function mapOAuthUserToDbInsert(input: {
	readonly email: string;
	readonly userName: string;
	readonly googleId?: string;
	readonly lineId?: string;
	readonly oauthProvider: "google" | "line";
	readonly avatarUrl?: string;
}): RawUserInsert {
	const now = new Date().toISOString();
	return {
		email: input.email,
		userName: input.userName,
		passwordHash: `oauth_dummy_${Math.random().toString(36).substring(2)}`, // OAuth用ダミーハッシュ
		isVerified: true, // OAuth users are automatically verified
		googleId: input.googleId ?? null,
		lineId: input.lineId ?? null,
		oauthProvider: input.oauthProvider,
		avatarUrl: input.avatarUrl ?? null,
		verificationToken: null,
		createdAt: now,
		updatedAt: now,
		lastLoginAt: now
	};
}

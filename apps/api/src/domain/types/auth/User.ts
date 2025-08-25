/**
 * Auth Domain Types - User Entity
 *
 * 認証・ユーザー管理ドメインのユーザーエンティティ定義
 */

import type { Brand } from "../../../shared/brand";

// ============================================================================
// Brand Types
// ============================================================================

export type UserId = Brand<number, "UserId">;
export type UserName = Brand<string, "UserName">;
export type EmailAddress = Brand<string, "EmailAddress">;
export type PasswordHash = Brand<string, "PasswordHash">;
export type VerificationToken = Brand<string, "VerificationToken">;
export type GoogleId = Brand<string, "GoogleId">;
export type LineId = Brand<string, "LineId">;
export type AvatarUrl = Brand<string, "AvatarUrl">;
export type Theme = Brand<string, "Theme">;

// ============================================================================
// OAuth Provider Types
// ============================================================================

export const OAUTH_PROVIDERS = ["email", "google", "line"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number] | null;

// ============================================================================
// User Entity
// ============================================================================

/**
 * ユーザーエンティティ
 *
 * 認証・認可の中心となるエンティティです。
 * メール認証、OAuth認証、テーマ設定などの情報を管理します。
 */
export type User = Readonly<{
	/** ユーザーID */
	id: UserId;
	/** ユーザー名 */
	userName: UserName;
	/** メールアドレス */
	email: EmailAddress;
	/** メール認証済みフラグ */
	isVerified: boolean;
	/** パスワードハッシュ（OAuthユーザーはnull） */
	passwordHash: PasswordHash | null;
	/** Google ID（Google OAuthユーザーの場合） */
	googleId: GoogleId | null;
	/** LINE ID（LINE OAuthユーザーの場合） */
	lineId: LineId | null;
	/** OAuthプロバイダー */
	oauthProvider: OAuthProvider;
	/** アバターURL */
	avatarUrl: AvatarUrl | null;
	/** 最終ログイン日時 */
	lastLoginAt: string | null;
	/** テーマ設定 */
	theme: Theme | null;
	/** 作成日時 */
	createdAt: string;
	/** 更新日時 */
	updatedAt: string;
	/** 検証トークン（未認証ユーザーの場合） */
	verificationToken?: VerificationToken | null;
}>;

// ============================================================================
// User Creation Props
// ============================================================================

/**
 * 新規ユーザー作成プロパティ
 */
export type NewUserProps = {
	readonly userName: string;
	readonly email: string;
	readonly passwordHash?: string | null;
	readonly googleId?: string | null;
	readonly lineId?: string | null;
	readonly oauthProvider?: OAuthProvider;
	readonly avatarUrl?: string | null;
	readonly theme?: string | null;
	readonly verificationToken?: string | null;
};

/**
 * ユーザー更新プロパティ
 */
export type UpdateUserProps = {
	readonly userName?: string;
	readonly isVerified?: boolean;
	readonly passwordHash?: string | null;
	readonly googleId?: string | null;
	readonly lineId?: string | null;
	readonly oauthProvider?: OAuthProvider;
	readonly avatarUrl?: string | null;
	readonly lastLoginAt?: string | null;
	readonly theme?: string | null;
	readonly verificationToken?: string | null;
};

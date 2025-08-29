/**
 * Auth Repository Port
 *
 * 認証・ユーザー管理ドメインのリポジトリポート定義
 */

import type { Result } from "../../../shared/result";
import type { AuthError } from "../../errors/auth/AuthErrors";
import type { User, UserId } from "../../types/auth";

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * 認証リポジトリポート
 *
 * ユーザーの永続化、検索、更新などの操作を提供します。
 * Result型を使用して統一されたエラーハンドリングを実現します。
 */
export interface AuthRepository {
	/**
	 * IDでユーザーを取得します
	 * @param id - ユーザーID
	 * @returns 成功時はユーザー、失敗時はAuthError
	 */
	findById(id: UserId): Promise<Result<User | null, AuthError>>;

	/**
	 * メールアドレスでユーザーを取得します
	 * @param email - メールアドレス
	 * @returns 成功時はユーザー、失敗時はAuthError
	 */
	findByEmail(email: string): Promise<Result<User | null, AuthError>>;

	/**
	 * 検証トークンでユーザーを取得します
	 * @param token - 検証トークン
	 * @returns 成功時はユーザー、失敗時はAuthError
	 */
	findByVerificationToken(
		token: string
	): Promise<Result<User | null, AuthError>>;

	/**
	 * Google IDでユーザーを取得します
	 * @param googleId - Google ID
	 * @returns 成功時はユーザー、失敗時はAuthError
	 */
	findByGoogleId(googleId: string): Promise<Result<User | null, AuthError>>;

	/**
	 * LINE IDでユーザーを取得します
	 * @param lineId - LINE ID
	 * @returns 成功時はユーザー、失敗時はAuthError
	 */
	findByLineId(lineId: string): Promise<Result<User | null, AuthError>>;

	/**
	 * 新規ユーザーを作成します（事前登録段階）
	 * @param input - ユーザー作成データ
	 * @returns 成功時は作成されたユーザー、失敗時はAuthError
	 */
	create(input: {
		readonly email: string;
		readonly verificationToken: string;
	}): Promise<Result<User, AuthError>>;

	/**
	 * ユーザー登録を完了します
	 * @param input - 登録完了データ
	 * @returns 成功時は更新されたユーザー、失敗時はAuthError
	 */
	completeRegistration(input: {
		readonly token: string;
		readonly name: string;
		readonly passwordHash: string;
	}): Promise<Result<User, AuthError>>;

	/**
	 * 検証トークンを更新します
	 * @param userId - ユーザーID
	 * @param verificationToken - 新しい検証トークン
	 * @returns 成功時は更新されたユーザー、失敗時はAuthError
	 */
	updateVerificationToken(
		userId: UserId,
		verificationToken: string
	): Promise<Result<User, AuthError>>;

	/**
	 * 最終ログイン日時を更新します
	 * @param userId - ユーザーID
	 * @param loginTime - ログイン日時
	 * @returns 成功時は更新されたユーザー、失敗時はAuthError
	 */
	updateLastLogin(
		userId: UserId,
		loginTime: Date
	): Promise<Result<User, AuthError>>;

	/**
	 * ユーザーのテーマ設定を更新します
	 * @param userId - ユーザーID
	 * @param theme - テーマ名
	 * @param updateTime - 更新日時
	 * @returns 成功時は更新されたユーザー、失敗時はAuthError
	 */
	updateTheme(
		userId: UserId,
		theme: string,
		updateTime: Date
	): Promise<Result<User, AuthError>>;

	/**
	 * OAuthユーザーを作成または更新します
	 * @param input - OAuthユーザーデータ
	 * @returns 成功時は作成/更新されたユーザー、失敗時はAuthError
	 */
	createOrUpdateOAuthUser(input: {
		readonly email: string;
		readonly userName: string;
		readonly googleId?: string;
		readonly lineId?: string;
		readonly oauthProvider: "google" | "line";
		readonly avatarUrl?: string;
	}): Promise<Result<User, AuthError>>;
}

// ============================================================================
// Password Service Ports
// ============================================================================

/**
 * パスワード検証ポート
 */
export interface PasswordVerifier {
	/**
	 * パスワードを検証します
	 * @param password - 平文パスワード
	 * @param hash - ハッシュ化されたパスワード
	 * @returns 一致する場合は true
	 */
	verify(password: string, hash: string): Promise<boolean>;
}

/**
 * パスワードハッシュ化ポート
 */
export interface PasswordHasher {
	/**
	 * パスワードをハッシュ化します
	 * @param password - 平文パスワード
	 * @returns ハッシュ化されたパスワード
	 */
	hash(password: string): Promise<string>;
}

/**
 * 検証トークン生成ポート
 */
export interface VerificationTokenGenerator {
	/**
	 * 検証トークンを生成します
	 * @returns 検証トークン
	 */
	generate(): Promise<string> | string;
}

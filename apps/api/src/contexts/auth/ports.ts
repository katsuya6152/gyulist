import type { Brand } from "../../shared/brand";
import type { TokenPort } from "../../shared/ports/token";
import type { User } from "./domain/model/user";

/**
 * ユーザーIDのブランド型。
 */
export type UserId = Brand<number, "UserId">;

/**
 * 認証リポジトリポート。
 *
 * ユーザーの永続化、検索、更新などの操作を提供します。
 */
export interface AuthRepoPort {
	/**
	 * IDでユーザーを取得します。
	 * @param id - ユーザーID
	 * @returns 見つからない場合は null
	 */
	findUserById(id: UserId): Promise<User | null>;

	/**
	 * メールアドレスでユーザーを取得します。
	 * @param email - メールアドレス
	 * @returns 見つからない場合は null
	 */
	findUserByEmail(email: string): Promise<User | null>;

	/**
	 * 新規ユーザーを作成します（事前登録段階）。
	 * @param input.email - メールアドレス
	 * @param input.verificationToken - 検証トークン
	 */
	createUser(input: {
		email: string;
		verificationToken: string;
	}): Promise<void>;

	/**
	 * 検証トークンでユーザーを取得します。
	 * @param token - 検証トークン
	 * @returns 見つからない場合は null
	 */
	findUserByVerificationToken(token: string): Promise<User | null>;

	/**
	 * ユーザー登録を完了します。
	 * @param input.token - 検証トークン
	 * @param input.name - ユーザー名
	 * @param input.passwordHash - ハッシュ化されたパスワード
	 */
	completeUserRegistration(input: {
		token: string;
		name: string;
		passwordHash: string;
	}): Promise<void>;

	/**
	 * 最終ログイン日時を更新します。
	 * @param userId - ユーザーID
	 * @param iso - ISO8601形式の日時文字列
	 */
	updateLastLoginAt(userId: UserId, iso: string): Promise<void>;

	/**
	 * ユーザーのテーマ設定を更新します。
	 * @param userId - ユーザーID
	 * @param theme - テーマ名
	 * @param iso - ISO8601形式の日時文字列
	 */
	updateUserTheme(userId: UserId, theme: string, iso: string): Promise<void>;
}

/**
 * パスワード検証関数の型。
 * @param password - 平文パスワード
 * @param hash - ハッシュ化されたパスワード
 * @returns 一致する場合は true
 */
export type PasswordVerifier = (
	password: string,
	hash: string
) => Promise<boolean>;

/**
 * パスワードハッシュ化関数の型。
 * @param password - 平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export type PasswordHasher = (password: string) => Promise<string>;

/**
 * 検証トークン生成関数の型。
 * @returns 検証トークン
 */
export type VerificationTokenGenerator = () => Promise<string> | string;

/**
 * 認証ユースケースの依存関係。
 */
export type AuthDeps = {
	/** 認証リポジトリ */ repo: AuthRepoPort;
	/** トークン管理 */ token: TokenPort;
	/** パスワード検証（オプション） */ verifyPassword?: PasswordVerifier;
	/** パスワードハッシュ化（オプション） */ hashPassword?: PasswordHasher;
	/** 検証トークン生成（オプション） */ generateVerificationToken?: VerificationTokenGenerator;
};

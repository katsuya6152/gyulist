import type { Brand } from "../../../../shared/brand";

/**
 * ユーザーIDのブランド型。
 */
export type UserId = Brand<number, "UserId">;

/**
 * ユーザーエンティティ。
 *
 * 認証・認可の中心となるエンティティです。
 * メール認証、OAuth認証、テーマ設定などの情報を管理します。
 */
export type User = {
	/** ユーザーID */ id: UserId;
	/** ユーザー名 */ userName: string;
	/** メールアドレス */ email: string;
	/** メール認証済みフラグ */ isVerified: boolean;
	/** パスワードハッシュ（OAuthユーザーはnull） */ passwordHash: string | null;
	/** Google ID（Google OAuthユーザーの場合） */ googleId: string | null;
	/** LINE ID（LINE OAuthユーザーの場合） */ lineId: string | null;
	/** OAuthプロバイダー */ oauthProvider: "email" | "google" | "line" | null;
	/** アバターURL */ avatarUrl: string | null;
	/** 最終ログイン日時 */ lastLoginAt: string | null;
	/** テーマ設定 */ theme: string | null;
	/** 作成日時 */ createdAt: string;
	/** 更新日時 */ updatedAt: string;
};

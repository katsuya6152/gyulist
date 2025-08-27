/**
 * User Factory Functions
 *
 * ユーザーエンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { AuthError } from "../../errors/auth/AuthErrors";
import type {
	AvatarUrl,
	EmailAddress,
	GoogleId,
	LineId,
	NewUserProps,
	OAuthProvider,
	PasswordHash,
	Theme,
	UpdateUserProps,
	User,
	UserId,
	UserName,
	VerificationToken
} from "../../types/auth";

// ============================================================================
// User Factory Functions
// ============================================================================

/**
 * ユーザーエンティティのファクトリー関数
 *
 * 新規ユーザーの作成を行い、ドメインルールに基づくバリデーションを実行します。
 *
 * @param props - 新規ユーザーのプロパティ
 * @param currentTime - 現在時刻
 * @returns 成功時は作成されたユーザー、失敗時はドメインエラー
 */
export function createUser(
	props: NewUserProps,
	currentTime: Date
): Result<User, AuthError> {
	// バリデーション
	const validation = validateNewUserProps(props);
	if (!validation.ok) return validation;

	// ユーザー作成
	const user: User = {
		id: 0 as UserId, // データベースで自動生成
		userName: normalizeUserName(props.userName) as UserName,
		email: normalizeEmail(props.email) as EmailAddress,
		isVerified: false,
		passwordHash: props.passwordHash
			? (props.passwordHash as PasswordHash)
			: null,
		googleId: props.googleId ? (props.googleId as GoogleId) : null,
		lineId: props.lineId ? (props.lineId as LineId) : null,
		oauthProvider: props.oauthProvider || "email",
		avatarUrl: props.avatarUrl ? (props.avatarUrl as AvatarUrl) : null,
		lastLoginAt: null,
		theme: props.theme ? (props.theme as Theme) : null,
		createdAt: currentTime.toISOString(),
		updatedAt: currentTime.toISOString(),
		verificationToken: props.verificationToken
			? (props.verificationToken as VerificationToken)
			: null
	};

	return ok(user);
}

/**
 * ユーザー更新ファクトリー関数
 *
 * 既存のユーザーを更新し、ドメインルールに基づくバリデーションを実行します。
 *
 * @param current - 現在のユーザー
 * @param updates - 更新データ
 * @param currentTime - 現在時刻
 * @returns 成功時は更新されたユーザー、失敗時はドメインエラー
 */
export function updateUser(
	current: User,
	updates: UpdateUserProps,
	currentTime: Date
): Result<User, AuthError> {
	// バリデーション
	const validation = validateUpdateUserProps(updates);
	if (!validation.ok) return validation;

	// ユーザー更新
	const updatedUser: User = {
		...current,
		...(updates.userName !== undefined && {
			userName: normalizeUserName(updates.userName) as UserName
		}),
		...(updates.isVerified !== undefined && { isVerified: updates.isVerified }),
		...(updates.passwordHash !== undefined && {
			passwordHash: updates.passwordHash
				? (updates.passwordHash as PasswordHash)
				: null
		}),
		...(updates.googleId !== undefined && {
			googleId: updates.googleId ? (updates.googleId as GoogleId) : null
		}),
		...(updates.lineId !== undefined && {
			lineId: updates.lineId ? (updates.lineId as LineId) : null
		}),
		...(updates.oauthProvider !== undefined && {
			oauthProvider: updates.oauthProvider
		}),
		...(updates.avatarUrl !== undefined && {
			avatarUrl: updates.avatarUrl ? (updates.avatarUrl as AvatarUrl) : null
		}),
		...(updates.lastLoginAt !== undefined && {
			lastLoginAt: updates.lastLoginAt
		}),
		...(updates.theme !== undefined && {
			theme: updates.theme ? (updates.theme as Theme) : null
		}),
		...(updates.verificationToken !== undefined && {
			verificationToken: updates.verificationToken
				? (updates.verificationToken as VerificationToken)
				: null
		}),
		updatedAt: currentTime.toISOString()
	};

	return ok(updatedUser);
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * 新規ユーザープロパティのバリデーション
 */
function validateNewUserProps(props: NewUserProps): Result<true, AuthError> {
	// ユーザー名チェック
	if (!props.userName || props.userName.trim().length === 0) {
		return err({
			type: "ValidationError",
			message: "User name is required",
			field: "userName"
		});
	}

	if (props.userName.trim().length > 100) {
		return err({
			type: "ValidationError",
			message: "User name cannot exceed 100 characters",
			field: "userName"
		});
	}

	// メールアドレスチェック
	if (!props.email || props.email.trim().length === 0) {
		return err({
			type: "ValidationError",
			message: "Email is required",
			field: "email"
		});
	}

	if (!isValidEmail(props.email)) {
		return err({
			type: "ValidationError",
			message: "Invalid email format",
			field: "email"
		});
	}

	// OAuthプロバイダーチェック
	if (
		props.oauthProvider &&
		!["email", "google", "line"].includes(props.oauthProvider)
	) {
		return err({
			type: "ValidationError",
			message: "Invalid OAuth provider",
			field: "oauthProvider"
		});
	}

	return ok(true);
}

/**
 * ユーザー更新プロパティのバリデーション
 */
function validateUpdateUserProps(
	updates: UpdateUserProps
): Result<true, AuthError> {
	// ユーザー名チェック
	if (updates.userName !== undefined) {
		if (!updates.userName || updates.userName.trim().length === 0) {
			return err({
				type: "ValidationError",
				message: "User name cannot be empty",
				field: "userName"
			});
		}

		if (updates.userName.trim().length > 100) {
			return err({
				type: "ValidationError",
				message: "User name cannot exceed 100 characters",
				field: "userName"
			});
		}
	}

	// OAuthプロバイダーチェック
	if (
		updates.oauthProvider !== undefined &&
		updates.oauthProvider &&
		!["email", "google", "line"].includes(updates.oauthProvider)
	) {
		return err({
			type: "ValidationError",
			message: "Invalid OAuth provider",
			field: "oauthProvider"
		});
	}

	return ok(true);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * ユーザー名の正規化
 */
function normalizeUserName(userName: string): string {
	return userName.trim();
}

/**
 * メールアドレスの正規化
 */
function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/**
 * メールアドレスの形式チェック
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// ============================================================================
// User Business Rules
// ============================================================================

/**
 * ユーザーのビジネスルール
 */
export const UserRules = {
	/**
	 * ユーザーが認証済みかチェック
	 */
	isVerified(user: User): boolean {
		return user.isVerified;
	},

	/**
	 * ユーザーがOAuthユーザーかチェック
	 */
	isOAuthUser(user: User): boolean {
		return user.oauthProvider !== "email" && user.oauthProvider !== null;
	},

	/**
	 * ユーザーがパスワードを持っているかチェック
	 */
	hasPassword(user: User): boolean {
		return user.passwordHash !== null;
	},

	/**
	 * ユーザーが登録完了済みかチェック
	 */
	isRegistrationComplete(user: User): boolean {
		return (
			user.isVerified &&
			(user.passwordHash !== null || UserRules.isOAuthUser(user))
		);
	},

	/**
	 * ユーザーがアクティブかチェック
	 */
	isActive(user: User): boolean {
		return UserRules.isRegistrationComplete(user);
	},

	/**
	 * 指定されたOAuthプロバイダーのユーザーかチェック
	 */
	isProviderUser(user: User, provider: OAuthProvider): boolean {
		return user.oauthProvider === provider;
	}
};

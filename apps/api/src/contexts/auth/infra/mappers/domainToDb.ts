import type { InferInsertModel } from "drizzle-orm";
import type { users as UsersTable } from "../../../../db/schema";
import type { User } from "../../domain/model/user";

/**
 * ユーザー登録用のデータベース挿入オブジェクトに変換
 */
export function toDbInsertForRegistration(input: {
	email: string;
	verificationToken: string;
}): InferInsertModel<typeof UsersTable> {
	return {
		email: input.email,
		passwordHash: "",
		isVerified: false,
		verificationToken: input.verificationToken,
		createdAt: new Date().toISOString()
	};
}

/**
 * ユーザー登録完了用のデータベース更新オブジェクトに変換
 */
export function toDbUpdateForCompletion(input: {
	name: string;
	passwordHash: string;
}): Partial<InferInsertModel<typeof UsersTable>> {
	return {
		userName: input.name,
		passwordHash: input.passwordHash,
		isVerified: true,
		verificationToken: null
	};
}

/**
 * 最終ログイン時刻更新用のデータベース更新オブジェクトに変換
 */
export function toDbUpdateForLastLogin(
	iso: string
): Partial<InferInsertModel<typeof UsersTable>> {
	return {
		lastLoginAt: iso
	};
}

/**
 * テーマ更新用のデータベース更新オブジェクトに変換
 */
export function toDbUpdateForTheme(
	theme: string,
	iso: string
): Partial<InferInsertModel<typeof UsersTable>> {
	return {
		theme,
		updatedAt: iso
	};
}

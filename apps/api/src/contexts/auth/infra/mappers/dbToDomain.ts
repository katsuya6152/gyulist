import type { InferSelectModel } from "drizzle-orm";
import type { users as UsersTable } from "../../../../db/schema";
import type { User } from "../../domain/model/user";

/**
 * データベース行からドメインUserモデルに変換
 */
export function toDomain(row: InferSelectModel<typeof UsersTable>): User {
	return {
		id: row.id as unknown as User["id"],
		userName: row.userName ?? "",
		email: row.email,
		passwordHash: row.passwordHash ?? null,
		isVerified: row.isVerified ?? false,
		googleId: row.googleId ?? null,
		lineId: row.lineId ?? null,
		oauthProvider: (row.oauthProvider as User["oauthProvider"]) ?? null,
		avatarUrl: row.avatarUrl ?? null,
		lastLoginAt: row.lastLoginAt ?? null,
		theme: row.theme ?? null,
		createdAt: row.createdAt ?? new Date().toISOString(),
		updatedAt: row.updatedAt ?? new Date().toISOString()
	};
}

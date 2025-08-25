/**
 * Auth Repository Implementation
 *
 * 認証・ユーザー管理ドメインのリポジトリ実装（Drizzle ORM使用）
 */

import { eq, or } from "drizzle-orm";
import { users } from "../../../db/schema";
import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import type { AuthRepository } from "../../../domain/ports/auth";
import type { User, UserId } from "../../../domain/types/auth";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import {
	mapCompletionToDbUpdate,
	mapLastLoginToDbUpdate,
	mapOAuthUserToDbInsert,
	mapRawUserToUser,
	mapRegistrationToDbInsert,
	mapThemeToDbUpdate
} from "../mappers/authDbMapper";

// ============================================================================
// Repository Implementation
// ============================================================================

/**
 * Drizzle ORMを使用した認証リポジトリの実装
 */
export class AuthRepositoryImpl implements AuthRepository {
	private readonly db: ReturnType<typeof import("drizzle-orm/d1").drizzle>;

	constructor(dbInstance: D1DatabasePort) {
		this.db = dbInstance.getDrizzle();
	}

	async findById(id: UserId): Promise<Result<User | null, AuthError>> {
		try {
			const rows = await this.db
				.select()
				.from(users)
				.where(eq(users.id, id as unknown as number));

			const row = rows[0];
			return ok(row ? mapRawUserToUser(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find user by ID",
				cause
			});
		}
	}

	async findByEmail(email: string): Promise<Result<User | null, AuthError>> {
		try {
			const rows = await this.db
				.select()
				.from(users)
				.where(eq(users.email, email));

			const row = rows[0];
			return ok(row ? mapRawUserToUser(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find user by email",
				cause
			});
		}
	}

	async findByVerificationToken(
		token: string
	): Promise<Result<User | null, AuthError>> {
		try {
			const rows = await this.db
				.select()
				.from(users)
				.where(eq(users.verificationToken, token));

			const row = rows[0];
			return ok(row ? mapRawUserToUser(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find user by verification token",
				cause
			});
		}
	}

	async findByGoogleId(
		googleId: string
	): Promise<Result<User | null, AuthError>> {
		try {
			const rows = await this.db
				.select()
				.from(users)
				.where(eq(users.googleId, googleId));

			const row = rows[0];
			return ok(row ? mapRawUserToUser(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find user by Google ID",
				cause
			});
		}
	}

	async findByLineId(lineId: string): Promise<Result<User | null, AuthError>> {
		try {
			const rows = await this.db
				.select()
				.from(users)
				.where(eq(users.lineId, lineId));

			const row = rows[0];
			return ok(row ? mapRawUserToUser(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find user by LINE ID",
				cause
			});
		}
	}

	async create(input: {
		readonly email: string;
		readonly verificationToken: string;
	}): Promise<Result<User, AuthError>> {
		try {
			const insertData = mapRegistrationToDbInsert(input);

			const result = await this.db.insert(users).values(insertData).returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "InfraError",
					message: "Failed to create user - no data returned"
				});
			}

			return ok(mapRawUserToUser(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create user",
				cause
			});
		}
	}

	async completeRegistration(input: {
		readonly token: string;
		readonly name: string;
		readonly passwordHash: string;
	}): Promise<Result<User, AuthError>> {
		try {
			const updateData = mapCompletionToDbUpdate({
				name: input.name,
				passwordHash: input.passwordHash
			});

			const result = await this.db
				.update(users)
				.set(updateData)
				.where(eq(users.verificationToken, input.token))
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "NotFound",
					entity: "User",
					message: "Invalid verification token"
				});
			}

			return ok(mapRawUserToUser(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to complete user registration",
				cause
			});
		}
	}

	async updateLastLogin(
		userId: UserId,
		loginTime: Date
	): Promise<Result<User, AuthError>> {
		try {
			const updateData = mapLastLoginToDbUpdate(loginTime);

			const result = await this.db
				.update(users)
				.set(updateData)
				.where(eq(users.id, userId as unknown as number))
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "NotFound",
					entity: "User",
					id: userId,
					message: "User not found"
				});
			}

			return ok(mapRawUserToUser(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update last login",
				cause
			});
		}
	}

	async updateTheme(
		userId: UserId,
		theme: string,
		updateTime: Date
	): Promise<Result<User, AuthError>> {
		try {
			const updateData = mapThemeToDbUpdate(theme, updateTime);

			const result = await this.db
				.update(users)
				.set(updateData)
				.where(eq(users.id, userId as unknown as number))
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "NotFound",
					entity: "User",
					id: userId,
					message: "User not found"
				});
			}

			return ok(mapRawUserToUser(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update user theme",
				cause
			});
		}
	}

	async createOrUpdateOAuthUser(input: {
		readonly email: string;
		readonly userName: string;
		readonly googleId?: string;
		readonly lineId?: string;
		readonly oauthProvider: "google" | "line";
		readonly avatarUrl?: string;
	}): Promise<Result<User, AuthError>> {
		try {
			// 既存ユーザーを検索（GoogleIDまたはLINE IDで）
			const existingResult = input.googleId
				? await this.findByGoogleId(input.googleId)
				: input.lineId
					? await this.findByLineId(input.lineId)
					: await this.findByEmail(input.email);

			if (!existingResult.ok) return existingResult;

			if (existingResult.value) {
				// 既存ユーザーの場合は最終ログイン時刻を更新
				return this.updateLastLogin(existingResult.value.id, new Date());
			}

			// 新規OAuthユーザー作成
			const insertData = mapOAuthUserToDbInsert(input);

			const result = await this.db.insert(users).values(insertData).returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "InfraError",
					message: "Failed to create OAuth user - no data returned"
				});
			}

			return ok(mapRawUserToUser(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create or update OAuth user",
				cause
			});
		}
	}
}

import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { users } from "../../../../db/schema";
import type { AuthRepoPort } from "../../../auth/ports";
import type { User } from "../../domain/model/user";
import { toDomain } from "../mappers/dbToDomain";
import {
	toDbInsertForRegistration,
	toDbUpdateForCompletion,
	toDbUpdateForLastLogin,
	toDbUpdateForTheme
} from "../mappers/domainToDb";

export function createAuthRepo(dbInstance: AnyD1Database): AuthRepoPort {
	const db = drizzle(dbInstance);
	return {
		async findUserById(id) {
			const rows = await db
				.select()
				.from(users)
				.where(eq(users.id, id as unknown as number));
			const row = rows[0];
			return row ? toDomain(row) : null;
		},
		async findUserByEmail(email) {
			const rows = await db.select().from(users).where(eq(users.email, email));
			const row = rows[0];
			return row ? toDomain(row) : null;
		},
		async createUser(input) {
			await db.insert(users).values(toDbInsertForRegistration(input));
		},
		async findUserByVerificationToken(token) {
			const rows = await db
				.select()
				.from(users)
				.where(eq(users.verificationToken, token));
			const row = rows[0];
			return row ? toDomain(row) : null;
		},
		async completeUserRegistration(input) {
			await db
				.update(users)
				.set(toDbUpdateForCompletion(input))
				.where(eq(users.verificationToken, input.token));
		},
		async updateLastLoginAt(userId, iso) {
			await db
				.update(users)
				.set(toDbUpdateForLastLogin(iso))
				.where(eq(users.id, userId as unknown as number));
		},
		async updateUserTheme(userId, theme, iso) {
			await db
				.update(users)
				.set(toDbUpdateForTheme(theme, iso))
				.where(eq(users.id, userId as unknown as number));
		}
	};
}

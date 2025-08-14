import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";

export async function findUserById(dbInstance: AnyD1Database, id: number) {
	const db = drizzle(dbInstance);
	const results = await db.select().from(users).where(eq(users.id, id));
	return results[0] || null;
}

export async function findUserByEmail(
	dbInstance: AnyD1Database,
	email: string
) {
	const db = drizzle(dbInstance);
	const results = await db.select().from(users).where(eq(users.email, email));
	return results[0] || null;
}

export async function createUser(
	dbInstance: AnyD1Database,
	email: string,
	verificationToken: string
) {
	const db = drizzle(dbInstance);
	await db.insert(users).values({
		email,
		passwordHash: "", // 仮のパスワードハッシュ
		isVerified: false,
		verificationToken,
		createdAt: new Date().toISOString()
	});
}

export async function findUserByVerificationToken(
	dbInstance: AnyD1Database,
	token: string
) {
	const db = drizzle(dbInstance);
	const result = await db
		.select()
		.from(users)
		.where(eq(users.verificationToken, token));
	return result[0] || null;
}

export async function completeUserRegistration(
	dbInstance: AnyD1Database,
	token: string,
	name: string,
	passwordHash: string
) {
	const db = drizzle(dbInstance);
	await db
		.update(users)
		.set({
			userName: name,
			passwordHash: passwordHash,
			isVerified: true,
			verificationToken: null
		})
		.where(eq(users.verificationToken, token));
}

export async function updateLastLoginAt(
	dbInstance: AnyD1Database,
	userId: number
) {
	const db = drizzle(dbInstance);
	await db
		.update(users)
		.set({
			lastLoginAt: new Date().toISOString()
		})
		.where(eq(users.id, userId));
}

export async function updateUserTheme(
	dbInstance: AnyD1Database,
	userId: number,
	theme: string
) {
	const db = drizzle(dbInstance);
	await db
		.update(users)
		.set({
			theme,
			updatedAt: new Date().toISOString()
		})
		.where(eq(users.id, userId));
}

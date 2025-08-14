import type { AnyD1Database } from "drizzle-orm/d1";
import { findUserById, updateUserTheme } from "../repositories/userRepository";

export async function getUserById(dbInstance: AnyD1Database, id: number) {
	return findUserById(dbInstance, id);
}

export async function updateTheme(
	dbInstance: AnyD1Database,
	userId: number,
	theme: string
) {
	return updateUserTheme(dbInstance, userId, theme);
}

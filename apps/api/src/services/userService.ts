import type { AnyD1Database } from "drizzle-orm/d1";
import { findUserById } from "../repositories/userRepository";

export async function getUserById(dbInstance: AnyD1Database, id: number) {
	return findUserById(dbInstance, id);
}

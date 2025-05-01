import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";

export async function findUserById(dbInstance: AnyD1Database, id: number) {
	const db = drizzle(dbInstance);
	const results = await db.select().from(users).where(eq(users.id, id));
	return results[0] || null;
}

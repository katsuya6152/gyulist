import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";

export async function findCattleList(
	dbInstance: AnyD1Database,
	userId: number,
) {
	const db = drizzle(dbInstance);
	const results = await db
		.select()
		.from(cattle)
		.where(eq(cattle.ownerUserId, userId));
	return results || null;
}

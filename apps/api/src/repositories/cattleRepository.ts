import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { bloodline, cattle, motherInfo } from "../db/schema";

export async function findCattleList(
	dbInstance: AnyD1Database,
	userId: number,
) {
	const db = drizzle(dbInstance);
	const results = await db
		.select()
		.from(cattle)
		.leftJoin(motherInfo, eq(cattle.cattleId, motherInfo.cattleId))
		.leftJoin(bloodline, eq(cattle.cattleId, bloodline.cattleId))
		.where(eq(cattle.ownerUserId, userId));
	return results || null;
}

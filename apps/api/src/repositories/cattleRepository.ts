import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";
import type { CreateCattleInput } from "../validators/cattleValidator";

export async function findCattleList(db: AnyD1Database, userId: number) {
	const dbInstance = drizzle(db, { schema: { cattle } });
	const results = await dbInstance
		.select()
		.from(cattle)
		.where(eq(cattle.ownerUserId, userId));
	return results || null;
}

export async function createCattle(db: AnyD1Database, data: CreateCattleInput) {
	const dbInstance = drizzle(db, { schema: { cattle } });
	const [result] = await dbInstance.insert(cattle).values(data).returning();
	return result;
}

export async function findCattleById(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db, { schema: { cattle } });
	return await dbInstance.query.cattle.findFirst({
		where: eq(cattle.cattleId, cattleId),
	});
}

export async function updateCattle(
	db: AnyD1Database,
	cattleId: number,
	data: Partial<CreateCattleInput>,
) {
	const dbInstance = drizzle(db, { schema: { cattle } });
	const [result] = await dbInstance
		.update(cattle)
		.set(data)
		.where(eq(cattle.cattleId, cattleId))
		.returning();
	return result;
}

export async function deleteCattle(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db, { schema: { cattle } });
	const [result] = await dbInstance
		.delete(cattle)
		.where(eq(cattle.cattleId, cattleId))
		.returning();
	return result;
}

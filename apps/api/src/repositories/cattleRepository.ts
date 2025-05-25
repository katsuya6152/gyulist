import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";
import type {
	CreateCattleInput,
	UpdateCattleInput,
} from "../validators/cattleValidator";
export async function findCattleList(db: AnyD1Database, ownerUserId: number) {
	const dbInstance = drizzle(db);
	return await dbInstance
		.select()
		.from(cattle)
		.where(eq(cattle.ownerUserId, ownerUserId));
}

export async function findCattleById(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.select()
		.from(cattle)
		.where(eq(cattle.cattleId, cattleId));
	return result[0] ?? null;
}

export async function createCattle(db: AnyD1Database, data: CreateCattleInput) {
	const dbInstance = drizzle(db);
	const result = await dbInstance.insert(cattle).values(data).returning();
	return result[0];
}

export async function updateCattle(
	db: AnyD1Database,
	cattleId: number,
	data: UpdateCattleInput,
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.update(cattle)
		.set({ ...data, updatedAt: new Date().toISOString() })
		.where(eq(cattle.cattleId, cattleId))
		.returning();
	return result[0];
}

export async function deleteCattle(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db);
	await dbInstance.delete(cattle).where(eq(cattle.cattleId, cattleId));
}

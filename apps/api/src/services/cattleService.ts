import type { AnyD1Database } from "drizzle-orm/d1";
import { findCattleList } from "../repositories/cattleRepository";

export async function getCattleList(dbInstance: AnyD1Database, userId: number) {
	return findCattleList(dbInstance, userId);
}

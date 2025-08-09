import type { AnyD1Database } from "drizzle-orm/d1";
import { updateCattle } from "../repositories/cattleRepository";

// 牛の状態を更新するシンプルなサービス
export async function updateStatus(
	db: AnyD1Database,
	cattleId: number,
	status: string,
) {
	await updateCattle(db, cattleId, { healthStatus: status });
}

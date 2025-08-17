import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { motherInfo } from "../../../../db/schema";
import type { CattleId } from "../../../../shared/brand";
import type { MotherInfoRepoPort } from "../../ports";
import { motherInfoFromDb, motherInfoToDb } from "../mappers/breedingMappers";

export function makeMotherInfoRepo(db: AnyD1Database): MotherInfoRepoPort {
	const d = drizzle(db);
	return {
		async findByCattleId(cattleId) {
			const rows = await d
				.select()
				.from(motherInfo)
				.where(eq(motherInfo.cattleId, cattleId as unknown as number))
				.limit(1);
			const row = rows[0];
			return row ? motherInfoFromDb(row) : null;
		},

		async save(cattleId, info) {
			const exists = await d
				.select({ id: motherInfo.motherInfoId })
				.from(motherInfo)
				.where(eq(motherInfo.cattleId, cattleId as unknown as number))
				.limit(1);

			const values = motherInfoToDb(cattleId, info);
			if (exists.length > 0) {
				await d
					.update(motherInfo)
					.set(values)
					.where(eq(motherInfo.cattleId, cattleId as unknown as number))
					.returning();
			} else {
				await d.insert(motherInfo).values(values).returning();
			}
		},

		async delete(cattleId: CattleId) {
			await d
				.delete(motherInfo)
				.where(eq(motherInfo.cattleId, cattleId as unknown as number));
		},

		async findByMotherCattleId() {
			// Not implemented yet
			return [];
		},

		async getMotherInfoCompleteness() {
			// Not implemented yet
			return [];
		}
	};
}

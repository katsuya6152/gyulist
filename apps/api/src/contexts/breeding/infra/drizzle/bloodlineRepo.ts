import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { bloodline } from "../../../../db/schema";
import type { CattleId } from "../../../../shared/brand";
import type { BloodlineRepoPort } from "../../ports";
import { bloodlineFromDb, bloodlineToDb } from "../mappers/breedingMappers";

export function makeBloodlineRepo(db: AnyD1Database): BloodlineRepoPort {
	const d = drizzle(db);
	return {
		async findByCattleId(cattleId) {
			const rows = await d
				.select()
				.from(bloodline)
				.where(eq(bloodline.cattleId, cattleId as unknown as number))
				.limit(1);
			const row = rows[0];
			return row ? bloodlineFromDb(row) : null;
		},

		async save(cattleId, b) {
			const exists = await d
				.select({ id: bloodline.bloodlineId })
				.from(bloodline)
				.where(eq(bloodline.cattleId, cattleId as unknown as number))
				.limit(1);

			const values = bloodlineToDb(cattleId, b);
			if (exists.length > 0) {
				await d
					.update(bloodline)
					.set(values)
					.where(eq(bloodline.cattleId, cattleId as unknown as number))
					.returning();
			} else {
				await d.insert(bloodline).values(values).returning();
			}
		},

		async delete(cattleId: CattleId) {
			await d
				.delete(bloodline)
				.where(eq(bloodline.cattleId, cattleId as unknown as number));
		},

		async searchByBloodline() {
			// Not implemented yet
			return [];
		}
	};
}

import type { InferInsertModel } from "drizzle-orm";
import type { cattle as CattleTable } from "../../../../db/schema";
import type { Cattle } from "../../domain/model/cattle";

export function toDbInsert(c: Cattle): InferInsertModel<typeof CattleTable> {
	return {
		cattleId: c.cattleId as unknown as number,
		ownerUserId: c.ownerUserId as unknown as number,
		identificationNumber: c.identificationNumber as unknown as number,
		earTagNumber: c.earTagNumber ?? null,
		name: c.name ?? null,
		gender: c.gender ?? null,
		birthday: c.birthday ?? null,
		growthStage: c.growthStage ?? null,
		age: c.age ?? null,
		monthsOld: c.monthsOld ?? null,
		daysOld: c.daysOld ?? null,
		breed: c.breed ?? null,
		status: c.status ?? null,
		producerName: c.producerName ?? null,
		barn: c.barn ?? null,
		breedingValue: c.breedingValue ?? null,
		notes: c.notes ?? null,
		weight: c.weight ?? null,
		score: c.score ?? null,
		createdAt: c.createdAt,
		updatedAt: c.updatedAt
	};
}

export function toDbUpdate(
	partial: Partial<Cattle>
): Partial<InferInsertModel<typeof CattleTable>> {
	const base = toDbInsert({
		...(partial as Cattle)
	});
	return base;
}

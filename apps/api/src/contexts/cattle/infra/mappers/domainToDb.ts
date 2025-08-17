import type { InferInsertModel } from "drizzle-orm";
import type { cattle as CattleTable } from "../../../../db/schema";
import type { Cattle } from "../../domain/model/cattle";

function toIsoOrNull(value: unknown): string | null {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return null;
}

function toIsoOrUndefined(value: unknown): string | undefined {
	if (value == null) return undefined;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return undefined;
}

export function toDbInsert(c: Cattle): InferInsertModel<typeof CattleTable> {
	return {
		// Omit primary key to allow auto-increment
		cattleId: undefined,
		ownerUserId: c.ownerUserId as unknown as number,
		identificationNumber: c.identificationNumber as unknown as number,
		earTagNumber: c.earTagNumber ?? null,
		name: c.name ?? null,
		gender: c.gender ?? null,
		birthday: toIsoOrNull(c.birthday),
		growthStage: c.growthStage ?? null,
		age: c.age ?? null,
		monthsOld: c.monthsOld ?? null,
		daysOld: c.daysOld ?? null,
		breed: c.breed ?? null,
		status: c.status ?? undefined,
		producerName: c.producerName ?? null,
		barn: c.barn ?? null,
		breedingValue: c.breedingValue ?? null,
		notes: c.notes ?? null,
		weight: c.weight ?? null,
		score: c.score ?? null,
		createdAt: toIsoOrUndefined(c.createdAt),
		updatedAt: toIsoOrUndefined(c.updatedAt)
	};
}

export function toDbUpdate(
	partial: Partial<Cattle>
): Partial<InferInsertModel<typeof CattleTable>> {
	const result: Partial<InferInsertModel<typeof CattleTable>> = {};

	if (partial.cattleId !== undefined)
		result.cattleId = partial.cattleId as unknown as number;
	if (partial.ownerUserId !== undefined)
		result.ownerUserId = partial.ownerUserId as unknown as number;
	if (partial.identificationNumber !== undefined)
		result.identificationNumber =
			partial.identificationNumber as unknown as number;
	if (partial.earTagNumber !== undefined)
		result.earTagNumber = partial.earTagNumber ?? null;
	if (partial.name !== undefined) result.name = partial.name ?? null;
	if (partial.gender !== undefined) result.gender = partial.gender ?? null;
	if (partial.birthday !== undefined)
		result.birthday = toIsoOrNull(partial.birthday);
	if (partial.growthStage !== undefined)
		result.growthStage = partial.growthStage ?? null;
	if (partial.age !== undefined) result.age = partial.age ?? null;
	if (partial.monthsOld !== undefined)
		result.monthsOld = partial.monthsOld ?? null;
	if (partial.daysOld !== undefined) result.daysOld = partial.daysOld ?? null;
	if (partial.breed !== undefined) result.breed = partial.breed ?? null;
	if (partial.status !== undefined) result.status = partial.status ?? null;
	if (partial.producerName !== undefined)
		result.producerName = partial.producerName ?? null;
	if (partial.barn !== undefined) result.barn = partial.barn ?? null;
	if (partial.breedingValue !== undefined)
		result.breedingValue = partial.breedingValue ?? null;
	if (partial.notes !== undefined) result.notes = partial.notes ?? null;
	if (partial.weight !== undefined) result.weight = partial.weight ?? null;
	if (partial.score !== undefined) result.score = partial.score ?? null;
	if (partial.createdAt !== undefined)
		result.createdAt = toIsoOrUndefined(partial.createdAt);
	if (partial.updatedAt !== undefined)
		result.updatedAt = toIsoOrUndefined(partial.updatedAt);

	return result;
}

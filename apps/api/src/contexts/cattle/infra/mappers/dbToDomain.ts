import type { InferSelectModel } from "drizzle-orm";
import type { cattle as CattleTable } from "../../../../db/schema";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Brand } from "../../../../shared/brand";
import type { Cattle as DomainCattle } from "../../domain/model/cattle";

export function toDomain(
	row: InferSelectModel<typeof CattleTable>
): DomainCattle {
	return {
		cattleId: row.cattleId as unknown as CattleId,
		ownerUserId: row.ownerUserId as unknown as UserId,
		identificationNumber: row.identificationNumber as unknown as Brand<
			number,
			"IdentificationNumber"
		>,
		earTagNumber: (row.earTagNumber ?? null) as DomainCattle["earTagNumber"],
		name: (row.name ?? null) as DomainCattle["name"],
		gender: (row.gender ?? null) as DomainCattle["gender"],
		birthday: (row.birthday ?? null) as DomainCattle["birthday"],
		growthStage: (row.growthStage ?? null) as DomainCattle["growthStage"],
		age: (row.age ?? null) as DomainCattle["age"],
		monthsOld: (row.monthsOld ?? null) as DomainCattle["monthsOld"],
		daysOld: (row.daysOld ?? null) as DomainCattle["daysOld"],
		breed: (row.breed ?? null) as DomainCattle["breed"],
		status: (row.status ?? null) as DomainCattle["status"],
		producerName: (row.producerName ?? null) as DomainCattle["producerName"],
		barn: (row.barn ?? null) as DomainCattle["barn"],
		breedingValue: (row.breedingValue ?? null) as DomainCattle["breedingValue"],
		notes: (row.notes ?? null) as DomainCattle["notes"],
		createdAt: row.createdAt ?? new Date(0).toISOString(),
		updatedAt: row.updatedAt ?? new Date(0).toISOString()
	};
}

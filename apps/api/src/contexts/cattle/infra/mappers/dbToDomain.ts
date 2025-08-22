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
		birthday: row.birthday ? new Date(row.birthday) : null,
		growthStage: (row.growthStage ?? null) as DomainCattle["growthStage"],
		breed: (row.breed ?? null) as DomainCattle["breed"],
		status: (row.status ?? null) as DomainCattle["status"],
		producerName: (row.producerName ?? null) as DomainCattle["producerName"],
		barn: (row.barn ?? null) as DomainCattle["barn"],
		breedingValue: (row.breedingValue ?? null) as DomainCattle["breedingValue"],
		notes: (row.notes ?? null) as DomainCattle["notes"],
		weight: (row.weight ?? null) as DomainCattle["weight"],
		score: (row.score ?? null) as DomainCattle["score"],
		createdAt: new Date(row.createdAt ?? new Date(0).toISOString()),
		updatedAt: new Date(row.updatedAt ?? new Date(0).toISOString()),
		version: 1 // Default version for existing records
	};
}

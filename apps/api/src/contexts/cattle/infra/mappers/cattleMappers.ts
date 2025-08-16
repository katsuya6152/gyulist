import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { cattle as CattleTable } from "../../../../db/schema";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import type {
	Barn,
	Breed,
	BreedingValue,
	CattleName,
	EarTagNumber,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Weight
} from "../../domain/model/cattle";

// Database to Domain mapping
export function cattleToDomain(
	row: InferSelectModel<typeof CattleTable>
): Cattle {
	return {
		cattleId: row.cattleId as CattleId,
		ownerUserId: row.ownerUserId as UserId,
		identificationNumber: row.identificationNumber as IdentificationNumber,
		earTagNumber: (row.earTagNumber ?? null) as EarTagNumber | null,
		name: (row.name ?? null) as CattleName | null,
		gender: (row.gender ?? null) as Cattle["gender"],
		birthday: row.birthday ? new Date(row.birthday) : null,
		growthStage: (row.growthStage ?? null) as Cattle["growthStage"],
		age: (row.age ?? null) as Cattle["age"],
		monthsOld: (row.monthsOld ?? null) as Cattle["monthsOld"],
		daysOld: (row.daysOld ?? null) as Cattle["daysOld"],
		breed: (row.breed ?? null) as Breed | null,
		status: (row.status ?? null) as Cattle["status"],
		producerName: (row.producerName ?? null) as ProducerName | null,
		barn: (row.barn ?? null) as Barn | null,
		breedingValue: (row.breedingValue ?? null) as BreedingValue | null,
		notes: (row.notes ?? null) as Notes | null,
		weight: (row.weight ?? null) as Weight | null,
		score: (row.score ?? null) as Score | null,
		createdAt: new Date(row.createdAt ?? new Date(0).toISOString()),
		updatedAt: new Date(row.updatedAt ?? new Date(0).toISOString()),
		version: 1 // Default version for existing records
	};
}

// Domain to Database mapping for insert
export function cattleToDbInsert(
	props: NewCattleProps
): InferInsertModel<typeof CattleTable> {
	return {
		ownerUserId: props.ownerUserId as unknown as number,
		identificationNumber: props.identificationNumber as unknown as number,
		earTagNumber: props.earTagNumber as unknown as number | null,
		name: props.name ?? null,
		gender: props.gender ?? null,
		birthday: props.birthday?.toISOString() ?? null,
		growthStage: props.growthStage ?? null,
		breed: props.breed ?? null,
		status: props.status ?? "HEALTHY",
		producerName: props.producerName ?? null,
		barn: props.barn ?? null,
		breedingValue: props.breedingValue ?? null,
		notes: props.notes ?? null,
		weight: props.weight ?? null,
		score: props.score ?? null,
		// age fields will be calculated by the domain
		age: null,
		monthsOld: null,
		daysOld: null
	};
}

// Domain to Database mapping for update
export function cattleToDbUpdate(
	updates: Partial<NewCattleProps>
): Partial<InferInsertModel<typeof CattleTable>> {
	const dbUpdates: Partial<InferInsertModel<typeof CattleTable>> = {};

	if (updates.identificationNumber !== undefined) {
		dbUpdates.identificationNumber =
			updates.identificationNumber as unknown as number;
	}
	if (updates.earTagNumber !== undefined) {
		dbUpdates.earTagNumber = updates.earTagNumber as unknown as number | null;
	}
	if (updates.name !== undefined) {
		dbUpdates.name = updates.name;
	}
	if (updates.gender !== undefined) {
		dbUpdates.gender = updates.gender;
	}
	if (updates.birthday !== undefined) {
		dbUpdates.birthday = updates.birthday?.toISOString() ?? null;
	}
	if (updates.growthStage !== undefined) {
		dbUpdates.growthStage = updates.growthStage;
	}
	if (updates.breed !== undefined) {
		dbUpdates.breed = updates.breed;
	}
	if (updates.status !== undefined) {
		dbUpdates.status = updates.status;
	}
	if (updates.producerName !== undefined) {
		dbUpdates.producerName = updates.producerName;
	}
	if (updates.barn !== undefined) {
		dbUpdates.barn = updates.barn;
	}
	if (updates.breedingValue !== undefined) {
		dbUpdates.breedingValue = updates.breedingValue;
	}
	if (updates.notes !== undefined) {
		dbUpdates.notes = updates.notes;
	}
	if (updates.weight !== undefined) {
		dbUpdates.weight = updates.weight;
	}
	if (updates.score !== undefined) {
		dbUpdates.score = updates.score;
	}

	return dbUpdates;
}

// Helper function to calculate age fields for database storage
export function calculateAgeFields(
	birthday: Date | null,
	currentDate: Date
): {
	age: number | null;
	monthsOld: number | null;
	daysOld: number | null;
} {
	if (!birthday) {
		return { age: null, monthsOld: null, daysOld: null };
	}

	const diffMs = currentDate.getTime() - birthday.getTime();
	return {
		age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
		monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)),
		daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24))
	};
}

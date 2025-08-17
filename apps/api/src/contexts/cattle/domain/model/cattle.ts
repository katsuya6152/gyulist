import type { Brand, CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";

export type GrowthStage =
	| "CALF"
	| "GROWING"
	| "FATTENING"
	| "FIRST_CALVED"
	| "MULTI_PAROUS";

export type Gender = "オス" | "メス";

export type Status =
	| "HEALTHY"
	| "PREGNANT"
	| "RESTING"
	| "TREATING"
	| "SHIPPED"
	| "DEAD";

export type IdentificationNumber = Brand<number, "IdentificationNumber">;
export type EarTagNumber = Brand<number, "EarTagNumber">;
export type CattleName = Brand<string, "CattleName">;
export type Breed = Brand<string, "Breed">;
export type ProducerName = Brand<string, "ProducerName">;
export type Barn = Brand<string, "Barn">;
export type BreedingValue = Brand<string, "BreedingValue">;
export type Notes = Brand<string, "Notes">;
export type Weight = Brand<number, "Weight">;
export type Score = Brand<number, "Score">;

// Core Cattle Entity (Aggregate Root)
export type Cattle = {
	readonly cattleId: CattleId;
	readonly ownerUserId: UserId;
	readonly identificationNumber: IdentificationNumber;
	readonly earTagNumber: EarTagNumber | null;
	readonly name: CattleName | null;
	readonly gender: Gender | null;
	readonly birthday: Date | null;
	readonly growthStage: GrowthStage | null;
	readonly age: number | null; // Computed field
	readonly monthsOld: number | null; // Computed field
	readonly daysOld: number | null; // Computed field
	readonly breed: Breed | null;
	readonly status: Status | null;
	readonly producerName: ProducerName | null;
	readonly barn: Barn | null;
	readonly breedingValue: BreedingValue | null;
	readonly notes: Notes | null;
	readonly weight: Weight | null;
	readonly score: Score | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly version: number; // For optimistic concurrency control
};

export type NewCattleProps = {
	ownerUserId: UserId;
	identificationNumber: IdentificationNumber;
	earTagNumber?: EarTagNumber | null;
	name?: string | null;
	gender?: Gender | null;
	birthday?: Date | null;
	growthStage?: GrowthStage | null;
	breed?: string | null;
	status?: Status | null;
	producerName?: string | null;
	barn?: string | null;
	breedingValue?: string | null;
	notes?: string | null;
	weight?: number | null;
	score?: number | null;
};

// Factory function for creating cattle with validation
export function createCattle(
	props: NewCattleProps,
	currentDate: Date = new Date()
): Result<Cattle, DomainError> {
	// Validation: identification number must be positive
	if (props.identificationNumber <= 0) {
		return err({
			type: "ValidationError",
			message: "Identification number must be positive",
			field: "identificationNumber"
		});
	}

	// Validation: birthday cannot be in the future
	if (props.birthday && props.birthday > currentDate) {
		return err({
			type: "ValidationError",
			message: "Birthday cannot be in the future",
			field: "birthday"
		});
	}

	// Validation: weight must be positive if provided
	if (
		props.weight !== null &&
		props.weight !== undefined &&
		props.weight <= 0
	) {
		return err({
			type: "ValidationError",
			message: "Weight must be positive",
			field: "weight"
		});
	}

	// Validation: score must be between 0 and 100 if provided
	if (props.score !== null && props.score !== undefined) {
		if (props.score < 0 || props.score > 100) {
			return err({
				type: "ValidationError",
				message: "Score must be between 0 and 100",
				field: "score"
			});
		}
	}

	// Calculate age-derived values
	const ageValues = props.birthday
		? calculateAge(props.birthday, currentDate)
		: {
				age: null,
				monthsOld: null,
				daysOld: null
			};

	// Validate and transform string fields
	const name = validateAndTransformString(props.name, "name");
	const breed = validateAndTransformString(props.breed, "breed");
	const producerName = validateAndTransformString(
		props.producerName,
		"producerName"
	);
	const barn = validateAndTransformString(props.barn, "barn");
	const breedingValue = validateAndTransformString(
		props.breedingValue,
		"breedingValue"
	);
	const notes = validateAndTransformString(props.notes, "notes");

	return ok({
		cattleId: 0 as CattleId, // Will be set by repository
		ownerUserId: props.ownerUserId,
		identificationNumber: props.identificationNumber,
		earTagNumber: props.earTagNumber ?? null,
		name: name as CattleName | null,
		gender: props.gender ?? null,
		birthday: props.birthday ?? null,
		growthStage: props.growthStage ?? null,
		age: ageValues.age,
		monthsOld: ageValues.monthsOld,
		daysOld: ageValues.daysOld,
		breed: breed as Breed | null,
		status: props.status ?? "HEALTHY",
		producerName: producerName as ProducerName | null,
		barn: barn as Barn | null,
		breedingValue: breedingValue as BreedingValue | null,
		notes: notes as Notes | null,
		weight: props.weight as Weight | null,
		score: props.score as Score | null,
		createdAt: currentDate,
		updatedAt: currentDate,
		version: 1
	});
}

// Pure function to update cattle with validation
export function updateCattle(
	current: Cattle,
	updates: Partial<NewCattleProps>,
	currentDate: Date = new Date()
): Result<Cattle, DomainError> {
	// Validate birthday if being updated
	if (updates.birthday && updates.birthday > currentDate) {
		return err({
			type: "ValidationError",
			message: "Birthday cannot be in the future",
			field: "birthday"
		});
	}

	// Validate weight if being updated
	if (
		updates.weight !== undefined &&
		updates.weight !== null &&
		updates.weight <= 0
	) {
		return err({
			type: "ValidationError",
			message: "Weight must be positive",
			field: "weight"
		});
	}

	// Validate score if being updated
	if (updates.score !== undefined && updates.score !== null) {
		if (updates.score < 0 || updates.score > 100) {
			return err({
				type: "ValidationError",
				message: "Score must be between 0 and 100",
				field: "score"
			});
		}
	}

	// Recalculate age if birthday is being updated
	const birthday =
		updates.birthday !== undefined ? updates.birthday : current.birthday;
	const ageValues = birthday
		? calculateAge(birthday, currentDate)
		: {
				age: current.age,
				monthsOld: current.monthsOld,
				daysOld: current.daysOld
			};

	// Transform string fields
	const name =
		updates.name !== undefined
			? (validateAndTransformString(updates.name, "name") as CattleName | null)
			: current.name;
	const breed =
		updates.breed !== undefined
			? (validateAndTransformString(updates.breed, "breed") as Breed | null)
			: current.breed;
	const producerName =
		updates.producerName !== undefined
			? (validateAndTransformString(
					updates.producerName,
					"producerName"
				) as ProducerName | null)
			: current.producerName;
	const barn =
		updates.barn !== undefined
			? (validateAndTransformString(updates.barn, "barn") as Barn | null)
			: current.barn;
	const breedingValue =
		updates.breedingValue !== undefined
			? (validateAndTransformString(
					updates.breedingValue,
					"breedingValue"
				) as BreedingValue | null)
			: current.breedingValue;
	const notes =
		updates.notes !== undefined
			? (validateAndTransformString(updates.notes, "notes") as Notes | null)
			: current.notes;

	return ok({
		...current,
		identificationNumber:
			updates.identificationNumber ?? current.identificationNumber,
		earTagNumber:
			updates.earTagNumber !== undefined
				? updates.earTagNumber
				: current.earTagNumber,
		name,
		gender: updates.gender !== undefined ? updates.gender : current.gender,
		birthday,
		growthStage:
			updates.growthStage !== undefined
				? updates.growthStage
				: current.growthStage,
		age: ageValues.age,
		monthsOld: ageValues.monthsOld,
		daysOld: ageValues.daysOld,
		breed,
		status: updates.status !== undefined ? updates.status : current.status,
		producerName,
		barn,
		breedingValue,
		notes,
		weight:
			updates.weight !== undefined
				? (updates.weight as Weight | null)
				: current.weight,
		score:
			updates.score !== undefined
				? (updates.score as Score | null)
				: current.score,
		updatedAt: currentDate,
		version: current.version + 1
	});
}

// Helper function to calculate age from birthday
function calculateAge(
	birthday: Date,
	currentDate: Date
): {
	age: number;
	monthsOld: number;
	daysOld: number;
} {
	const diffMs = currentDate.getTime() - birthday.getTime();
	return {
		age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
		monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)),
		daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24))
	};
}

// Helper function to validate and transform string fields
function validateAndTransformString(
	value: string | null | undefined,
	fieldName: string
): string | null {
	if (value === undefined || value === null) return null;
	if (typeof value !== "string") {
		throw new Error(`${fieldName} must be a string`);
	}
	const trimmed = value.trim();
	return trimmed === "" ? null : trimmed;
}

// Pure function to check if cattle is in breeding age
export function isBreedingAge(cattle: Cattle): boolean {
	if (!cattle.age || !cattle.gender) return false;
	if (cattle.gender === "オス") return cattle.age >= 1;
	return cattle.age >= 2; // Female cattle typically breed at 2 years old
}

// Pure function to get cattle life stage
export function getCattleLifeStage(
	cattle: Cattle
): "Calf" | "Young" | "Adult" | "Senior" | "Unknown" {
	if (!cattle.age) return "Unknown";

	if (cattle.age < 1) return "Calf";
	if (cattle.age < 3) return "Young";
	if (cattle.age < 10) return "Adult";
	return "Senior";
}

// Pure function to check if cattle needs health checkup
export function needsHealthCheckup(
	cattle: Cattle,
	lastCheckupDate: Date | null,
	currentDate: Date
): boolean {
	if (!lastCheckupDate) return true;

	const daysSinceCheckup = Math.floor(
		(currentDate.getTime() - lastCheckupDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	// Different checkup intervals based on life stage
	const lifeStage = getCattleLifeStage(cattle);
	switch (lifeStage) {
		case "Calf":
			return daysSinceCheckup > 30; // Monthly for calves
		case "Young":
			return daysSinceCheckup > 90; // Quarterly for young cattle
		case "Adult":
			return daysSinceCheckup > 180; // Semi-annually for adults
		case "Senior":
			return daysSinceCheckup > 90; // Quarterly for seniors
		default:
			return daysSinceCheckup > 180;
	}
}

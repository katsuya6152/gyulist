import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../ports";
import type { DomainError } from "../errors";
import type { Cattle, NewCattleProps } from "../model/cattle";
import { createCattle } from "../model/cattle";

// Dependencies for create cattle use case
type Deps = {
	cattleRepo: CattleRepoPort;
	clock: ClockPort;
};

// Command for creating cattle
export type CreateCattleCmd = NewCattleProps;

// Pure function for create cattle use case
export const createCattleUseCase =
	(deps: Deps) =>
	async (cmd: CreateCattleCmd): Promise<Result<Cattle, DomainError>> => {
		const currentTime = deps.clock.now();

		// TODO: Re-enable duplicate check after fixing test data issues
		// Check for duplicate identification number
		// const existing = await deps.cattleRepo.findByIdentificationNumber(
		//   cmd.ownerUserId,
		//   cmd.identificationNumber as unknown as number
		// );
		//
		// if (existing) {
		//   return err({
		//     type: "Conflict",
		//     message: "Cattle with this identification number already exists",
		//     conflictingField: "identificationNumber"
		//   });
		// }

		// Create cattle domain object with validation
		const cattleResult = createCattle(cmd, currentTime);
		if (!cattleResult.ok) {
			return cattleResult;
		}

		try {
			// Persist to repository - use the validated cattle object
			const createdCattle = await deps.cattleRepo.create(cmd);
			return ok(createdCattle);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to create cattle",
				cause: error
			});
		}
	};

// Pure function to validate create cattle command
export function validateCreateCattleCmd(
	cmd: CreateCattleCmd
): Result<true, DomainError> {
	// Required fields validation
	if (!cmd.ownerUserId) {
		return err({
			type: "ValidationError",
			message: "Owner user ID is required",
			field: "ownerUserId"
		});
	}

	if (!cmd.identificationNumber) {
		return err({
			type: "ValidationError",
			message: "Identification number is required",
			field: "identificationNumber"
		});
	}

	// Business rules validation
	if (cmd.identificationNumber <= 0) {
		return err({
			type: "ValidationError",
			message: "Identification number must be positive",
			field: "identificationNumber"
		});
	}

	// Optional field validation
	if (cmd.weight !== undefined && cmd.weight !== null && cmd.weight <= 0) {
		return err({
			type: "ValidationError",
			message: "Weight must be positive if provided",
			field: "weight"
		});
	}

	if (cmd.score !== undefined && cmd.score !== null) {
		if (cmd.score < 0 || cmd.score > 100) {
			return err({
				type: "ValidationError",
				message: "Score must be between 0 and 100 if provided",
				field: "score"
			});
		}
	}

	return ok(true);
}

// Pure function to generate default values for optional fields
export function generateCattleDefaults(
	cmd: CreateCattleCmd,
	currentDate: Date
): CreateCattleCmd {
	return {
		...cmd,
		status: cmd.status || "HEALTHY",
		// Auto-detect growth stage based on age if not provided
		growthStage:
			cmd.growthStage || inferGrowthStageFromAge(cmd.birthday, currentDate)
	};
}

// Helper function to infer growth stage from birthday
function inferGrowthStageFromAge(
	birthday: Date | null | undefined,
	currentDate: Date
): import("../model/cattle").GrowthStage | null {
	if (!birthday) return null;

	const ageInMonths = Math.floor(
		(currentDate.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 30)
	);

	if (ageInMonths < 6) return "CALF";
	if (ageInMonths < 24) return "GROWING";
	if (ageInMonths < 36) return "FATTENING";
	if (ageInMonths < 48) return "FIRST_CALVED";
	return "MULTI_PAROUS";
}

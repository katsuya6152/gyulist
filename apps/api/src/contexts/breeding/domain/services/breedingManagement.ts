import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../cattle/domain/errors";
import type { BreedingAggregate } from "../../../cattle/domain/model/breedingAggregate";
import {
	applyBreedingEvent,
	createBreedingAggregate
} from "../../../cattle/domain/model/breedingAggregate";
import type {
	BreedingEvent,
	BreedingStatus
} from "../../../cattle/domain/model/breedingStatus";
import { createInitialBreedingStatus } from "../../../cattle/domain/model/breedingStatus";
import type { BreedingRepoPort } from "../../ports";

// Dependencies for breeding management use cases
type Deps = {
	breedingRepo: BreedingRepoPort;
	clock: ClockPort;
};

// Command for recording breeding event
export type RecordBreedingEventCmd = {
	requesterUserId: UserId;
	cattleId: CattleId;
	event: {
		type: BreedingEvent["type"];
		memo?: string | null;
		expectedCalvingDate?: Date;
		scheduledPregnancyCheckDate?: Date | null;
		isDifficultBirth?: boolean;
	};
};

// Command for initializing breeding aggregate
export type InitializeBreedingCmd = {
	requesterUserId: UserId;
	cattleId: CattleId;
	initialParity: number;
	memo?: string | null;
};

// Pure function for recording breeding event
export const recordBreedingEventUseCase =
	(deps: Deps) =>
	async (
		cmd: RecordBreedingEventCmd
	): Promise<Result<BreedingAggregate, DomainError>> => {
		const currentTime = deps.clock.now();

		// Create full event with timestamp
		const event: BreedingEvent = createBreedingEventFromCommand(
			cmd.event,
			currentTime
		);

		try {
			// Fetch current breeding aggregate
			let aggregate = await deps.breedingRepo.findByCattleId(cmd.cattleId);

			// Initialize if doesn't exist
			if (!aggregate) {
				const initialStatusResult = createInitialBreedingStatus({
					parity: 0,
					memo: null
				});

				if (!initialStatusResult.ok) {
					return initialStatusResult;
				}

				aggregate = createBreedingAggregate(
					cmd.cattleId,
					initialStatusResult.value
				);
			}

			// Apply the breeding event
			const updatedAggregateResult = applyBreedingEvent(
				aggregate,
				event,
				currentTime
			);
			if (!updatedAggregateResult.ok) {
				return updatedAggregateResult;
			}

			// Save updated aggregate
			const savedAggregate = await deps.breedingRepo.save(
				updatedAggregateResult.value
			);
			return ok(savedAggregate);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to record breeding event",
				cause: error
			});
		}
	};

// Pure function for initializing breeding aggregate
export const initializeBreedingUseCase =
	(deps: Deps) =>
	async (
		cmd: InitializeBreedingCmd
	): Promise<Result<BreedingAggregate, DomainError>> => {
		try {
			// Check if aggregate already exists
			const existing = await deps.breedingRepo.findByCattleId(cmd.cattleId);
			if (existing) {
				return err({
					type: "Conflict",
					message: "Breeding aggregate already exists for this cattle"
				});
			}

			// Create initial breeding status
			const initialStatusResult = createInitialBreedingStatus({
				parity: cmd.initialParity,
				memo: cmd.memo
			});

			if (!initialStatusResult.ok) {
				return initialStatusResult;
			}

			// Create and save new aggregate
			const aggregate = createBreedingAggregate(
				cmd.cattleId,
				initialStatusResult.value
			);
			const savedAggregate = await deps.breedingRepo.save(aggregate);

			return ok(savedAggregate);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to initialize breeding aggregate",
				cause: error
			});
		}
	};

// Query function for getting breeding status
export const getBreedingStatusUseCase =
	(deps: Deps) =>
	async (
		cattleId: CattleId
	): Promise<Result<BreedingAggregate | null, DomainError>> => {
		try {
			const aggregate = await deps.breedingRepo.findByCattleId(cattleId);
			return ok(aggregate);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to get breeding status",
				cause: error
			});
		}
	};

// Query function for getting cattle needing breeding attention
export const getCattleNeedingBreedingAttentionUseCase =
	(deps: Deps) =>
	async (ownerUserId: UserId): Promise<Result<CattleId[], DomainError>> => {
		try {
			const currentTime = deps.clock.now();
			const cattleIds = await deps.breedingRepo.findCattleNeedingAttention(
				ownerUserId,
				currentTime
			);
			return ok(cattleIds);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to get cattle needing attention",
				cause: error
			});
		}
	};

// Query function for getting breeding statistics
export const getBreedingStatisticsUseCase =
	(deps: Deps) =>
	async (params: {
		ownerUserId: UserId;
		startDate: Date;
		endDate: Date;
	}): Promise<
		Result<
			{
				totalInseminations: number;
				totalPregnancies: number;
				totalCalvings: number;
				averagePregnancyRate: number;
				difficultBirthRate: number;
			},
			DomainError
		>
	> => {
		try {
			const stats = await deps.breedingRepo.getBreedingStatistics(
				params.ownerUserId,
				params.startDate,
				params.endDate
			);
			return ok(stats);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to get breeding statistics",
				cause: error
			});
		}
	};

// Pure function to validate breeding event command
export function validateBreedingEventCmd(
	cmd: RecordBreedingEventCmd
): Result<true, DomainError> {
	if (!cmd.requesterUserId) {
		return err({
			type: "ValidationError",
			message: "Requester user ID is required",
			field: "requesterUserId"
		});
	}

	if (!cmd.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (!cmd.event || !cmd.event.type) {
		return err({
			type: "ValidationError",
			message: "Event type is required",
			field: "event.type"
		});
	}

	// Validate event-specific fields
	switch (cmd.event.type) {
		case "ConfirmPregnancy":
			if (!cmd.event.expectedCalvingDate) {
				return err({
					type: "ValidationError",
					message:
						"Expected calving date is required for pregnancy confirmation",
					field: "event.expectedCalvingDate"
				});
			}
			break;
		case "Calve":
			if (cmd.event.isDifficultBirth === undefined) {
				return err({
					type: "ValidationError",
					message: "Difficult birth flag is required for calving event",
					field: "event.isDifficultBirth"
				});
			}
			break;
	}

	return ok(true);
}

// Pure function to validate initialize breeding command
export function validateInitializeBreedingCmd(
	cmd: InitializeBreedingCmd
): Result<true, DomainError> {
	if (!cmd.requesterUserId) {
		return err({
			type: "ValidationError",
			message: "Requester user ID is required",
			field: "requesterUserId"
		});
	}

	if (!cmd.cattleId) {
		return err({
			type: "ValidationError",
			message: "Cattle ID is required",
			field: "cattleId"
		});
	}

	if (cmd.initialParity < 0) {
		return err({
			type: "ValidationError",
			message: "Initial parity cannot be negative",
			field: "initialParity"
		});
	}

	return ok(true);
}

// Helper function to create breeding event from command
function createBreedingEventFromCommand(
	eventCmd: RecordBreedingEventCmd["event"],
	timestamp: Date
): BreedingEvent {
	const baseEvent = {
		timestamp,
		memo: eventCmd.memo
	};

	switch (eventCmd.type) {
		case "Inseminate":
			return {
				type: "Inseminate" as const,
				...baseEvent
			};
		case "ConfirmPregnancy":
			if (!eventCmd.expectedCalvingDate) {
				throw new Error(
					"Expected calving date is required for pregnancy confirmation"
				);
			}
			return {
				type: "ConfirmPregnancy" as const,
				expectedCalvingDate: eventCmd.expectedCalvingDate,
				scheduledPregnancyCheckDate:
					eventCmd.scheduledPregnancyCheckDate || null,
				...baseEvent
			};
		case "Calve":
			if (eventCmd.isDifficultBirth === undefined) {
				throw new Error("Difficult birth flag is required for calving event");
			}
			return {
				type: "Calve" as const,
				isDifficultBirth: eventCmd.isDifficultBirth,
				...baseEvent
			};
		case "StartNewCycle":
			return {
				type: "StartNewCycle" as const,
				...baseEvent
			};
		default:
			throw new Error(`Unknown event type: ${eventCmd.type}`);
	}
}

// Pure function to determine next recommended action
export function getNextRecommendedAction(
	status: BreedingStatus,
	currentDate: Date
): {
	action: string;
	priority: "High" | "Medium" | "Low";
	dueDate: Date | null;
	description: string;
} {
	switch (status.type) {
		case "NotBreeding": {
			const daysSinceCalving = status.daysAfterCalving || 0;
			if (daysSinceCalving > 60) {
				return {
					action: "人工授精",
					priority: "Medium",
					dueDate: null,
					description: "繁殖適期に入っています。人工授精を検討してください。"
				};
			}
			return {
				action: "経過観察",
				priority: "Low",
				dueDate: null,
				description:
					"分娩後の回復期間中です。もう少し待ってから繁殖を開始してください。"
			};
		}

		case "Inseminated": {
			if (status.daysAfterInsemination > 21) {
				return {
					action: "妊娠鑑定",
					priority: "High",
					dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week
					description: "妊娠鑑定の時期です。獣医師による検査を受けてください。"
				};
			}
			return {
				action: "経過観察",
				priority: "Low",
				dueDate: null,
				description: "人工授精後の経過観察期間中です。"
			};
		}

		case "Pregnant": {
			const daysUntilCalving = Math.floor(
				(status.expectedCalvingDate.getTime() - currentDate.getTime()) /
					(1000 * 60 * 60 * 24)
			);
			if (daysUntilCalving <= 30) {
				return {
					action: "分娩準備",
					priority: "High",
					dueDate: status.expectedCalvingDate,
					description:
						"分娩予定日が近づいています。分娩房の準備と観察を強化してください。"
				};
			}
			return {
				action: "妊娠管理",
				priority: "Low",
				dueDate: status.scheduledPregnancyCheckDate,
				description:
					"妊娠経過は順調です。定期的な健康チェックを継続してください。"
			};
		}

		case "PostCalving": {
			if (status.daysAfterCalving > 45) {
				return {
					action: "繁殖再開準備",
					priority: "Medium",
					dueDate: null,
					description: "次の繁殖サイクルの準備期間に入りました。"
				};
			}
			return {
				action: "産後ケア",
				priority: "Medium",
				dueDate: null,
				description:
					"産後の回復期間中です。母体の健康状態を注意深く観察してください。"
			};
		}

		default:
			return {
				action: "状態確認",
				priority: "Medium",
				dueDate: null,
				description: "繁殖状態を確認し、適切な処置を検討してください。"
			};
	}
}

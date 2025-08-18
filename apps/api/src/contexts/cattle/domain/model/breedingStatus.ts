import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	BreedingMemo,
	DaysAfterCalving,
	DaysAfterInsemination,
	DaysOpen,
	InseminationCount,
	Parity,
	PregnancyDays
} from "./types";

// Breeding Status State Machine
export type BreedingStatus =
	| {
			readonly type: "NotBreeding";
			readonly parity: Parity;
			readonly daysAfterCalving: DaysAfterCalving | null;
			readonly memo: BreedingMemo | null;
	  }
	| {
			readonly type: "Inseminated";
			readonly parity: Parity;
			readonly daysAfterInsemination: DaysAfterInsemination;
			readonly inseminationCount: InseminationCount;
			readonly daysOpen: DaysOpen | null;
			readonly memo: BreedingMemo | null;
	  }
	| {
			readonly type: "Pregnant";
			readonly parity: Parity;
			readonly pregnancyDays: PregnancyDays;
			readonly expectedCalvingDate: Date;
			readonly scheduledPregnancyCheckDate: Date | null;
			readonly memo: BreedingMemo | null;
	  }
	| {
			readonly type: "PostCalving";
			readonly parity: Parity;
			readonly daysAfterCalving: DaysAfterCalving;
			readonly isDifficultBirth: boolean;
			readonly memo: BreedingMemo | null;
	  };

// Events that can trigger state transitions
export type BreedingEvent =
	| {
			readonly type: "Inseminate";
			readonly timestamp: Date;
			readonly memo?: string | null;
	  }
	| {
			readonly type: "ConfirmPregnancy";
			readonly timestamp: Date;
			readonly expectedCalvingDate: Date;
			readonly scheduledPregnancyCheckDate?: Date | null;
			readonly memo?: string | null;
	  }
	| {
			readonly type: "Calve";
			readonly timestamp: Date;
			readonly isDifficultBirth: boolean;
			readonly memo?: string | null;
	  }
	| {
			readonly type: "StartNewCycle";
			readonly timestamp: Date;
			readonly memo?: string | null;
	  };

// Factory function for creating initial breeding status
export function createInitialBreedingStatus(props: {
	parity: number;
	memo?: string | null;
}): Result<BreedingStatus, DomainError> {
	if (props.parity < 0) {
		return err({
			type: "ValidationError",
			message: "Parity cannot be negative",
			field: "parity"
		});
	}

	return ok({
		type: "NotBreeding",
		parity: props.parity as Parity,
		daysAfterCalving: null,
		memo: props.memo as BreedingMemo | null
	});
}

// Pure function for state transitions
export function transitionBreedingStatus(
	current: BreedingStatus,
	event: BreedingEvent,
	currentDate: Date
): Result<BreedingStatus, DomainError> {
	switch (current.type) {
		case "NotBreeding":
			if (event.type === "Inseminate") {
				return ok({
					type: "Inseminated",
					parity: current.parity,
					daysAfterInsemination: 0 as DaysAfterInsemination,
					inseminationCount: 1 as InseminationCount,
					daysOpen: current.daysAfterCalving
						? ((calculateDaysDifference(event.timestamp, currentDate) +
								current.daysAfterCalving) as DaysOpen)
						: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "Inseminated":
			if (event.type === "Inseminate") {
				return ok({
					...current,
					daysAfterInsemination: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysAfterInsemination,
					inseminationCount: (current.inseminationCount +
						1) as InseminationCount,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "ConfirmPregnancy") {
				return ok({
					type: "Pregnant",
					parity: current.parity,
					pregnancyDays: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as PregnancyDays,
					expectedCalvingDate: event.expectedCalvingDate,
					scheduledPregnancyCheckDate:
						event.scheduledPregnancyCheckDate || null,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "StartNewCycle") {
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "Pregnant":
			if (event.type === "Calve") {
				return ok({
					type: "PostCalving",
					parity: (current.parity + 1) as Parity,
					daysAfterCalving: 0 as DaysAfterCalving,
					isDifficultBirth: event.isDifficultBirth,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "StartNewCycle") {
				// Pregnancy failed, back to not breeding
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "PostCalving":
			if (event.type === "StartNewCycle") {
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysAfterCalving,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "Inseminate") {
				return ok({
					type: "Inseminated",
					parity: current.parity,
					daysAfterInsemination: 0 as DaysAfterInsemination,
					inseminationCount: 1 as InseminationCount,
					daysOpen: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysOpen,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;
	}

	return err({
		type: "ValidationError",
		message: `Invalid transition from ${current.type} with event ${event.type}`
	});
}

// Helper function to calculate days difference
function calculateDaysDifference(from: Date, to: Date): number {
	const diffMs = to.getTime() - from.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Pure function to get current breeding phase description
export function getBreedingPhaseDescription(status: BreedingStatus): string {
	switch (status.type) {
		case "NotBreeding":
			return status.daysAfterCalving
				? `休息中 (分娩後${status.daysAfterCalving}日)`
				: "繁殖待機中";
		case "Inseminated":
			return `人工授精済み (${status.inseminationCount}回目, ${status.daysAfterInsemination}日経過)`;
		case "Pregnant":
			return `妊娠中 (${status.pregnancyDays}日目)`;
		case "PostCalving":
			return `分娩後 (${status.daysAfterCalving}日経過, ${status.isDifficultBirth ? "難産" : "安産"})`;
	}
}

// Pure function to check if breeding status needs attention
export function needsBreedingAttention(
	status: BreedingStatus,
	currentDate: Date
): boolean {
	switch (status.type) {
		case "Inseminated":
			return status.daysAfterInsemination > 21; // Pregnancy check needed
		case "Pregnant":
			if (status.scheduledPregnancyCheckDate) {
				return currentDate >= status.scheduledPregnancyCheckDate;
			}
			return status.pregnancyDays > 280; // Near calving date
		case "PostCalving":
			return status.daysAfterCalving > 60; // Ready for next breeding
		default:
			return false;
	}
}

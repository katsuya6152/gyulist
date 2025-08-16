import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type { BreedingEvent, BreedingStatus } from "./breedingStatus";
import { transitionBreedingStatus } from "./breedingStatus";
import type { BreedingSummary } from "./breedingSummary";
import {
	createInitialBreedingSummary,
	updateBreedingSummary
} from "./breedingSummary";

// Breeding Aggregate Root
export type BreedingAggregate = {
	readonly cattleId: CattleId;
	readonly currentStatus: BreedingStatus;
	readonly summary: BreedingSummary;
	readonly history: readonly BreedingEvent[];
	readonly version: number; // For optimistic concurrency control
	readonly lastUpdated: Date;
};

// Factory function for creating new breeding aggregate
export function createBreedingAggregate(
	cattleId: CattleId,
	initialStatus: BreedingStatus
): BreedingAggregate {
	return {
		cattleId,
		currentStatus: initialStatus,
		summary: createInitialBreedingSummary(),
		history: [],
		version: 1,
		lastUpdated: new Date()
	};
}

// Factory function for reconstructing breeding aggregate from persistence
export function reconstructBreedingAggregate(props: {
	cattleId: CattleId;
	currentStatus: BreedingStatus;
	summary: BreedingSummary;
	history: BreedingEvent[];
	version: number;
	lastUpdated: Date;
}): BreedingAggregate {
	return {
		cattleId: props.cattleId,
		currentStatus: props.currentStatus,
		summary: props.summary,
		history: [...props.history], // Create new array to maintain immutability
		version: props.version,
		lastUpdated: props.lastUpdated
	};
}

// Pure function to apply breeding event to aggregate
export function applyBreedingEvent(
	aggregate: BreedingAggregate,
	event: BreedingEvent,
	currentDate: Date
): Result<BreedingAggregate, DomainError> {
	// Validate event timestamp
	if (event.timestamp > currentDate) {
		return err({
			type: "ValidationError",
			message: "Event timestamp cannot be in the future"
		});
	}

	// Validate event order (events should be chronological)
	const lastEvent = aggregate.history[aggregate.history.length - 1];
	if (lastEvent && event.timestamp < lastEvent.timestamp) {
		return err({
			type: "ValidationError",
			message: "Events must be in chronological order"
		});
	}

	// Transition breeding status
	const statusTransition = transitionBreedingStatus(
		aggregate.currentStatus,
		event,
		currentDate
	);

	if (!statusTransition.ok) {
		return statusTransition;
	}

	// Update history
	const newHistory = [...aggregate.history, event];

	// Update summary
	const newSummary = updateBreedingSummary(
		aggregate.summary,
		event,
		newHistory
	);

	return ok({
		cattleId: aggregate.cattleId,
		currentStatus: statusTransition.value,
		summary: newSummary,
		history: newHistory,
		version: aggregate.version + 1,
		lastUpdated: currentDate
	});
}

// Pure function to get breeding events within date range
export function getBreedingEventsInRange(
	aggregate: BreedingAggregate,
	startDate: Date,
	endDate: Date
): BreedingEvent[] {
	return aggregate.history.filter(
		(event) => event.timestamp >= startDate && event.timestamp <= endDate
	);
}

// Pure function to get last event of specific type
export function getLastEventOfType(
	aggregate: BreedingAggregate,
	eventType: BreedingEvent["type"]
): BreedingEvent | null {
	const eventsOfType = aggregate.history.filter(
		(event) => event.type === eventType
	);
	return eventsOfType.length > 0 ? eventsOfType[eventsOfType.length - 1] : null;
}

// Pure function to check if breeding aggregate is in valid state
export function isBreedingAggregateValid(
	aggregate: BreedingAggregate
): Result<true, DomainError> {
	// Check if status is consistent with recent events
	const lastEvent = aggregate.history[aggregate.history.length - 1];

	if (lastEvent) {
		// Validate status consistency based on last event
		switch (lastEvent.type) {
			case "Inseminate":
				if (aggregate.currentStatus.type !== "Inseminated") {
					return err({
						type: "ValidationError",
						message: "Status should be 'Inseminated' after insemination event"
					});
				}
				break;
			case "ConfirmPregnancy":
				if (aggregate.currentStatus.type !== "Pregnant") {
					return err({
						type: "ValidationError",
						message: "Status should be 'Pregnant' after pregnancy confirmation"
					});
				}
				break;
			case "Calve":
				if (aggregate.currentStatus.type !== "PostCalving") {
					return err({
						type: "ValidationError",
						message: "Status should be 'PostCalving' after calving event"
					});
				}
				break;
		}
	}

	// Check version consistency
	if (aggregate.version <= 0) {
		return err({
			type: "ValidationError",
			message: "Aggregate version must be positive"
		});
	}

	return ok(true);
}

// Pure function to get breeding cycle summary
export function getBreedingCycleSummary(aggregate: BreedingAggregate): {
	currentCycleStartDate: Date | null;
	daysInCurrentCycle: number | null;
	cyclePhase: string;
	nextExpectedEvent: string | null;
	nextExpectedDate: Date | null;
} {
	const status = aggregate.currentStatus;
	const lastCalving = getLastEventOfType(aggregate, "Calve");
	const lastInsemination = getLastEventOfType(aggregate, "Inseminate");
	const currentDate = new Date();

	let currentCycleStartDate: Date | null = null;
	let daysInCurrentCycle: number | null = null;
	let nextExpectedEvent: string | null = null;
	let nextExpectedDate: Date | null = null;

	switch (status.type) {
		case "NotBreeding":
			currentCycleStartDate = lastCalving?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				if (daysInCurrentCycle > 60) {
					nextExpectedEvent = "人工授精";
					// Estimate next breeding window
					const nextBreedingDate = new Date(currentCycleStartDate);
					nextBreedingDate.setDate(nextBreedingDate.getDate() + 80);
					nextExpectedDate = nextBreedingDate;
				}
			}
			break;

		case "Inseminated":
			currentCycleStartDate = lastInsemination?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				nextExpectedEvent = "妊娠鑑定";
				nextExpectedDate = new Date(currentCycleStartDate);
				nextExpectedDate.setDate(nextExpectedDate.getDate() + 21);
			}
			break;

		case "Pregnant": {
			const lastPregnancyConfirmation = getLastEventOfType(
				aggregate,
				"ConfirmPregnancy"
			);
			currentCycleStartDate =
				lastPregnancyConfirmation?.timestamp ||
				lastInsemination?.timestamp ||
				null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				nextExpectedEvent = "分娩";
				nextExpectedDate = status.expectedCalvingDate;
			}
			break;
		}

		case "PostCalving": {
			const lastCalving = getLastEventOfType(aggregate, "Calve");
			currentCycleStartDate = lastCalving?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				if (daysInCurrentCycle > 45) {
					nextExpectedEvent = "次回繁殖開始";
					nextExpectedDate = new Date(currentCycleStartDate);
					nextExpectedDate.setDate(nextExpectedDate.getDate() + 60);
				}
			}
			break;
		}
	}

	return {
		currentCycleStartDate,
		daysInCurrentCycle,
		cyclePhase: status.type,
		nextExpectedEvent,
		nextExpectedDate
	};
}

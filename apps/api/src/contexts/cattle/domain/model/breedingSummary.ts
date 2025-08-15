import type { Brand } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type { BreedingEvent } from "./breedingStatus";

// Brand types for breeding summary metrics
export type TotalInseminationCount = Brand<number, "TotalInseminationCount">;
export type AverageDaysOpen = Brand<number, "AverageDaysOpen">;
export type AveragePregnancyPeriod = Brand<number, "AveragePregnancyPeriod">;
export type AverageCalvingInterval = Brand<number, "AverageCalvingInterval">;
export type DifficultBirthCount = Brand<number, "DifficultBirthCount">;
export type PregnancyHeadCount = Brand<number, "PregnancyHeadCount">;
export type PregnancySuccessRate = Brand<number, "PregnancySuccessRate">;

// Breeding Summary Value Object (immutable statistics)
export type BreedingSummary = {
	readonly totalInseminationCount: TotalInseminationCount;
	readonly averageDaysOpen: AverageDaysOpen | null;
	readonly averagePregnancyPeriod: AveragePregnancyPeriod | null;
	readonly averageCalvingInterval: AverageCalvingInterval | null;
	readonly difficultBirthCount: DifficultBirthCount;
	readonly pregnancyHeadCount: PregnancyHeadCount;
	readonly pregnancySuccessRate: PregnancySuccessRate | null;
	readonly lastUpdated: Date;
};

// Factory function for creating initial breeding summary
export function createInitialBreedingSummary(): BreedingSummary {
	return {
		totalInseminationCount: 0 as TotalInseminationCount,
		averageDaysOpen: null,
		averagePregnancyPeriod: null,
		averageCalvingInterval: null,
		difficultBirthCount: 0 as DifficultBirthCount,
		pregnancyHeadCount: 0 as PregnancyHeadCount,
		pregnancySuccessRate: null,
		lastUpdated: new Date()
	};
}

// Factory function for creating breeding summary with validation
export function createBreedingSummary(props: {
	totalInseminationCount: number;
	averageDaysOpen?: number | null;
	averagePregnancyPeriod?: number | null;
	averageCalvingInterval?: number | null;
	difficultBirthCount: number;
	pregnancyHeadCount: number;
	pregnancySuccessRate?: number | null;
	lastUpdated?: Date;
}): Result<BreedingSummary, DomainError> {
	// Validation: counts must be non-negative
	if (props.totalInseminationCount < 0) {
		return err({
			type: "ValidationError",
			message: "Total insemination count cannot be negative",
			field: "totalInseminationCount"
		});
	}

	if (props.difficultBirthCount < 0) {
		return err({
			type: "ValidationError",
			message: "Difficult birth count cannot be negative",
			field: "difficultBirthCount"
		});
	}

	if (props.pregnancyHeadCount < 0) {
		return err({
			type: "ValidationError",
			message: "Pregnancy head count cannot be negative",
			field: "pregnancyHeadCount"
		});
	}

	// Validation: success rate must be between 0 and 100
	if (
		props.pregnancySuccessRate !== null &&
		props.pregnancySuccessRate !== undefined
	) {
		if (props.pregnancySuccessRate < 0 || props.pregnancySuccessRate > 100) {
			return err({
				type: "ValidationError",
				message: "Pregnancy success rate must be between 0 and 100",
				field: "pregnancySuccessRate"
			});
		}
	}

	// Validation: averages must be positive if provided
	const validatePositive = (
		value: number | null | undefined,
		fieldName: string
	): DomainError | null => {
		if (value !== null && value !== undefined && value <= 0) {
			return {
				type: "ValidationError",
				message: `${fieldName} must be positive`,
				field: fieldName
			};
		}
		return null;
	};

	const avgDaysOpenError = validatePositive(
		props.averageDaysOpen,
		"averageDaysOpen"
	);
	if (avgDaysOpenError) return err(avgDaysOpenError);

	const avgPregnancyError = validatePositive(
		props.averagePregnancyPeriod,
		"averagePregnancyPeriod"
	);
	if (avgPregnancyError) return err(avgPregnancyError);

	const avgCalvingError = validatePositive(
		props.averageCalvingInterval,
		"averageCalvingInterval"
	);
	if (avgCalvingError) return err(avgCalvingError);

	return ok({
		totalInseminationCount:
			props.totalInseminationCount as TotalInseminationCount,
		averageDaysOpen: props.averageDaysOpen as AverageDaysOpen | null,
		averagePregnancyPeriod:
			props.averagePregnancyPeriod as AveragePregnancyPeriod | null,
		averageCalvingInterval:
			props.averageCalvingInterval as AverageCalvingInterval | null,
		difficultBirthCount: props.difficultBirthCount as DifficultBirthCount,
		pregnancyHeadCount: props.pregnancyHeadCount as PregnancyHeadCount,
		pregnancySuccessRate:
			props.pregnancySuccessRate as PregnancySuccessRate | null,
		lastUpdated: props.lastUpdated || new Date()
	});
}

// Pure function to update breeding summary with new event
export function updateBreedingSummary(
	summary: BreedingSummary,
	event: BreedingEvent,
	breedingHistory: BreedingEvent[]
): BreedingSummary {
	const newSummary = { ...summary };

	switch (event.type) {
		case "Inseminate":
			newSummary.totalInseminationCount = (summary.totalInseminationCount +
				1) as TotalInseminationCount;
			break;

		case "ConfirmPregnancy":
			newSummary.pregnancyHeadCount = (summary.pregnancyHeadCount +
				1) as PregnancyHeadCount;
			break;

		case "Calve":
			if (event.isDifficultBirth) {
				newSummary.difficultBirthCount = (summary.difficultBirthCount +
					1) as DifficultBirthCount;
			}
			break;
	}

	// Recalculate averages based on full history
	const metrics = calculateBreedingMetrics(breedingHistory);

	return {
		...newSummary,
		averageDaysOpen: metrics.averageDaysOpen as AverageDaysOpen | null,
		averagePregnancyPeriod:
			metrics.averagePregnancyPeriod as AveragePregnancyPeriod | null,
		averageCalvingInterval:
			metrics.averageCalvingInterval as AverageCalvingInterval | null,
		pregnancySuccessRate:
			metrics.pregnancySuccessRate as PregnancySuccessRate | null,
		lastUpdated: new Date()
	};
}

// Pure function to calculate breeding metrics from history
function calculateBreedingMetrics(history: BreedingEvent[]): {
	averageDaysOpen: number | null;
	averagePregnancyPeriod: number | null;
	averageCalvingInterval: number | null;
	pregnancySuccessRate: number | null;
} {
	if (history.length === 0) {
		return {
			averageDaysOpen: null,
			averagePregnancyPeriod: null,
			averageCalvingInterval: null,
			pregnancySuccessRate: null
		};
	}

	const inseminationEvents = history.filter((e) => e.type === "Inseminate");
	const pregnancyEvents = history.filter((e) => e.type === "ConfirmPregnancy");
	const calvingEvents = history.filter((e) => e.type === "Calve");

	// Calculate pregnancy success rate
	const pregnancySuccessRate =
		inseminationEvents.length > 0
			? Math.round((pregnancyEvents.length / inseminationEvents.length) * 100)
			: null;

	// Calculate average pregnancy period (from first insemination to calving)
	let totalPregnancyDays = 0;
	let pregnancyPeriodCount = 0;

	for (const calvingEvent of calvingEvents) {
		// Find the first insemination that led to this calving
		const relatedInsemination = inseminationEvents
			.filter((i) => i.timestamp <= calvingEvent.timestamp)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		if (relatedInsemination) {
			const diffMs =
				calvingEvent.timestamp.getTime() -
				relatedInsemination.timestamp.getTime();
			totalPregnancyDays += Math.floor(diffMs / (1000 * 60 * 60 * 24));
			pregnancyPeriodCount++;
		}
	}

	const averagePregnancyPeriod =
		pregnancyPeriodCount > 0
			? Math.round(totalPregnancyDays / pregnancyPeriodCount)
			: null;

	// Calculate average calving interval
	let totalCalvingInterval = 0;
	let calvingIntervalCount = 0;

	for (let i = 1; i < calvingEvents.length; i++) {
		const diffMs =
			calvingEvents[i].timestamp.getTime() -
			calvingEvents[i - 1].timestamp.getTime();
		totalCalvingInterval += Math.floor(diffMs / (1000 * 60 * 60 * 24));
		calvingIntervalCount++;
	}

	const averageCalvingInterval =
		calvingIntervalCount > 0
			? Math.round(totalCalvingInterval / calvingIntervalCount)
			: null;

	// Average days open is complex to calculate without more context
	// For now, we'll return null and calculate it elsewhere if needed
	const averageDaysOpen = null;

	return {
		averageDaysOpen,
		averagePregnancyPeriod,
		averageCalvingInterval,
		pregnancySuccessRate
	};
}

// Pure function to get breeding performance rating
export function getBreedingPerformanceRating(
	summary: BreedingSummary
): "Excellent" | "Good" | "Average" | "Poor" | "Unknown" {
	if (!summary.pregnancySuccessRate) return "Unknown";

	if (summary.pregnancySuccessRate >= 90) return "Excellent";
	if (summary.pregnancySuccessRate >= 75) return "Good";
	if (summary.pregnancySuccessRate >= 60) return "Average";
	return "Poor";
}

// Pure function to check if breeding summary needs attention
export function needsBreedingSummaryUpdate(
	summary: BreedingSummary,
	currentDate: Date
): boolean {
	const daysSinceUpdate = Math.floor(
		(currentDate.getTime() - summary.lastUpdated.getTime()) /
			(1000 * 60 * 60 * 24)
	);
	return daysSinceUpdate > 30; // Update if older than 30 days
}

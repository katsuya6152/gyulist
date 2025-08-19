import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type { BreedingEvent } from "./breedingStatus";
import type {
	AverageCalvingInterval,
	AverageDaysOpen,
	AveragePregnancyPeriod,
	DifficultBirthCount,
	PregnancyHeadCount,
	PregnancySuccessRate,
	TotalInseminationCount
} from "./types";

/**
 * 繁殖統計の値オブジェクト（不変）。
 */
export type BreedingSummary = {
	/** 総授精回数 */ readonly totalInseminationCount: TotalInseminationCount;
	/** 平均空胎日数 */ readonly averageDaysOpen: AverageDaysOpen | null;
	/** 平均妊娠期間 */ readonly averagePregnancyPeriod: AveragePregnancyPeriod | null;
	/** 平均分娩間隔 */ readonly averageCalvingInterval: AverageCalvingInterval | null;
	/** 難産回数 */ readonly difficultBirthCount: DifficultBirthCount;
	/** 妊娠頭数 */ readonly pregnancyHeadCount: PregnancyHeadCount;
	/** 妊娠成功率（%） */ readonly pregnancySuccessRate: PregnancySuccessRate | null;
	/** 最終更新日時 */ readonly lastUpdated: Date;
};

/**
 * 初期繁殖サマリを作成します。
 */
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

/**
 * 繁殖サマリのファクトリ（バリデーション付き）。
 */
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

/**
 * 新しいイベントを適用して繁殖サマリを更新します。
 */
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

/**
 * 履歴から集計指標を計算します。
 */
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

/**
 * 繁殖パフォーマンスのレーティングを返します。
 */
export function getBreedingPerformanceRating(
	summary: BreedingSummary
): "Excellent" | "Good" | "Average" | "Poor" | "Unknown" {
	if (!summary.pregnancySuccessRate) return "Unknown";

	if (summary.pregnancySuccessRate >= 90) return "Excellent";
	if (summary.pregnancySuccessRate >= 75) return "Good";
	if (summary.pregnancySuccessRate >= 60) return "Average";
	return "Poor";
}

/**
 * サマリの更新（再計算）が必要かを判定します。
 */
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

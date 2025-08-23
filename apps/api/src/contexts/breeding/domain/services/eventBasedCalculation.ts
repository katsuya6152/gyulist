import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../cattle/domain/errors";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";
import type { BreedingSummary } from "../../../cattle/domain/model/breedingSummary";
import type {
	AverageCalvingInterval,
	AverageDaysOpen,
	AveragePregnancyPeriod,
	DifficultBirthCount,
	PregnancyHeadCount,
	PregnancySuccessRate,
	TotalInseminationCount
} from "../../../cattle/domain/model/types";
import { createBreedingCalculationService } from "./breedingCalculation";

/**
 * イベントベース計算サービスの依存関係
 */
export interface EventBasedCalculationDeps {
	/** 現在時刻を取得する関数 */
	clock: {
		now: () => Date;
	};
}

/**
 * イベントベース計算の入力パラメータ
 */
export interface EventBasedCalculationInput {
	/** 牛ID */
	cattleId: CattleId;
	/** 繁殖イベント履歴 */
	events: BreedingEvent[];
	/** 現在時刻（オプション、指定しない場合はclock.now()を使用） */
	currentDate?: Date;
}

/**
 * イベントベース計算の結果
 */
export interface EventBasedCalculationResult {
	/** 繁殖状態の計算結果 */
	breedingStatus: {
		parity: number;
		expectedCalvingDate: Date | null;
		scheduledPregnancyCheckDate: Date | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number;
	};
	/** 繁殖統計の計算結果 */
	breedingSummary: {
		totalInseminationCount: number;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number;
		pregnancyHeadCount: number;
		pregnancySuccessRate: number | null;
	};
	/** 計算基準日時 */
	calculatedAt: Date;
}

/**
 * イベントベース計算サービス
 *
 * イベント履歴から繁殖状態と統計を計算します。
 */
export class EventBasedCalculationService {
	private breedingCalculationService: ReturnType<
		typeof createBreedingCalculationService
	>;

	constructor(private deps: EventBasedCalculationDeps) {
		this.breedingCalculationService = createBreedingCalculationService(deps);
	}

	/**
	 * イベントから繁殖状態と統計を計算します
	 */
	calculateFromEvents(
		input: EventBasedCalculationInput
	): Result<EventBasedCalculationResult, DomainError> {
		try {
			const currentDate = input.currentDate || this.deps.clock.now();

			// 繁殖状態を計算
			const breedingStatusResult =
				this.breedingCalculationService.calculateBreedingStatus({
					cattleId: input.cattleId,
					events: input.events,
					currentDate
				});

			if (!breedingStatusResult.ok) {
				return breedingStatusResult;
			}

			// 繁殖統計を計算
			const breedingSummaryResult = this.calculateBreedingSummary(input.events);

			if (!breedingSummaryResult.ok) {
				return breedingSummaryResult;
			}

			return ok({
				breedingStatus: {
					parity: breedingStatusResult.value.parity as unknown as number,
					expectedCalvingDate: breedingStatusResult.value.expectedCalvingDate,
					scheduledPregnancyCheckDate:
						breedingStatusResult.value.scheduledPregnancyCheckDate,
					daysAfterCalving: breedingStatusResult.value
						.daysAfterCalving as unknown as number | null,
					daysOpen: breedingStatusResult.value.daysOpen as unknown as
						| number
						| null,
					pregnancyDays: breedingStatusResult.value.pregnancyDays as unknown as
						| number
						| null,
					daysAfterInsemination: breedingStatusResult.value
						.daysAfterInsemination as unknown as number | null,
					inseminationCount: breedingStatusResult.value
						.inseminationCount as unknown as number
				},
				breedingSummary: {
					totalInseminationCount: breedingSummaryResult.value
						.totalInseminationCount as unknown as number,
					averageDaysOpen: breedingSummaryResult.value
						.averageDaysOpen as unknown as number | null,
					averagePregnancyPeriod: breedingSummaryResult.value
						.averagePregnancyPeriod as unknown as number | null,
					averageCalvingInterval: breedingSummaryResult.value
						.averageCalvingInterval as unknown as number | null,
					difficultBirthCount: breedingSummaryResult.value
						.difficultBirthCount as unknown as number,
					pregnancyHeadCount: breedingSummaryResult.value
						.pregnancyHeadCount as unknown as number,
					pregnancySuccessRate: breedingSummaryResult.value
						.pregnancySuccessRate as unknown as number | null
				},
				calculatedAt: currentDate
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to calculate from events",
				cause: error
			});
		}
	}

	/**
	 * 繁殖統計を計算します
	 */
	private calculateBreedingSummary(
		events: BreedingEvent[]
	): Result<BreedingSummary, DomainError> {
		try {
			const sortedEvents = this.sortEventsChronologically(events);

			// イベントタイプ別に分類
			const inseminationEvents = sortedEvents.filter(
				(event) => event.type === "Inseminate"
			);
			const pregnancyEvents = sortedEvents.filter(
				(event) => event.type === "ConfirmPregnancy"
			);
			const calvingEvents = sortedEvents.filter(
				(event) => event.type === "Calve"
			);

			// 基本統計を計算
			const totalInseminationCount =
				inseminationEvents.length as TotalInseminationCount;
			const pregnancyHeadCount = pregnancyEvents.length as PregnancyHeadCount;

			// 難産回数を計算
			const difficultBirthCount = calvingEvents.filter(
				(event) => event.isDifficultBirth
			).length as DifficultBirthCount;

			// 受胎率を計算
			const pregnancySuccessRate =
				totalInseminationCount > 0
					? (Math.round(
							(pregnancyHeadCount / totalInseminationCount) * 100
						) as PregnancySuccessRate)
					: null;

			// 平均妊娠期間を計算
			const averagePregnancyPeriod = this.calculateAveragePregnancyPeriod(
				inseminationEvents,
				calvingEvents
			);

			// 平均分娩間隔を計算
			const averageCalvingInterval =
				this.calculateAverageCalvingInterval(calvingEvents);

			// 平均空胎日数を計算
			const averageDaysOpen = this.calculateAverageDaysOpen(
				inseminationEvents,
				calvingEvents
			);

			return ok({
				totalInseminationCount,
				averageDaysOpen,
				averagePregnancyPeriod,
				averageCalvingInterval,
				difficultBirthCount,
				pregnancyHeadCount,
				pregnancySuccessRate,
				lastUpdated: this.deps.clock.now()
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to calculate breeding summary",
				cause: error
			});
		}
	}

	/**
	 * 平均妊娠期間を計算します
	 */
	private calculateAveragePregnancyPeriod(
		inseminationEvents: BreedingEvent[],
		calvingEvents: BreedingEvent[]
	): AveragePregnancyPeriod | null {
		if (calvingEvents.length === 0) {
			return null;
		}

		let totalPregnancyDays = 0;
		let pregnancyPeriodCount = 0;

		for (const calvingEvent of calvingEvents) {
			// この分娩に対応する受精イベントを探す
			const correspondingInsemination = inseminationEvents
				.filter((event) => event.timestamp <= calvingEvent.timestamp)
				.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

			if (correspondingInsemination) {
				const pregnancyDays = this.calculateDaysDifference(
					correspondingInsemination.timestamp,
					calvingEvent.timestamp
				);
				totalPregnancyDays += pregnancyDays;
				pregnancyPeriodCount++;
			}
		}

		return pregnancyPeriodCount > 0
			? (Math.round(
					totalPregnancyDays / pregnancyPeriodCount
				) as AveragePregnancyPeriod)
			: null;
	}

	/**
	 * 平均分娩間隔を計算します
	 */
	private calculateAverageCalvingInterval(
		calvingEvents: BreedingEvent[]
	): AverageCalvingInterval | null {
		if (calvingEvents.length < 2) {
			return null;
		}

		let totalInterval = 0;
		let intervalCount = 0;

		for (let i = 1; i < calvingEvents.length; i++) {
			const interval = this.calculateDaysDifference(
				calvingEvents[i - 1].timestamp,
				calvingEvents[i].timestamp
			);
			totalInterval += interval;
			intervalCount++;
		}

		return intervalCount > 0
			? (Math.round(totalInterval / intervalCount) as AverageCalvingInterval)
			: null;
	}

	/**
	 * 平均空胎日数を計算します
	 */
	private calculateAverageDaysOpen(
		inseminationEvents: BreedingEvent[],
		calvingEvents: BreedingEvent[]
	): AverageDaysOpen | null {
		if (calvingEvents.length < 2) {
			return null;
		}

		let totalDaysOpen = 0;
		let daysOpenCount = 0;

		for (let i = 1; i < calvingEvents.length; i++) {
			const previousCalving = calvingEvents[i - 1];
			const currentCalving = calvingEvents[i];

			// 前回分娩後の最初の受精を探す
			const firstInseminationAfterCalving = inseminationEvents
				.filter(
					(event) =>
						event.timestamp > previousCalving.timestamp &&
						event.timestamp <= currentCalving.timestamp
				)
				.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];

			if (firstInseminationAfterCalving) {
				const daysOpen = this.calculateDaysDifference(
					previousCalving.timestamp,
					firstInseminationAfterCalving.timestamp
				);
				totalDaysOpen += daysOpen;
				daysOpenCount++;
			}
		}

		return daysOpenCount > 0
			? (Math.round(totalDaysOpen / daysOpenCount) as AverageDaysOpen)
			: null;
	}

	/**
	 * イベントを時系列順にソートします
	 */
	private sortEventsChronologically(events: BreedingEvent[]): BreedingEvent[] {
		return [...events].sort(
			(a, b) => a.timestamp.getTime() - b.timestamp.getTime()
		);
	}

	/**
	 * 2つの日付間の日数を計算します
	 */
	private calculateDaysDifference(from: Date, to: Date): number {
		const diffMs = to.getTime() - from.getTime();
		return Math.floor(diffMs / (1000 * 60 * 60 * 24));
	}
}

/**
 * イベントベース計算サービスのファクトリ関数
 */
export function createEventBasedCalculationService(
	deps: EventBasedCalculationDeps
): EventBasedCalculationService {
	return new EventBasedCalculationService(deps);
}

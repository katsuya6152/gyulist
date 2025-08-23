import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../cattle/domain/errors";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";
import type {
	DaysAfterCalving,
	DaysAfterInsemination,
	DaysOpen,
	InseminationCount,
	Parity,
	PregnancyDays
} from "../../../cattle/domain/model/types";

/**
 * 繁殖状態計算サービスの依存関係
 */
export interface BreedingCalculationDeps {
	/** 現在時刻を取得する関数 */
	clock: {
		now: () => Date;
	};
}

/**
 * 繁殖状態計算の入力パラメータ
 */
export interface BreedingCalculationInput {
	/** 牛ID */
	cattleId: CattleId;
	/** 繁殖イベント履歴 */
	events: BreedingEvent[];
	/** 現在時刻（オプション、指定しない場合はclock.now()を使用） */
	currentDate?: Date;
}

/**
 * 繁殖状態計算の結果
 */
export interface BreedingCalculationResult {
	/** 産次 */
	parity: Parity;
	/** 分娩予定日 */
	expectedCalvingDate: Date | null;
	/** 妊娠鑑定予定日 */
	scheduledPregnancyCheckDate: Date | null;
	/** 分娩後経過日数 */
	daysAfterCalving: DaysAfterCalving | null;
	/** 空胎日数 */
	daysOpen: DaysOpen | null;
	/** 妊娠日数 */
	pregnancyDays: PregnancyDays | null;
	/** 受精後経過日数 */
	daysAfterInsemination: DaysAfterInsemination | null;
	/** 種付回数（現在のサイクル内） */
	inseminationCount: InseminationCount;
	/** 計算基準日時 */
	calculatedAt: Date;
}

/**
 * 繁殖状態計算サービス
 *
 * イベント履歴から繁殖状態の各種指標を計算します。
 */
export class BreedingCalculationService {
	constructor(private deps: BreedingCalculationDeps) {}

	/**
	 * 繁殖状態を計算します
	 */
	calculateBreedingStatus(
		input: BreedingCalculationInput
	): Result<BreedingCalculationResult, DomainError> {
		try {
			const currentDate = input.currentDate || this.deps.clock.now();
			const events = this.sortEventsChronologically(input.events);

			// 産次を計算
			const parity = this.calculateParity(events);

			// 最新のイベントを取得
			const latestEvent = events[events.length - 1];
			if (!latestEvent) {
				// イベントがない場合は初期状態
				return ok({
					parity: 0 as Parity,
					expectedCalvingDate: null,
					scheduledPregnancyCheckDate: null,
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: 0 as InseminationCount,
					calculatedAt: currentDate
				});
			}

			// 最新イベントに基づいて状態を計算
			const result = this.calculateStatusFromLatestEvent(events, currentDate);
			return ok({
				...result,
				parity,
				calculatedAt: currentDate
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to calculate breeding status",
				cause: error
			});
		}
	}

	/**
	 * 産次を計算します
	 * 分娩（Calve）イベントの回数が産次となります
	 */
	private calculateParity(events: BreedingEvent[]): Parity {
		const calvingEvents = events.filter((event) => event.type === "Calve");
		return calvingEvents.length as Parity;
	}

	/**
	 * 最新イベントに基づいて状態を計算します
	 */
	private calculateStatusFromLatestEvent(
		events: BreedingEvent[],
		currentDate: Date
	): Omit<BreedingCalculationResult, "parity" | "calculatedAt"> {
		const latestEvent = events[events.length - 1];
		if (!latestEvent) {
			// イベントがない場合は初期状態
			return {
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: null,
				daysAfterCalving: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: 0 as InseminationCount
			};
		}

		switch (latestEvent.type) {
			case "Calve":
				return this.calculatePostCalvingStatus(events, currentDate);
			case "ConfirmPregnancy":
				return this.calculatePregnantStatus(events, currentDate);
			case "Inseminate":
				return this.calculateInseminatedStatus(events, currentDate);
			case "StartNewCycle":
				return this.calculateNotBreedingStatus(events, currentDate);
			default:
				// 未知のイベントタイプの場合は初期状態
				return {
					expectedCalvingDate: null,
					scheduledPregnancyCheckDate: null,
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: 0 as InseminationCount
				};
		}
	}

	/**
	 * 分娩後状態を計算します
	 */
	private calculatePostCalvingStatus(
		events: BreedingEvent[],
		currentDate: Date
	): Omit<BreedingCalculationResult, "parity" | "calculatedAt"> {
		const latestCalving = events
			.filter((event) => event.type === "Calve")
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		if (!latestCalving) {
			throw new Error("Calving event not found");
		}

		const daysAfterCalving = this.calculateDaysDifference(
			latestCalving.timestamp,
			currentDate
		) as DaysAfterCalving;

		return {
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving,
			daysOpen: daysAfterCalving as unknown as DaysOpen, // 空胎日数 = 分娩後日数
			pregnancyDays: null,
			daysAfterInsemination: null,
			inseminationCount: 0 as InseminationCount
		};
	}

	/**
	 * 妊娠中状態を計算します
	 */
	private calculatePregnantStatus(
		events: BreedingEvent[],
		currentDate: Date
	): Omit<BreedingCalculationResult, "parity" | "calculatedAt"> {
		const latestPregnancy = events
			.filter((event) => event.type === "ConfirmPregnancy")
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		if (!latestPregnancy) {
			throw new Error("Pregnancy confirmation event not found");
		}

		const pregnancyDays = this.calculateDaysDifference(
			latestPregnancy.timestamp,
			currentDate
		) as PregnancyDays;

		// イベントから予定日を取得（イベントに含まれている場合）
		const expectedCalvingDate =
			latestPregnancy.expectedCalvingDate ||
			(() => {
				const calculated = new Date(latestPregnancy.timestamp);
				calculated.setDate(calculated.getDate() + 240);
				return calculated;
			})();

		const scheduledPregnancyCheckDate =
			latestPregnancy.scheduledPregnancyCheckDate ||
			(() => {
				const calculated = new Date(latestPregnancy.timestamp);
				calculated.setDate(calculated.getDate() + 30);
				return calculated;
			})();

		return {
			expectedCalvingDate,
			scheduledPregnancyCheckDate,
			daysAfterCalving: null,
			daysOpen: null,
			pregnancyDays,
			daysAfterInsemination: null,
			inseminationCount: 0 as InseminationCount
		};
	}

	/**
	 * 受精済み状態を計算します
	 */
	private calculateInseminatedStatus(
		events: BreedingEvent[],
		currentDate: Date
	): Omit<BreedingCalculationResult, "parity" | "calculatedAt"> {
		// 最新の分娩を取得
		const latestCalving = events
			.filter((event) => event.type === "Calve")
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		// 最新の受精を取得
		const latestInsemination = events
			.filter((event) => event.type === "Inseminate")
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		if (!latestInsemination) {
			throw new Error("Insemination event not found");
		}

		const daysAfterInsemination = this.calculateDaysDifference(
			latestInsemination.timestamp,
			currentDate
		) as DaysAfterInsemination;

		// 現在のサイクル内の受精回数を計算
		const cycleStartDate = latestCalving
			? latestCalving.timestamp
			: new Date(0);
		const inseminationsInCurrentCycle = events.filter(
			(event) => event.type === "Inseminate" && event.timestamp > cycleStartDate
		);
		const inseminationCount =
			inseminationsInCurrentCycle.length as InseminationCount;

		// 空胎日数を計算（分娩から最初の受精までの日数）
		let daysOpen: DaysOpen | null = null;
		if (latestCalving) {
			// 分娩後の最初の受精を探す
			const firstInseminationAfterCalving = events
				.filter(
					(event) =>
						event.type === "Inseminate" &&
						event.timestamp > latestCalving.timestamp
				)
				.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];

			if (firstInseminationAfterCalving) {
				// 分娩から最初の受精までの日数
				daysOpen = this.calculateDaysDifference(
					latestCalving.timestamp,
					firstInseminationAfterCalving.timestamp
				) as DaysOpen;
			} else {
				// 受精がない場合は分娩から現在までの日数
				daysOpen = this.calculateDaysDifference(
					latestCalving.timestamp,
					currentDate
				) as DaysOpen;
			}
		}

		return {
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving: null,
			daysOpen,
			pregnancyDays: null,
			daysAfterInsemination,
			inseminationCount
		};
	}

	/**
	 * 未繁殖状態を計算します
	 */
	private calculateNotBreedingStatus(
		events: BreedingEvent[],
		currentDate: Date
	): Omit<BreedingCalculationResult, "parity" | "calculatedAt"> {
		// 最新の分娩を取得
		const latestCalving = events
			.filter((event) => event.type === "Calve")
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

		let daysAfterCalving: DaysAfterCalving | null = null;
		if (latestCalving) {
			daysAfterCalving = this.calculateDaysDifference(
				latestCalving.timestamp,
				currentDate
			) as DaysAfterCalving;
		}

		return {
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving,
			daysOpen: daysAfterCalving as unknown as DaysOpen, // 空胎日数 = 分娩後日数
			pregnancyDays: null,
			daysAfterInsemination: null,
			inseminationCount: 0 as InseminationCount
		};
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
 * 繁殖状態計算サービスのファクトリ関数
 */
export function createBreedingCalculationService(
	deps: BreedingCalculationDeps
): BreedingCalculationService {
	return new BreedingCalculationService(deps);
}

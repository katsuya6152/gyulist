import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import { createEventBasedCalculationService } from "../../../breeding/domain/services/eventBasedCalculation";
import type { DomainError } from "../../../cattle/domain/errors";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";

/**
 * イベントハンドラーの依存関係
 */
export interface EventHandlerDeps {
	/** 現在時刻を取得する関数 */
	clock: {
		now: () => Date;
	};
	/** 繁殖リポジトリ */
	breedingRepo: {
		findByCattleId: (cattleId: CattleId) => Promise<unknown | null>;
		getBreedingHistory: (cattleId: CattleId) => Promise<BreedingEvent[]>;
		save: (aggregate: unknown) => Promise<unknown>;
		updateBreedingStatusDays: (
			cattleId: CattleId,
			currentTime: Date
		) => Promise<void>;
	};
}

/**
 * イベントハンドラーの入力パラメータ
 */
export interface EventHandlerInput {
	/** 牛ID */
	cattleId: CattleId;
	/** イベントタイプ */
	eventType: "Calve" | "Inseminate" | "ConfirmPregnancy" | "StartNewCycle";
	/** イベントデータ */
	eventData: {
		timestamp: Date;
		memo?: string | null;
		isDifficultBirth?: boolean;
		expectedCalvingDate?: Date;
		scheduledPregnancyCheckDate?: Date;
	};
}

/**
 * イベントハンドラーの結果
 */
export interface EventHandlerResult {
	/** 更新された繁殖状態 */
	breedingStatus: {
		parity: number;
		expectedCalvingDate: string | null;
		scheduledPregnancyCheckDate: string | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number;
	};
	/** 更新された繁殖統計 */
	breedingSummary: {
		totalInseminationCount: number;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number;
		pregnancyHeadCount: number;
		pregnancySuccessRate: number | null;
	};
	/** 処理されたイベントタイプ */
	processedEventType: string;
	/** 処理日時 */
	processedAt: Date;
}

/**
 * イベントハンドラーサービス
 *
 * 繁殖イベントの発生時に自動的に計算を更新します。
 */
export class EventHandlerService {
	constructor(private deps: EventHandlerDeps) {}

	/**
	 * イベントを処理し、繁殖状態を更新します
	 */
	async handleBreedingEvent(
		input: EventHandlerInput
	): Promise<Result<EventHandlerResult, DomainError>> {
		try {
			const currentTime = this.deps.clock.now();

			// 既存のイベント履歴を取得
			const existingEvents = await this.deps.breedingRepo.getBreedingHistory(
				input.cattleId
			);

			// 新しいイベントを作成
			const newEvent: BreedingEvent = this.createBreedingEvent(input);

			// イベント履歴に追加
			const updatedEvents = [...existingEvents, newEvent];

			// イベントベース計算サービスを作成
			const calculationService = createEventBasedCalculationService({
				clock: this.deps.clock
			});

			// 計算を実行
			const calculationResult = calculationService.calculateFromEvents({
				cattleId: input.cattleId,
				events: updatedEvents,
				currentDate: currentTime
			});

			if (!calculationResult.ok) {
				return calculationResult;
			}

			// 繁殖集約を取得
			const breedingAggregate = await this.deps.breedingRepo.findByCattleId(
				input.cattleId
			);
			if (!breedingAggregate) {
				return err({
					type: "NotFound",
					entity: "BreedingAggregate",
					id: input.cattleId as unknown as number
				});
			}

			// 型安全な更新（unknown型のため）
			const updatedAggregate = breedingAggregate as {
				currentStatus: unknown;
				summary: unknown;
				history: unknown;
				lastUpdated: unknown;
			};

			// 繁殖状態を更新
			updatedAggregate.currentStatus = {
				parity: calculationResult.value.breedingStatus.parity,
				expectedCalvingDate:
					calculationResult.value.breedingStatus.expectedCalvingDate,
				scheduledPregnancyCheckDate:
					calculationResult.value.breedingStatus.scheduledPregnancyCheckDate,
				daysAfterCalving:
					calculationResult.value.breedingStatus.daysAfterCalving,
				daysOpen: calculationResult.value.breedingStatus.daysOpen,
				pregnancyDays: calculationResult.value.breedingStatus.pregnancyDays,
				daysAfterInsemination:
					calculationResult.value.breedingStatus.daysAfterInsemination,
				inseminationCount:
					calculationResult.value.breedingStatus.inseminationCount
			};

			// 繁殖統計を更新
			updatedAggregate.summary = {
				totalInseminationCount:
					calculationResult.value.breedingSummary.totalInseminationCount,
				averageDaysOpen:
					calculationResult.value.breedingSummary.averageDaysOpen,
				averagePregnancyPeriod:
					calculationResult.value.breedingSummary.averagePregnancyPeriod,
				averageCalvingInterval:
					calculationResult.value.breedingSummary.averageCalvingInterval,
				difficultBirthCount:
					calculationResult.value.breedingSummary.difficultBirthCount,
				pregnancyHeadCount:
					calculationResult.value.breedingSummary.pregnancyHeadCount,
				pregnancySuccessRate:
					calculationResult.value.breedingSummary.pregnancySuccessRate,
				lastUpdated: currentTime
			};

			// イベント履歴を更新
			updatedAggregate.history = updatedEvents;
			updatedAggregate.lastUpdated = currentTime;

			// データベースに保存
			await this.deps.breedingRepo.save(breedingAggregate);

			// 日数計算を更新
			await this.deps.breedingRepo.updateBreedingStatusDays(
				input.cattleId,
				currentTime
			);

			return ok({
				breedingStatus: {
					parity: calculationResult.value.breedingStatus.parity,
					expectedCalvingDate:
						calculationResult.value.breedingStatus.expectedCalvingDate?.toISOString() ??
						null,
					scheduledPregnancyCheckDate:
						calculationResult.value.breedingStatus.scheduledPregnancyCheckDate?.toISOString() ??
						null,
					daysAfterCalving:
						calculationResult.value.breedingStatus.daysAfterCalving,
					daysOpen: calculationResult.value.breedingStatus.daysOpen,
					pregnancyDays: calculationResult.value.breedingStatus.pregnancyDays,
					daysAfterInsemination:
						calculationResult.value.breedingStatus.daysAfterInsemination,
					inseminationCount:
						calculationResult.value.breedingStatus.inseminationCount
				},
				breedingSummary: {
					totalInseminationCount:
						calculationResult.value.breedingSummary.totalInseminationCount,
					averageDaysOpen:
						calculationResult.value.breedingSummary.averageDaysOpen,
					averagePregnancyPeriod:
						calculationResult.value.breedingSummary.averagePregnancyPeriod,
					averageCalvingInterval:
						calculationResult.value.breedingSummary.averageCalvingInterval,
					difficultBirthCount:
						calculationResult.value.breedingSummary.difficultBirthCount,
					pregnancyHeadCount:
						calculationResult.value.breedingSummary.pregnancyHeadCount,
					pregnancySuccessRate:
						calculationResult.value.breedingSummary.pregnancySuccessRate
				},
				processedEventType: input.eventType,
				processedAt: currentTime
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to handle breeding event",
				cause: error
			});
		}
	}

	/**
	 * 繁殖イベントを作成します
	 */
	private createBreedingEvent(input: EventHandlerInput): BreedingEvent {
		const baseEvent = {
			timestamp: input.eventData.timestamp,
			memo: input.eventData.memo ?? null
		};

		switch (input.eventType) {
			case "Calve":
				return {
					...baseEvent,
					type: "Calve",
					isDifficultBirth: input.eventData.isDifficultBirth ?? false
				};
			case "Inseminate":
				return {
					...baseEvent,
					type: "Inseminate"
				};
			case "ConfirmPregnancy":
				return {
					...baseEvent,
					type: "ConfirmPregnancy",
					expectedCalvingDate:
						input.eventData.expectedCalvingDate ?? new Date(),
					scheduledPregnancyCheckDate:
						input.eventData.scheduledPregnancyCheckDate ?? new Date()
				};
			case "StartNewCycle":
				return {
					...baseEvent,
					type: "StartNewCycle"
				};
			default:
				throw new Error(`Unknown event type: ${input.eventType}`);
		}
	}

	/**
	 * 複数のイベントを一括処理します
	 */
	async handleMultipleBreedingEvents(
		events: EventHandlerInput[]
	): Promise<Result<EventHandlerResult[], DomainError>> {
		try {
			const results: EventHandlerResult[] = [];

			// 並列処理でパフォーマンスを向上
			const processingPromises = events.map(async (event) => {
				const result = await this.handleBreedingEvent(event);
				return result;
			});

			const processingResults = await Promise.all(processingPromises);

			// エラーチェック
			for (const result of processingResults) {
				if (!result.ok) {
					return result;
				}
				results.push(result.value);
			}

			return ok(results);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to handle multiple breeding events",
				cause: error
			});
		}
	}

	/**
	 * イベントの検証を行います
	 */
	validateBreedingEvent(input: EventHandlerInput): Result<void, DomainError> {
		try {
			// 基本的な検証
			if (!input.cattleId) {
				return err({
					type: "ValidationError",
					field: "cattleId",
					message: "Cattle ID is required"
				});
			}

			if (!input.eventData.timestamp) {
				return err({
					type: "ValidationError",
					field: "timestamp",
					message: "Event timestamp is required"
				});
			}

			// イベントタイプ固有の検証
			switch (input.eventType) {
				case "Calve":
					if (input.eventData.isDifficultBirth === undefined) {
						return err({
							type: "ValidationError",
							field: "isDifficultBirth",
							message: "Difficult birth flag is required for calving events"
						});
					}
					break;
				case "ConfirmPregnancy":
					if (!input.eventData.expectedCalvingDate) {
						return err({
							type: "ValidationError",
							field: "expectedCalvingDate",
							message:
								"Expected calving date is required for pregnancy confirmation events"
						});
					}
					break;
			}

			return ok(undefined);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to validate breeding event",
				cause: error
			});
		}
	}
}

/**
 * イベントハンドラーサービスのファクトリ関数
 */
export function createEventHandlerService(
	deps: EventHandlerDeps
): EventHandlerService {
	return new EventHandlerService(deps);
}

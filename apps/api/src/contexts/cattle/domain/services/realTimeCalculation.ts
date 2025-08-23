import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import { createEventBasedCalculationService } from "../../../breeding/domain/services/eventBasedCalculation";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";
import type { DomainError } from "../errors";
import type { BreedingAggregate } from "../model/breedingAggregate";
import type { Cattle } from "../model/cattle";

/**
 * リアルタイム計算サービスの依存関係
 */
export interface RealTimeCalculationDeps {
	/** 現在時刻を取得する関数 */
	clock: {
		now: () => Date;
	};
	/** 繁殖リポジトリ */
	breedingRepo: {
		findByCattleId: (cattleId: CattleId) => Promise<BreedingAggregate | null>;
		getBreedingHistory: (cattleId: CattleId) => Promise<BreedingEvent[]>;
		/** データベースの生データを取得 */
		getBreedingStatusRow: (cattleId: CattleId) => Promise<{
			breedingStatusId: number;
			cattleId: number;
			breedingMemo: string | null;
			isDifficultBirth: boolean | null;
			createdAt: string | null;
			updatedAt: string | null;
		} | null>;
		getBreedingSummaryRow: (cattleId: CattleId) => Promise<{
			breedingSummaryId: number;
			cattleId: number;
			createdAt: string | null;
			updatedAt: string | null;
		} | null>;
	};
}

/**
 * リアルタイム計算の入力パラメータ
 */
export interface RealTimeCalculationInput {
	/** 牛ID */
	cattleId: CattleId;
	/** 既存の牛データ（オプション） */
	existingCattle?: Cattle;
	/** 強制再計算フラグ */
	forceRecalculation?: boolean;
}

/**
 * リアルタイム計算の結果
 */
export interface RealTimeCalculationResult {
	/** 更新された牛データ */
	cattle: Cattle;
	/** 計算された繁殖状態 */
	breedingStatus: {
		breedingStatusId: number;
		cattleId: number;
		parity: number;
		expectedCalvingDate: string | null;
		scheduledPregnancyCheckDate: string | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number;
		breedingMemo: string | null;
		isDifficultBirth: boolean | null;
		createdAt: Date;
		updatedAt: Date;
	};
	/** 計算された繁殖統計 */
	breedingSummary: {
		breedingSummaryId: number;
		cattleId: number;
		totalInseminationCount: number;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number;
		pregnancyHeadCount: number;
		pregnancySuccessRate: number | null;
		createdAt: Date;
		updatedAt: Date;
	};
	/** 計算基準日時 */
	calculatedAt: Date;
	/** キャッシュヒットフラグ */
	cacheHit: boolean;
}

/**
 * リアルタイム計算サービス
 *
 * 牛詳細取得時に繁殖状態と統計をリアルタイムで計算します。
 * パフォーマンス向上のためキャッシュ機能を提供します。
 */
export class RealTimeCalculationService {
	private calculationCache = new Map<
		string,
		{
			result: RealTimeCalculationResult;
			timestamp: Date;
			ttl: number; // キャッシュ有効期限（ミリ秒）
		}
	>();

	constructor(private deps: RealTimeCalculationDeps) {}

	/**
	 * 牛詳細のリアルタイム計算を実行します
	 */
	async calculateCattleDetails(
		input: RealTimeCalculationInput
	): Promise<Result<RealTimeCalculationResult, DomainError>> {
		try {
			const currentTime = this.deps.clock.now();
			const cacheKey = this.generateCacheKey(input.cattleId, currentTime);

			// キャッシュチェック
			if (!input.forceRecalculation) {
				const cached = this.getCachedResult(cacheKey);
				if (cached) {
					return ok({
						...cached,
						cacheHit: true
					});
				}
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

			// データベースの生データを取得
			const statusRow = await this.deps.breedingRepo.getBreedingStatusRow(
				input.cattleId
			);
			const summaryRow = await this.deps.breedingRepo.getBreedingSummaryRow(
				input.cattleId
			);

			// イベント履歴を取得
			const events = await this.deps.breedingRepo.getBreedingHistory(
				input.cattleId
			);

			// イベントベース計算サービスを作成
			const calculationService = createEventBasedCalculationService({
				clock: this.deps.clock
			});

			// 計算を実行
			const calculationResult = calculationService.calculateFromEvents({
				cattleId: input.cattleId,
				events,
				currentDate: currentTime
			});

			if (!calculationResult.ok) {
				return calculationResult;
			}

			// 結果を構築
			const result: RealTimeCalculationResult = {
				cattle:
					input.existingCattle ||
					({
						cattleId: input.cattleId as unknown as number,
						ownerUserId: 0,
						identificationNumber: 0,
						earTagNumber: null,
						name: null,
						gender: null,
						birthday: null,
						growthStage: null,
						breed: null,
						status: null,
						producerName: null,
						barn: null,
						breedingValue: null,
						notes: null,
						weight: null,
						score: null,
						createdAt: currentTime.toISOString(),
						updatedAt: currentTime.toISOString(),
						alerts: {
							hasActiveAlerts: false,
							alertCount: 0,
							highestSeverity: null
						}
					} as unknown as Cattle),
				breedingStatus: {
					breedingStatusId: statusRow?.breedingStatusId ?? 0,
					cattleId: input.cattleId as unknown as number,
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
						calculationResult.value.breedingStatus.inseminationCount,
					breedingMemo: statusRow?.breedingMemo ?? null,
					isDifficultBirth: statusRow?.isDifficultBirth ?? null,
					createdAt: statusRow?.createdAt
						? new Date(statusRow.createdAt)
						: currentTime,
					updatedAt: statusRow?.updatedAt
						? new Date(statusRow.updatedAt)
						: currentTime
				},
				breedingSummary: {
					breedingSummaryId: summaryRow?.breedingSummaryId ?? 0,
					cattleId: input.cattleId as unknown as number,
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
					createdAt: summaryRow?.createdAt
						? new Date(summaryRow.createdAt)
						: currentTime,
					updatedAt: summaryRow?.updatedAt
						? new Date(summaryRow.updatedAt)
						: currentTime
				},
				calculatedAt: currentTime,
				cacheHit: false
			};

			// キャッシュに保存（TTL: 1時間）
			this.setCachedResult(cacheKey, result, 60 * 60 * 1000);

			return ok(result);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to calculate cattle details in real-time",
				cause: error
			});
		}
	}

	/**
	 * 複数の牛の詳細を一括計算します
	 */
	async calculateMultipleCattleDetails(
		cattleIds: CattleId[]
	): Promise<Result<RealTimeCalculationResult[], DomainError>> {
		try {
			const results: RealTimeCalculationResult[] = [];

			// 並列処理でパフォーマンスを向上
			const calculationPromises = cattleIds.map(async (cattleId) => {
				const result = await this.calculateCattleDetails({ cattleId });
				return result;
			});

			const calculationResults = await Promise.all(calculationPromises);

			// エラーチェック
			for (const result of calculationResults) {
				if (!result.ok) {
					return result;
				}
				results.push(result.value);
			}

			return ok(results);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to calculate multiple cattle details",
				cause: error
			});
		}
	}

	/**
	 * キャッシュをクリアします
	 */
	clearCache(): void {
		this.calculationCache.clear();
	}

	/**
	 * 特定の牛のキャッシュをクリアします
	 */
	clearCacheForCattle(cattleId: CattleId): void {
		const keysToDelete: string[] = [];
		for (const [key] of this.calculationCache) {
			if (key.includes(cattleId.toString())) {
				keysToDelete.push(key);
			}
		}
		for (const key of keysToDelete) {
			this.calculationCache.delete(key);
		}
	}

	/**
	 * 期限切れのキャッシュをクリーンアップします
	 */
	cleanupExpiredCache(): void {
		const now = this.deps.clock.now();
		const keysToDelete: string[] = [];

		for (const [key, value] of this.calculationCache) {
			if (now.getTime() - value.timestamp.getTime() > value.ttl) {
				keysToDelete.push(key);
			}
		}

		for (const key of keysToDelete) {
			this.calculationCache.delete(key);
		}
	}

	/**
	 * キャッシュキーを生成します
	 */
	private generateCacheKey(cattleId: CattleId, currentTime: Date): string {
		// 日単位でキャッシュキーを生成（同じ日なら同じキー）
		const dateKey = currentTime.toISOString().split("T")[0];
		return `cattle_${cattleId}_${dateKey}`;
	}

	/**
	 * キャッシュから結果を取得します
	 */
	private getCachedResult(cacheKey: string): RealTimeCalculationResult | null {
		const cached = this.calculationCache.get(cacheKey);
		if (!cached) {
			return null;
		}

		const now = this.deps.clock.now();
		if (now.getTime() - cached.timestamp.getTime() > cached.ttl) {
			// 期限切れ
			this.calculationCache.delete(cacheKey);
			return null;
		}

		return cached.result;
	}

	/**
	 * キャッシュに結果を保存します
	 */
	private setCachedResult(
		cacheKey: string,
		result: RealTimeCalculationResult,
		ttl: number
	): void {
		this.calculationCache.set(cacheKey, {
			result,
			timestamp: this.deps.clock.now(),
			ttl
		});
	}
}

/**
 * リアルタイム計算サービスのファクトリ関数
 */
export function createRealTimeCalculationService(
	deps: RealTimeCalculationDeps
): RealTimeCalculationService {
	return new RealTimeCalculationService(deps);
}

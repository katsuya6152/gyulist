/**
 * Get Cattle With Details Use Case
 *
 * 牛の詳細取得ユースケース（繁殖関連情報を含む）
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { Cattle } from "../../../domain/types/cattle";
import type { CattleId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetCattleWithDetailsDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 取得コマンドの型
 */
export type GetCattleWithDetailsInput = {
	cattleId: CattleId;
};

/**
 * 牛詳細取得ユースケースの関数型定義
 */
export type GetCattleWithDetailsUseCase = (
	deps: GetCattleWithDetailsDeps
) => (
	input: GetCattleWithDetailsInput
) => Promise<Result<CattleWithDetails, CattleError>>;

/**
 * 牛の詳細情報（繁殖関連情報を含む）
 */
export type CattleWithDetails = Cattle & {
	breedingStatus: {
		breedingStatusId: number;
		cattleId: number;
		parity: number | null;
		expectedCalvingDate: string | null;
		scheduledPregnancyCheckDate: string | null;
		daysAfterCalving: number | null;
		daysOpen: number | null;
		pregnancyDays: number | null;
		daysAfterInsemination: number | null;
		inseminationCount: number | null;
		breedingMemo: string | null;
		isDifficultBirth: boolean | null;
		createdAt: string;
		updatedAt: string;
	} | null;
	bloodline: {
		bloodlineId: number;
		cattleId: number;
		fatherCattleName: string | null;
		motherFatherCattleName: string | null;
		motherGrandFatherCattleName: string | null;
		motherGreatGrandFatherCattleName: string | null;
	} | null;
	motherInfo: {
		motherInfoId: number;
		cattleId: number;
		motherCattleId: number;
		motherName: string | null;
		motherIdentificationNumber: string | null;
		motherScore: number | null;
	} | null;
	breedingSummary: {
		breedingSummaryId: number;
		cattleId: number;
		totalInseminationCount: number | null;
		averageDaysOpen: number | null;
		averagePregnancyPeriod: number | null;
		averageCalvingInterval: number | null;
		difficultBirthCount: number | null;
		pregnancyHeadCount: number | null;
		pregnancySuccessRate: number | null;
		createdAt: string;
		updatedAt: string;
	} | null;
	events: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		createdAt: string;
		updatedAt: string;
	}> | null;
};

/**
 * 牛の詳細取得ユースケース
 *
 * 指定されたIDの牛を取得し、繁殖関連情報も含めて返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は牛エンティティと繁殖関連情報、失敗時は `CattleError` を含む `Result`
 */
export const getCattleWithDetailsUseCase: GetCattleWithDetailsUseCase =
	(deps) =>
	async (input): Promise<Result<CattleWithDetails, CattleError>> => {
		try {
			// 牛の基本情報を取得
			const cattleResult = await deps.cattleRepo.findById(input.cattleId);
			if (!cattleResult.ok) {
				return cattleResult;
			}

			if (!cattleResult.value) {
				return err({
					type: "NotFound",
					entity: "Cattle",
					id: input.cattleId,
					message: "指定された牛が見つかりません"
				});
			}

			const cattle = cattleResult.value;

			// 繁殖関連情報を並行して取得
			const [
				breedingStatusResult,
				bloodlineResult,
				motherInfoResult,
				breedingSummaryResult,
				eventsResult
			] = await Promise.all([
				deps.cattleRepo.getBreedingStatus(input.cattleId),
				deps.cattleRepo.getBloodline(input.cattleId),
				deps.cattleRepo.getMotherInfo(input.cattleId),
				deps.cattleRepo.getBreedingSummary(input.cattleId),
				deps.cattleRepo.getEvents(input.cattleId)
			]);

			// エラーチェック
			if (!breedingStatusResult.ok) {
				return breedingStatusResult;
			}
			if (!bloodlineResult.ok) {
				return bloodlineResult;
			}
			if (!motherInfoResult.ok) {
				return motherInfoResult;
			}
			if (!breedingSummaryResult.ok) {
				return breedingSummaryResult;
			}
			if (!eventsResult.ok) {
				return eventsResult;
			}

			// 結果を統合
			const cattleWithDetails: CattleWithDetails = {
				...cattle,
				breedingStatus: breedingStatusResult.value,
				bloodline: bloodlineResult.value,
				motherInfo: motherInfoResult.value,
				breedingSummary: breedingSummaryResult.value,
				events: eventsResult.value
			};

			return ok(cattleWithDetails);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to get cattle with details",
				cause: error
			});
		}
	};

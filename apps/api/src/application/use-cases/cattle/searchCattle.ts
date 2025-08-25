/**
 * Search Cattle Use Case
 *
 * 牛検索ユースケース
 */

import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type {
	Cattle,
	CattleSearchCriteria
} from "../../../domain/types/cattle";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type SearchCattleDeps = {
	cattleRepo: CattleRepository;
};

/**
 * 牛検索コマンドの型
 */
export type SearchCattleInput = {
	ownerUserId: UserId;
	criteria: CattleSearchCriteria;
	cursor?: {
		id: number;
		value: string | number;
	};
	limit: number;
	sortBy: "id" | "name" | "days_old" | "days_open";
	sortOrder: "asc" | "desc";
	hasAlert?: boolean;
	minAge?: number;
	maxAge?: number;
	barn?: string;
	breed?: string;
};

/**
 * 牛検索結果の型
 */
export type SearchCattleResult = {
	results: Cattle[];
	nextCursor: {
		id: number;
		value: string | number;
	} | null;
	hasNext: boolean;
	totalCount: number;
};

/**
 * 牛検索ユースケースの関数型定義
 */
export type SearchCattleUseCase = (
	deps: SearchCattleDeps
) => (
	input: SearchCattleInput
) => Promise<Result<SearchCattleResult, CattleError>>;

/**
 * 牛検索ユースケース
 *
 * 指定された条件で牛を検索し、ページング対応の結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const searchCattleUseCase: SearchCattleUseCase =
	(deps: SearchCattleDeps) =>
	async (
		input: SearchCattleInput
	): Promise<Result<SearchCattleResult, CattleError>> => {
		try {
			// 検索条件を構築
			const searchCriteria = {
				...input.criteria,
				cursor: input.cursor,
				limit: input.limit,
				sortBy: input.sortBy,
				sortOrder: input.sortOrder,
				hasAlert: input.hasAlert,
				minAge: input.minAge,
				maxAge: input.maxAge,
				barn: input.barn,
				breed: input.breed
			};

			// 牛の検索実行
			const searchResult = await deps.cattleRepo.search(searchCriteria);
			if (!searchResult.ok) {
				return searchResult;
			}

			// 総件数を取得
			const countResult = await deps.cattleRepo.searchCount(input.criteria);
			if (!countResult.ok) {
				return countResult;
			}

			const results = searchResult.value;
			const totalCount = countResult.value;

			// 次のページがあるかどうかを判定
			const hasNext = results.length === input.limit;
			const nextCursor =
				hasNext && results.length > 0
					? {
							id: results[results.length - 1].cattleId as unknown as number,
							value: getSortValue(results[results.length - 1], input.sortBy)
						}
					: null;

			return ok({
				results,
				nextCursor,
				hasNext,
				totalCount
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to search cattle",
				cause
			});
		}
	};

/**
 * ソート値の取得
 */
function getSortValue(
	cattle: Cattle,
	sortBy: SearchCattleInput["sortBy"]
): string | number {
	switch (sortBy) {
		case "id":
			return cattle.cattleId as unknown as number;
		case "name":
			return cattle.name as unknown as string;
		case "days_old":
			return cattle.birthday
				? Math.floor(
						(Date.now() - cattle.birthday.getTime()) / (1000 * 60 * 60 * 24)
					)
				: 0;
		case "days_open":
			return cattle.birthday
				? Math.floor(
						(Date.now() - cattle.birthday.getTime()) / (1000 * 60 * 60 * 24)
					)
				: 0; // TODO: 実際のdays_openフィールドに修正
		default:
			return cattle.cattleId as unknown as number;
	}
}

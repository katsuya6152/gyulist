/**
 * List Registrations Use Case
 *
 * 事前登録一覧取得のユースケース実装
 */

import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import type {
	RegistrationRepository,
	SearchRegistrationsParams,
	SearchRegistrationsResult
} from "../../../domain/ports/registration";
import type { Result } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type ListRegistrationsInput = {
	readonly query?: string;
	readonly fromDate?: Date;
	readonly toDate?: Date;
	readonly referralSource?: string;
	readonly limit: number;
	readonly offset: number;
};

export type ListRegistrationsResult = SearchRegistrationsResult;

export type ListRegistrationsDeps = {
	readonly registrationRepo: RegistrationRepository;
};

export type ListRegistrationsUseCase = (
	deps: ListRegistrationsDeps
) => (
	input: ListRegistrationsInput
) => Promise<Result<ListRegistrationsResult, RegistrationError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * 事前登録一覧取得ユースケース
 *
 * 検索条件に基づいて事前登録の一覧を取得します。
 * ページネーション、日付範囲、紹介元フィルタリングをサポートします。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const listRegistrationsUseCase: ListRegistrationsUseCase =
	(deps: ListRegistrationsDeps) =>
	async (
		input: ListRegistrationsInput
	): Promise<Result<ListRegistrationsResult, RegistrationError>> => {
		const searchParams: SearchRegistrationsParams = {
			query: input.query,
			fromDate: input.fromDate,
			toDate: input.toDate,
			referralSource: input.referralSource,
			limit: input.limit,
			offset: input.offset
		};

		return deps.registrationRepo.search(searchParams);
	};

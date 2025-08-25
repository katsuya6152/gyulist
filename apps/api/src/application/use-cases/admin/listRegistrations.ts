/**
 * List Registrations Use Case
 *
 * 管理者向けの事前登録一覧取得ユースケース
 */

import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import type { RegistrationRepository } from "../../../domain/ports/registration";
import type {
	Registration,
	RegistrationId
} from "../../../domain/types/registration";
import type { Result } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type ListRegistrationsInput = {
	readonly q?: string;
	readonly from?: number;
	readonly to?: number;
	readonly source?: string;
	readonly limit: number;
	readonly offset: number;
};

export type ListRegistrationsResult = {
	readonly items: Registration[];
	readonly total: number;
};

export type ListRegistrationsDeps = {
	registrationRepo: RegistrationRepository;
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
 * 管理者向けに事前登録データを一覧表示します。
 * 検索、フィルタリング、ページネーションに対応しています。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const listRegistrationsUseCase: ListRegistrationsUseCase =
	(deps: ListRegistrationsDeps) =>
	async (
		input: ListRegistrationsInput
	): Promise<Result<ListRegistrationsResult, RegistrationError>> => {
		try {
			// 事前登録データを取得
			const result = await deps.registrationRepo.search({
				query: input.q,
				fromDate: input.from ? new Date(input.from) : undefined,
				toDate: input.to ? new Date(input.to) : undefined,
				referralSource: input.source,
				limit: input.limit,
				offset: input.offset
			});

			if (!result.ok) {
				return result;
			}

			return {
				ok: true,
				value: {
					items: result.value.items,
					total: result.value.total
				}
			};
		} catch (error) {
			return {
				ok: false,
				error: {
					type: "InfraError",
					message: "Failed to list registrations",
					cause: error
				}
			};
		}
	};

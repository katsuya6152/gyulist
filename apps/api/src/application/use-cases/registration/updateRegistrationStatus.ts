/**
 * Update Registration Status Use Case
 *
 * 事前登録ステータス更新のユースケース実装
 */

import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import { updateRegistrationStatus } from "../../../domain/functions/registration";
import type { RegistrationRepository } from "../../../domain/ports/registration";
import type {
	Registration,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "../../../domain/types/registration";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type UpdateRegistrationStatusInput = {
	readonly registrationId: RegistrationId;
	readonly newStatus: RegistrationStatus;
	readonly reason?: string;
};

export type UpdateRegistrationStatusResult = {
	readonly registration: Registration;
};

export type UpdateRegistrationStatusDeps = {
	readonly registrationRepo: RegistrationRepository;
	readonly clock: ClockPort;
};

export type UpdateRegistrationStatusUseCase = (
	deps: UpdateRegistrationStatusDeps
) => (
	input: UpdateRegistrationStatusInput
) => Promise<Result<UpdateRegistrationStatusResult, RegistrationError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * 事前登録ステータス更新ユースケース
 *
 * 事前登録のステータスを更新します。
 * ステータス遷移のビジネスルールを検証し、適切な場合のみ更新を実行します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const updateRegistrationStatusUseCase: UpdateRegistrationStatusUseCase =
	(deps: UpdateRegistrationStatusDeps) =>
	async (
		input: UpdateRegistrationStatusInput
	): Promise<Result<UpdateRegistrationStatusResult, RegistrationError>> => {
		// 登録の存在確認
		const registrationResult = await deps.registrationRepo.findById(
			input.registrationId
		);
		if (!registrationResult.ok) return registrationResult;

		const registration = registrationResult.value;
		if (!registration) {
			return err({
				type: "NotFoundError",
				message: "登録が見つかりません",
				id: input.registrationId
			});
		}

		// ステータス更新（ドメインルールの検証を含む）
		const currentTime = deps.clock.now();
		const timestamp = Math.floor(currentTime.getTime() / 1000) as Timestamp;

		const updateResult = updateRegistrationStatus(
			registration,
			input.newStatus,
			timestamp
		);

		if (!updateResult.ok) return updateResult;

		// データベースに保存
		const saveResult = await deps.registrationRepo.updateStatus(
			input.registrationId,
			input.newStatus,
			input.reason
		);

		if (!saveResult.ok) return saveResult;

		return {
			ok: true,
			value: {
				registration: saveResult.value
			}
		};
	};

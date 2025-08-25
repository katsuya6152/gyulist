/**
 * Pre-Register User Use Case
 *
 * 事前登録のユースケース実装
 */

import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import {
	createEmailLog,
	createRegistration
} from "../../../domain/functions/registration";
import type {
	EmailService,
	RegistrationRepository,
	TurnstileService
} from "../../../domain/ports/registration";
import type {
	Email,
	EmailLogId,
	ErrorMessage,
	LocaleValue,
	ReferralSource,
	Registration,
	RegistrationId,
	ResendId,
	Timestamp
} from "../../../domain/types/registration";
import type { ClockPort } from "../../../shared/ports/clock";
import type { IdPort } from "../../../shared/ports/id";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type PreRegisterUserInput = {
	readonly email: string;
	readonly referralSource?: string | null;
	readonly turnstileToken: string;
	readonly locale?: string;
};

export type PreRegisterUserResult = {
	readonly status: number;
	readonly body: Record<string, unknown>;
};

export type PreRegisterUserDeps = {
	readonly registrationRepo: RegistrationRepository;
	readonly emailService: EmailService;
	readonly turnstileService: TurnstileService;
	readonly idGenerator: IdPort;
	readonly clock: ClockPort;
};

export type PreRegisterUserUseCase = (
	deps: PreRegisterUserDeps
) => (
	input: PreRegisterUserInput
) => Promise<Result<PreRegisterUserResult, RegistrationError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * 事前登録ユースケース
 *
 * 新規ユーザーの事前登録を処理します。
 * Turnstile検証、重複チェック、登録作成、メール送信を行います。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const preRegisterUserUseCase: PreRegisterUserUseCase =
	(deps: PreRegisterUserDeps) =>
	async (
		input: PreRegisterUserInput
	): Promise<Result<PreRegisterUserResult, RegistrationError>> => {
		try {
			// 1. Turnstile検証
			const turnstileResult = await deps.turnstileService.verify(
				input.turnstileToken
			);
			if (!turnstileResult.ok) return turnstileResult;

			if (!turnstileResult.value) {
				return err({
					type: "TurnstileError",
					message: "Turnstile検証に失敗しました",
					token: input.turnstileToken
				});
			}

			// 2. 既存登録チェック
			const existingResult = await deps.registrationRepo.findByEmail(
				input.email
			);
			if (!existingResult.ok) return existingResult;

			if (existingResult.value) {
				return ok({
					status: 200,
					body: { ok: true, alreadyRegistered: true }
				});
			}

			// 3. 新規登録の作成
			const currentTime = deps.clock.now();
			const registrationId = deps.idGenerator.uuid() as RegistrationId;
			const timestamp = Math.floor(currentTime.getTime() / 1000) as Timestamp;

			const registrationResult = createRegistration(
				{
					email: input.email as Email,
					referralSource: input.referralSource
						? (input.referralSource as ReferralSource)
						: null,
					locale: (input.locale || "ja") as LocaleValue
				},
				registrationId,
				timestamp
			);

			if (!registrationResult.ok) return registrationResult;

			// 4. データベースに保存
			const createResult = await deps.registrationRepo.create(
				registrationResult.value
			);
			if (!createResult.ok) return createResult;

			// 5. 完了メールの送信
			try {
				const mailResult = await deps.emailService.sendCompletionEmail(
					input.email,
					"新規ユーザー" // 事前登録時点ではユーザー名は未設定
				);

				if (!mailResult.ok) {
					// メール送信失敗をログに記録
					const emailLogResult = createEmailLog(
						{
							email: input.email as Email,
							type: "completed",
							httpStatus: 502,
							resendId: null,
							error: mailResult.error.message as unknown as ErrorMessage
						},
						deps.idGenerator.uuid() as unknown as EmailLogId,
						timestamp
					);

					if (emailLogResult.ok) {
						await deps.registrationRepo.createEmailLog(emailLogResult.value);
					}

					return ok({
						status: 502,
						body: {
							ok: false,
							code: "RESEND_FAILED",
							message: "メール送信に失敗しました"
						}
					});
				}

				// 6. メールログの記録（成功）
				const emailLogResult = createEmailLog(
					{
						email: input.email as Email,
						type: "completed",
						httpStatus: 200,
						resendId: mailResult.value as unknown as ResendId,
						error: null
					},
					deps.idGenerator.uuid() as unknown as EmailLogId,
					timestamp
				);

				if (emailLogResult.ok) {
					await deps.registrationRepo.createEmailLog(emailLogResult.value);
				}
			} catch (mailError) {
				// メール送信例外をログに記録
				const emailLogResult = createEmailLog(
					{
						email: input.email as Email,
						type: "completed",
						httpStatus: 502,
						resendId: null,
						error: (mailError as Error).message as unknown as ErrorMessage
					},
					deps.idGenerator.uuid() as unknown as EmailLogId,
					timestamp
				);

				if (emailLogResult.ok) {
					await deps.registrationRepo.createEmailLog(emailLogResult.value);
				}

				return ok({
					status: 502,
					body: {
						ok: false,
						code: "RESEND_FAILED",
						message: "メール送信に失敗しました"
					}
				});
			}

			return ok({
				status: 200,
				body: { ok: true }
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "事前登録の処理に失敗しました",
				cause
			});
		}
	};

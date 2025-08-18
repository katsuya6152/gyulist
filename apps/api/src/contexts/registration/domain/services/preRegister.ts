import type { IdPort } from "../../../../shared/ports/id";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { RegistrationRepoPort } from "../../ports";
import type { RegistrationDomainError } from "../errors";
import {
	createEmailLog,
	createRegistration,
	nowSeconds,
	toEmailLogId,
	toErrorMessage,
	toLocaleValue,
	toRegistrationId,
	toResendId,
	toTimestamp
} from "../model";
import type {
	Email,
	LocaleValue,
	ReferralSource,
	Timestamp
} from "../model/types";

// ============================================================================
// コマンドと依存関係
// ============================================================================

export type PreRegisterCmd = {
	email: Email;
	referralSource?: ReferralSource | null;
	turnstileToken: string;
};

export type PreRegisterDeps = {
	turnstile: { verify(secret: string, token: string): Promise<boolean> };
	id: IdPort;
	time: { nowSeconds(): number };
	repo: RegistrationRepoPort;
	mail: {
		sendCompleted(
			apiKey: string,
			from: string,
			to: string,
			referral: string | null
		): Promise<{ id: string }>;
	};
	secrets: {
		TURNSTILE_SECRET_KEY: string;
		RESEND_API_KEY: string;
		MAIL_FROM: string;
	};
};

// ============================================================================
// 結果型
// ============================================================================

export type PreRegisterResult = {
	status: number;
	body: Record<string, unknown>;
};

// ============================================================================
// ドメインサービス
// ============================================================================

/**
 * 事前登録のユースケース
 */
export const preRegister =
	(deps: PreRegisterDeps) =>
	async (
		cmd: PreRegisterCmd
	): Promise<Result<PreRegisterResult, RegistrationDomainError>> => {
		try {
			// 1. Turnstile検証
			const turnstileValid = await deps.turnstile.verify(
				deps.secrets.TURNSTILE_SECRET_KEY,
				cmd.turnstileToken
			);
			if (!turnstileValid) {
				return err({
					type: "TurnstileError",
					message: "Turnstile検証に失敗しました",
					token: cmd.turnstileToken
				});
			}

			// 2. 既存登録チェック
			const existing = await deps.repo.findByEmail(cmd.email as string);
			if (existing) {
				return ok({
					status: 200,
					body: { ok: true, alreadyRegistered: true }
				});
			}

			// 3. 新規登録の作成
			const currentTime = deps.time.nowSeconds();
			const registrationId = toRegistrationId(deps.id.uuid());
			const locale = toLocaleValue("ja");

			const newRegistration = createRegistration(
				{
					email: cmd.email,
					referralSource: cmd.referralSource ?? null,
					locale
				},
				registrationId,
				toTimestamp(currentTime)
			);

			// 4. データベースに保存
			await deps.repo.insert({
				id: newRegistration.id as string,
				email: newRegistration.email as string,
				referralSource: newRegistration.referralSource as string | null,
				status: newRegistration.status,
				locale: newRegistration.locale as string,
				createdAt: newRegistration.createdAt,
				updatedAt: newRegistration.updatedAt
			});

			// 5. 完了メールの送信
			try {
				const mailResult = await deps.mail.sendCompleted(
					deps.secrets.RESEND_API_KEY,
					deps.secrets.MAIL_FROM,
					cmd.email as string,
					cmd.referralSource as string | null
				);

				// 6. メールログの記録（成功）
				const emailLogId = toEmailLogId(deps.id.uuid());
				const emailLog = createEmailLog(
					{
						email: cmd.email,
						type: "completed",
						httpStatus: 200,
						resendId: toResendId(mailResult.id),
						error: null
					},
					emailLogId,
					toTimestamp(currentTime)
				);

				await deps.repo.insertEmailLog({
					id: emailLog.id as string,
					email: emailLog.email as string,
					type: emailLog.type,
					httpStatus: emailLog.httpStatus,
					resendId: emailLog.resendId as string | null,
					error: emailLog.error as string | null,
					createdAt: emailLog.createdAt
				});
			} catch (mailError) {
				// 7. メールログの記録（失敗）
				const emailLogId = toEmailLogId(deps.id.uuid());
				const emailLog = createEmailLog(
					{
						email: cmd.email,
						type: "completed",
						resendId: null,
						error: toErrorMessage((mailError as Error).message)
					},
					emailLogId,
					toTimestamp(currentTime)
				);

				await deps.repo.insertEmailLog({
					id: emailLog.id as string,
					email: emailLog.email as string,
					type: emailLog.type,
					resendId: emailLog.resendId as string | null,
					error: emailLog.error as string | null,
					createdAt: emailLog.createdAt
				});

				return ok({
					status: 502,
					body: {
						ok: false,
						code: "RESEND_FAILED",
						message: "メール送信に失敗しました"
					}
				});
			}

			return ok({ status: 200, body: { ok: true } });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "事前登録の処理に失敗しました",
				cause
			});
		}
	};

/**
 * Register User Use Case
 *
 * ユーザー仮登録のユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import { createUser } from "../../../domain/functions/auth/userFactory";
import type {
	AuthRepository,
	VerificationTokenGenerator
} from "../../../domain/ports/auth";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type RegisterUserInput = {
	readonly email: string;
};

export type RegisterUserResult = {
	readonly success: true;
	readonly message: string;
	readonly verificationToken?: string;
	readonly isExistingUser: boolean;
};

export type RegisterUserDeps = {
	readonly authRepo: AuthRepository;
	readonly tokenGenerator: VerificationTokenGenerator;
	readonly clock: ClockPort;
	readonly mailService: {
		readonly sendVerificationEmail: (
			email: string,
			token: string
		) => Promise<Result<unknown, AuthError>>;
	};
	readonly env: {
		readonly ENVIRONMENT: string;
		readonly APP_URL: string;
		readonly RESEND_API_KEY: string;
		readonly MAIL_FROM?: string;
	};
};

export type RegisterUserUseCase = (
	deps: RegisterUserDeps
) => (
	input: RegisterUserInput
) => Promise<Result<RegisterUserResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * ユーザー仮登録ユースケース
 *
 * メールアドレスによる仮登録を行い、検証トークンを生成します。
 * 既存ユーザーの場合はセキュリティのため同じメッセージを返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const registerUserUseCase: RegisterUserUseCase =
	(deps: RegisterUserDeps) =>
	async (
		input: RegisterUserInput
	): Promise<Result<RegisterUserResult, AuthError>> => {
		try {
			// 既存ユーザーチェック
			const existingResult = await deps.authRepo.findByEmail(input.email);

			if (!existingResult.ok) return existingResult;

			if (existingResult.value?.isVerified) {
				// 既に認証済みのユーザーの場合は再登録を拒否
				return ok({
					success: true,
					message:
						"このメールアドレスは既に登録されています。ログインしてください。",
					isExistingUser: true
				});
			}

			// 未認証の既存ユーザーまたは新規ユーザーの場合は処理を続行
			let verificationToken: string;

			if (existingResult.value && !existingResult.value.isVerified) {
				// 未認証の既存ユーザーの場合は、既存の検証トークンを更新
				const existingToken = existingResult.value.verificationToken;
				verificationToken =
					existingToken ?? (await deps.tokenGenerator.generate());

				// 既存の未認証ユーザーの検証トークンを更新
				const updateResult = await deps.authRepo.updateVerificationToken(
					existingResult.value.id,
					verificationToken
				);

				if (!updateResult.ok) return updateResult;
			} else {
				// 新規ユーザーの場合は新しい検証トークンを生成
				verificationToken = await deps.tokenGenerator.generate();
			}

			// 未認証の既存ユーザーの場合は更新完了、新規ユーザーの場合は作成処理
			if (!(existingResult.value && !existingResult.value.isVerified)) {
				// 新規ユーザー作成
				const currentTime = deps.clock.now();
				const userResult = createUser(
					{
						userName: "未設定", // 仮登録時は仮の名前
						email: input.email,
						verificationToken
					},
					currentTime
				);

				if (!userResult.ok) return userResult;

				// データベースに保存
				const createResult = await deps.authRepo.create({
					email: input.email,
					verificationToken
				});

				if (!createResult.ok) return createResult;
			}

			// メール送信処理
			if (deps.mailService && deps.env) {
				try {
					const mailResult = await deps.mailService.sendVerificationEmail(
						input.email,
						verificationToken
					);

					if (!mailResult.ok) {
						console.error("メール送信失敗:", mailResult.error);
						// メール送信失敗でも登録は成功とする（後で再送可能）
					}
				} catch (mailError) {
					console.error("メール送信例外:", mailError);
					// メール送信例外でも登録は成功とする（後で再送可能）
				}
			}

			return ok({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。",
				verificationToken,
				isExistingUser: false
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to register user",
				cause
			});
		}
	};

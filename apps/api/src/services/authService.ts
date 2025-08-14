import type { AnyD1Database } from "drizzle-orm/d1";
import { signToken, verifyPassword } from "../lib/auth";
import { sendVerificationEmail } from "../lib/mailer";
import { generateToken, hashPassword } from "../lib/token";
import {
	completeUserRegistration,
	createUser,
	findUserByEmail,
	findUserByVerificationToken,
	updateLastLoginAt
} from "../repositories/userRepository";
import type { Bindings } from "../types";
import type {
	CompleteInput,
	LoginInput,
	RegisterInput
} from "../validators/authValidator";
export async function register(
	env: Bindings,
	dbInstance: AnyD1Database,
	input: RegisterInput
) {
	const existingUser = await findUserByEmail(dbInstance, input.email);
	if (existingUser) {
		// セキュリティの観点から既に登録されている場合でも返すメッセージは同じにするがログには残す。
		console.error("このメールアドレスは既に登録されています。");
		return {
			success: true,
			message: "仮登録が完了しました。メールを確認してください。"
		};
	}

	const token = await generateToken();
	await createUser(dbInstance, input.email, token);
	await sendVerificationEmail(env, input.email, token);
	return {
		success: true,
		message: "仮登録が完了しました。メールを確認してください。"
	};
}

export async function verifyToken(
	env: Bindings,
	dbInstance: AnyD1Database,
	token: string
) {
	const user = await findUserByVerificationToken(dbInstance, token);
	if (!user) {
		return { success: false, message: "無効なトークンです。" };
	}
	if (user.isVerified) {
		return { success: false, message: "既に本登録が完了しています。" };
	}
	return {
		success: true,
		message: "トークンは有効です。本登録を完了してください。"
	};
}

export async function completeRegistration(
	env: Bindings,
	dbInstance: AnyD1Database,
	input: CompleteInput
) {
	const user = await findUserByVerificationToken(dbInstance, input.token);
	if (!user) {
		return { success: false, message: "無効なトークンです。" };
	}
	if (user.isVerified) {
		return { success: false, message: "既に本登録が完了しています。" };
	}
	const passwordHash = await hashPassword(input.password);
	await completeUserRegistration(
		dbInstance,
		input.token,
		input.name,
		passwordHash
	);
	return {
		success: true,
		message: "本登録が完了しました。ログインしてください。"
	};
}

export async function login(
	dbInstance: AnyD1Database,
	jwtSecret: string,
	input: LoginInput
) {
	const user = await findUserByEmail(dbInstance, input.email);

	if (!user) {
		return {
			success: false,
			message: "メールアドレスまたはパスワードが正しくありません"
		};
	}

	// OAuth users have dummy password hashes starting with "oauth_dummy_"
	if (user.passwordHash?.startsWith("oauth_dummy_")) {
		return {
			success: false,
			message: "このアカウントはGoogleログインでご利用ください"
		};
	}

	// Legacy check for null password hash (if any still exist)
	if (!user.passwordHash) {
		return {
			success: false,
			message:
				"メールアドレスまたはパスワードもしくはログイン方法が正しくありません"
		};
	}

	const valid = await verifyPassword(input.password, user.passwordHash);
	if (!valid) {
		return {
			success: false,
			message: "メールアドレスまたはパスワードが正しくありません"
		};
	}

	// ログイン成功時に lastLoginAt を更新
	await updateLastLoginAt(dbInstance, user.id);

	const token = await signToken({ userId: user.id }, jwtSecret);

	return { success: true, token };
}

import type { Brand } from "../../shared/brand";
import type { TokenPort } from "../../shared/ports/token";
import type { User } from "./domain/model/user";

export type UserId = Brand<number, "UserId">;

export interface AuthRepoPort {
	findUserById(id: UserId): Promise<User | null>;
	findUserByEmail(email: string): Promise<User | null>;
	createUser(input: {
		email: string;
		verificationToken: string;
	}): Promise<void>;
	findUserByVerificationToken(token: string): Promise<User | null>;
	completeUserRegistration(input: {
		token: string;
		name: string;
		passwordHash: string;
	}): Promise<void>;
	updateLastLoginAt(userId: UserId, iso: string): Promise<void>;
	updateUserTheme(userId: UserId, theme: string, iso: string): Promise<void>;
}

export type PasswordVerifier = (
	password: string,
	hash: string
) => Promise<boolean>;
export type PasswordHasher = (password: string) => Promise<string>;
export type VerificationTokenGenerator = () => Promise<string> | string;

export type AuthDeps = {
	repo: AuthRepoPort;
	token: TokenPort;
	verifyPassword?: PasswordVerifier;
	hashPassword?: PasswordHasher;
	generateVerificationToken?: VerificationTokenGenerator;
};

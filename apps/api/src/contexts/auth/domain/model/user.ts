import type { Brand } from "../../../../shared/brand";

export type UserId = Brand<number, "UserId">;

export type User = {
	id: UserId;
	userName: string;
	email: string;
	isVerified: boolean;
	passwordHash: string | null;
	googleId: string | null;
	lineId: string | null;
	oauthProvider: "email" | "google" | "line" | null;
	avatarUrl: string | null;
	lastLoginAt: string | null;
	theme: string | null;
	createdAt: string;
	updatedAt: string;
};

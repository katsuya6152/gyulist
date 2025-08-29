import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { sessions, users } from "../db/schema";

export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
}

export interface User {
	id: number;
	userName: string | null;
	email: string;
	avatarUrl: string | null;
	oauthProvider: string | null;
}

export interface SessionValidationResult {
	session: Session | null;
	user: User | null;
}

export function generateSessionToken(): string {
	// Cloudflare Workers環境での互換性のため、複数の方法を試行
	let bytes: Uint8Array;

	try {
		// まずcrypto.getRandomValuesを試行
		if (typeof crypto !== "undefined" && crypto.getRandomValues) {
			bytes = crypto.getRandomValues(new Uint8Array(20));
		} else {
			// フォールバック: Math.random()を使用
			bytes = new Uint8Array(20);
			for (let i = 0; i < 20; i++) {
				bytes[i] = Math.floor(Math.random() * 256);
			}
		}
	} catch (error) {
		// エラーが発生した場合のフォールバック
		bytes = new Uint8Array(20);
		for (let i = 0; i < 20; i++) {
			bytes[i] = Math.floor(Math.random() * 256);
		}
	}

	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	dbInstance: AnyD1Database,
	token: string,
	userId: number
): Promise<Session> {
	const db = drizzle(dbInstance);
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30日
	};

	await db.insert(sessions).values({
		id: session.id,
		userId: session.userId,
		expiresAt: session.expiresAt
	});

	return session;
}

export async function validateSessionToken(
	dbInstance: AnyD1Database,
	token: string
): Promise<SessionValidationResult> {
	const db = drizzle(dbInstance);
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({
			session: {
				id: sessions.id,
				userId: sessions.userId,
				expiresAt: sessions.expiresAt
			},
			user: {
				id: users.id,
				userName: users.userName,
				email: users.email,
				avatarUrl: users.avatarUrl,
				oauthProvider: users.oauthProvider
			}
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length < 1) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];
	const expiresAt = new Date(session.expiresAt);

	if (Date.now() >= expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		// セッションの有効期限を延長（残り15日未満の場合）
		const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessions)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessions.id, session.id));
		session.expiresAt = newExpiresAt;
	}

	return {
		session: {
			id: session.id,
			userId: session.userId,
			expiresAt
		},
		user: {
			id: user.id,
			userName: user.userName,
			email: user.email,
			avatarUrl: user.avatarUrl,
			oauthProvider: user.oauthProvider
		}
	};
}

export async function invalidateSession(
	dbInstance: AnyD1Database,
	sessionId: string
): Promise<void> {
	const db = drizzle(dbInstance);
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function createSessionCookie(
	token: string,
	expiresAt: Date,
	isProduction = false
) {
	return {
		name: "session",
		value: token,
		attributes: {
			httpOnly: true,
			secure: isProduction,
			sameSite: "lax" as const,
			expires: expiresAt,
			path: "/"
		}
	};
}

export function createBlankSessionCookie(isProduction = false) {
	return {
		name: "session",
		value: "",
		attributes: {
			httpOnly: true,
			secure: isProduction,
			sameSite: "lax" as const,
			maxAge: 0,
			path: "/"
		}
	};
}

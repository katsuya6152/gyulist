import { generateCodeVerifier, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { users } from "../db/schema";
import { generateOAuthDummyPasswordHash } from "../lib/auth";
import { type GoogleUser, createGoogleOAuth } from "../lib/oauth";
import { createSession, generateSessionToken } from "../lib/session";
import { getLogger } from "../shared/logging/logger";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	// Google OAuth 開始
	.get("/google", async (c) => {
		try {
			const google = createGoogleOAuth(c.env);
			const state = generateState();
			const codeVerifier = generateCodeVerifier();
			const url = google.createAuthorizationURL(state, codeVerifier, [
				"openid",
				"profile",
				"email"
			]);

			// 開発環境かどうかを判定
			const isProduction = c.env.ENVIRONMENT === "production";

			// Honoの組み込みCookie設定を使用
			setCookie(c, "google_oauth_state", state, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "None" : "Lax",
				maxAge: 600,
				path: "/"
			});

			setCookie(c, "google_oauth_code_verifier", codeVerifier, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "None" : "Lax",
				maxAge: 600,
				path: "/"
			});

			return c.redirect(url.toString());
		} catch (error) {
			console.error("Error in Google OAuth start:", error);
			return c.json(
				{
					error: "OAuth initialization failed",
					details: error instanceof Error ? error.message : "Unknown error"
				},
				500
			);
		}
	})

	// Google OAuth コールバック
	.get("/google/callback", async (c) => {
		const url = new URL(c.req.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");

		const logger = getLogger(c);
		logger.debug("OAuth callback received", {
			url: c.req.url,
			hasCode: !!code,
			hasState: !!state,
			stateValue: state,
			endpoint: "/oauth/google/callback"
		});

		// Honoの組み込みCookie取得を使用
		const storedState = getCookie(c, "google_oauth_state");
		const storedCodeVerifier = getCookie(c, "google_oauth_code_verifier");

		logger.debug("OAuth callback cookie validation", {
			hasStoredState: !!storedState,
			hasStoredCodeVerifier: !!storedCodeVerifier,
			storedStateValue: storedState,
			endpoint: "/oauth/google/callback"
		});

		if (!code || !state || !storedState || !storedCodeVerifier) {
			logger.error("OAuth callback missing required parameters", {
				hasCode: !!code,
				hasState: !!state,
				hasStoredState: !!storedState,
				hasStoredCodeVerifier: !!storedCodeVerifier,
				endpoint: "/oauth/google/callback"
			});
			return c.json({ error: "Invalid request parameters" }, 400);
		}

		if (state !== storedState) {
			logger.error("OAuth state mismatch", {
				receivedState: state,
				storedState: storedState,
				endpoint: "/oauth/google/callback"
			});
			return c.json({ error: "Invalid state parameter" }, 400);
		}

		try {
			const google = createGoogleOAuth(c.env);
			const tokens = await google.validateAuthorizationCode(
				code,
				storedCodeVerifier
			);

			// アクセストークンを安全に取得
			let accessToken: string;
			try {
				if (typeof tokens.accessToken === "function") {
					accessToken = (tokens.accessToken as unknown as () => string)();
				} else {
					accessToken = tokens.accessToken as unknown as string;
				}
			} catch (tokenError) {
				console.error("Error getting access token:", tokenError);
				return c.json({ error: "Failed to obtain access token" }, 500);
			}

			// Googleユーザー情報を取得
			if (!accessToken) {
				console.error("No access token available");
				return c.json({ error: "No access token received" }, 500);
			}

			let googleUser: GoogleUser;
			try {
				const googleUserResponse = await fetch(
					"https://www.googleapis.com/oauth2/v2/userinfo",
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							"User-Agent": "Gyulist/1.0"
						}
					}
				);

				if (!googleUserResponse.ok) {
					const errorText = await googleUserResponse.text();
					console.error(
						"Failed to fetch user info:",
						googleUserResponse.status,
						googleUserResponse.statusText
					);
					console.error("Google API error response:", errorText);
					return c.json(
						{ error: "Failed to fetch user info from Google" },
						500
					);
				}

				googleUser = await googleUserResponse.json();

				if (!googleUser.verified_email) {
					console.error("Google email not verified");
					return c.json({ error: "Google email not verified" }, 400);
				}
			} catch (fetchError) {
				console.error("Fetch error:", fetchError);
				return c.json({ error: "Network error while fetching user info" }, 500);
			}

			const db = drizzle(c.env.DB);

			// 既存ユーザーをチェック（Google IDまたはメールアドレスで）
			const existingUser = await db
				.select()
				.from(users)
				.where(eq(users.googleId, googleUser.id))
				.then((rows) => rows[0]);

			let userId: number;

			if (existingUser) {
				// 既存ユーザーの場合、情報を更新
				userId = existingUser.id;
				await db
					.update(users)
					.set({
						userName: googleUser.name,
						avatarUrl: googleUser.picture,
						lastLoginAt: new Date().toISOString()
					})
					.where(eq(users.id, userId));
			} else {
				// 新規ユーザーの場合、作成
				const newUser = await db
					.insert(users)
					.values({
						userName: googleUser.name,
						email: googleUser.email,
						passwordHash: generateOAuthDummyPasswordHash(), // OAuth ユーザーはダミーハッシュを設定
						googleId: googleUser.id,
						oauthProvider: "google",
						avatarUrl: googleUser.picture,
						isVerified: true, // Google認証済みなのでtrueに設定
						lastLoginAt: new Date().toISOString()
					})
					.returning({ id: users.id });

				userId = newUser[0].id;
			}

			// セッション作成
			const sessionToken = generateSessionToken();
			const session = await createSession(c.env.DB, sessionToken, userId);

			// 開発環境かどうかを判定
			const isProduction = c.env.ENVIRONMENT === "production";

			// JWTトークンを生成（既存システムとの互換性のため）
			const jwtPayload = {
				userId: userId,
				exp: Math.floor(session.expiresAt.getTime() / 1000), // UNIX timestamp
				iat: Math.floor(Date.now() / 1000)
			};

			// 簡単なJWT形式のトークンを作成（ヘッダー.ペイロード.署名）
			const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
			const payload = btoa(JSON.stringify(jwtPayload));
			const signature = btoa(`oauth-session-${sessionToken}`); // 簡易署名
			const jwtToken = `${header}.${payload}.${signature}`;

			// OAuth用クッキーをクリア
			deleteCookie(c, "google_oauth_state", { path: "/" });
			deleteCookie(c, "google_oauth_code_verifier", { path: "/" });

			// フロントエンドにトークンをURLパラメータで渡してリダイレクト
			const frontendUrl = isProduction
				? "https://gyulist.com"
				: "http://localhost:3000";
			const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(jwtToken)}`;

			return c.redirect(redirectUrl);
		} catch (error) {
			console.error("Google OAuth error:", error);
			return c.json(
				{
					error: "Authentication failed",
					details: error instanceof Error ? error.message : "Unknown error"
				},
				500
			);
		}
	});

export default app;

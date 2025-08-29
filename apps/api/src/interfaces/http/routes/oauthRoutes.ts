import { generateCodeVerifier, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { users } from "../../../db/schema";
import { generateOAuthDummyPasswordHash } from "../../../lib/auth";
import { type GoogleUser, createGoogleOAuth } from "../../../lib/oauth";
import { createSession, generateSessionToken } from "../../../lib/session";
import { executeUseCase } from "../../../shared/http/route-helpers";
import { getLogger } from "../../../shared/logging/logger";
import type { Env } from "../../../shared/ports/d1Database";

const app = new Hono<{ Bindings: Env }>()
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
			const logger = getLogger(c);
			logger.unexpectedError(
				"Error in Google OAuth start",
				error instanceof Error ? error : new Error(String(error)),
				{ endpoint: "/oauth/google" }
			);
			// 本番環境では詳細なエラー情報を隠す
			const isProduction = c.env.ENVIRONMENT === "production";
			return c.json(
				{
					error: "OAuth initialization failed",
					...(isProduction
						? {}
						: {
								details:
									error instanceof Error ? error.message : "Unknown error"
							})
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
			return c.json({ error: "Missing required OAuth parameters" }, 400);
		}

		// CSRF攻撃防止のためのstate検証
		if (state !== storedState) {
			logger.error("OAuth state mismatch", {
				receivedState: state,
				storedState: storedState,
				endpoint: "/oauth/google/callback"
			});
			return c.json({ error: "Invalid OAuth state" }, 400);
		}

		try {
			const google = createGoogleOAuth(c.env);

			const tokens = await google.validateAuthorizationCode(
				code,
				storedCodeVerifier
			);

			// アクセストークンを取得（Arcticライブラリの戻り値の構造に応じて調整）
			const accessToken =
				typeof tokens.accessToken === "function"
					? tokens.accessToken()
					: tokens.accessToken;

			if (!accessToken || typeof accessToken !== "string") {
				logger.error("No valid access token received from Google OAuth", {
					tokens: tokens,
					accessToken: accessToken,
					accessTokenType: typeof accessToken,
					endpoint: "/oauth/google/callback"
				});
				return c.json({ error: "No valid access token received" }, 500);
			}

			// Googleユーザー情報を取得
			let googleUser: GoogleUser;
			try {
				// Authorizationヘッダーを使用してアクセストークンを送信
				const googleUserResponse = await fetch(
					"https://www.googleapis.com/oauth2/v3/userinfo",
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							Accept: "application/json"
						}
					}
				);

				if (!googleUserResponse.ok) {
					logger.error("Failed to fetch Google user info", {
						status: googleUserResponse.status,
						statusText: googleUserResponse.statusText,
						responseText: await googleUserResponse.text(),
						endpoint: "/oauth/google/callback"
					});
					return c.json(
						{ error: "Failed to fetch user information from Google" },
						500
					);
				}

				const userInfoResponse = await googleUserResponse.json();

				// Google API v3のレスポンス形式に合わせてマッピング
				googleUser = {
					id: userInfoResponse.sub || userInfoResponse.id,
					email: userInfoResponse.email,
					verified_email: userInfoResponse.email_verified || false,
					name: userInfoResponse.name,
					given_name: userInfoResponse.given_name,
					family_name: userInfoResponse.family_name,
					picture: userInfoResponse.picture,
					locale: userInfoResponse.locale
				};

				if (!googleUser.verified_email) {
					logger.error("Google email not verified", {
						email: googleUser.email,
						endpoint: "/oauth/google/callback"
					});
					return c.json({ error: "Google email not verified" }, 400);
				}
			} catch (fetchError) {
				logger.error("Fetch error while getting Google user info", {
					error:
						fetchError instanceof Error
							? fetchError.message
							: String(fetchError),
					endpoint: "/oauth/google/callback"
				});
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
			logger.error("Google OAuth error", {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				endpoint: "/oauth/google/callback"
			});

			// OAuth用クッキーをクリア
			deleteCookie(c, "google_oauth_state", { path: "/" });
			deleteCookie(c, "google_oauth_code_verifier", { path: "/" });

			// 開発環境かどうかを判定
			const isProduction = c.env.ENVIRONMENT === "production";

			// フロントエンドのエラーページにリダイレクト
			const frontendUrl = isProduction
				? "https://gyulist.com"
				: "http://localhost:3000";
			const errorRedirectUrl = `${frontendUrl}/login?error=oauth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`;

			logger.debug("Redirecting to error page", {
				errorRedirectUrl: errorRedirectUrl,
				endpoint: "/oauth/google/callback"
			});

			return c.redirect(errorRedirectUrl);
		}
	});

export default app;

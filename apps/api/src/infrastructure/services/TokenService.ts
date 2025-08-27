import type { TokenPort } from "../../shared/ports/token";

export function createTokenService(env: string): TokenPort {
	const jwtSecret =
		env === "production" ? process.env.JWT_SECRET : "dev-secret";

	return {
		async sign(
			payload: { userId: number; exp: number } & Record<string, unknown>
		): Promise<string> {
			const { sign } = await import("hono/jwt");
			return sign(payload, jwtSecret || "dev-secret");
		},

		async verify(
			token: string
		): Promise<
			({ userId: number; exp: number } & Record<string, unknown>) | null
		> {
			try {
				const { verify } = await import("hono/jwt");
				return (await verify(token, jwtSecret || "dev-secret")) as {
					userId: number;
					exp: number;
				} & Record<string, unknown>;
			} catch {
				return null;
			}
		}
	};
}

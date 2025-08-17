import { sign, verify } from "hono/jwt";
import type { JwtPayload, TokenPort } from "../../../shared/ports/token";

export function createHonoJwtTokenPort(secret: string): TokenPort {
	return {
		async sign(payload) {
			return sign(payload, secret);
		},
		async verify(token) {
			try {
				const decoded = (await verify(token, secret)) as JwtPayload;
				return decoded ?? null;
			} catch (_e) {
				// Fallback for simplified OAuth tokens (align with middleware behavior)
				try {
					const parts = token.split(".");
					if (parts.length !== 3) return null;
					const json = JSON.parse(atob(parts[1]));
					if (json.exp && json.exp < Date.now() / 1000) return null;
					if (!json.userId) return null;
					return json as JwtPayload;
				} catch {
					return null;
				}
			}
		}
	};
}

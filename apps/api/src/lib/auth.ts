import { compare } from "bcryptjs";
import { sign } from "hono/jwt";

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return compare(password, hash);
}

export async function signToken(
	payload: Record<string, unknown>,
	secret: string,
): Promise<string> {
	return await sign(payload, secret);
}

import { hash } from "bcryptjs";

export async function generateToken(): Promise<string> {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		""
	);
}

export async function hashPassword(password: string): Promise<string> {
	return hash(password, 10);
}

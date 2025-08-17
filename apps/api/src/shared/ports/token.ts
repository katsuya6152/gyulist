export type JwtPayload = {
	userId: number;
	exp: number;
} & Record<string, unknown>;

// Simple token port abstraction to enable FDM for Auth without binding to a specific JWT lib
export interface TokenPort {
	sign(payload: JwtPayload): string | Promise<string>;
	verify(token: string): JwtPayload | null | Promise<JwtPayload | null>;
}

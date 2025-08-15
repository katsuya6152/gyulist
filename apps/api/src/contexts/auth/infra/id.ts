import type { IdPort } from "../../../shared/ports/id";

export function createCryptoIdPort(): IdPort {
	return {
		uuid() {
			return crypto.randomUUID();
		},
		next() {
			return 0;
		}
	};
}

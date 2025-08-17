import { Google } from "arctic";
import type { Bindings } from "../types";

export function createGoogleOAuth(env: Bindings): Google {
	return new Google(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET,
		`${env.APP_URL}/api/v1/oauth/google/callback`
	);
}

export interface GoogleUser {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

export interface PreRegisterItem {
	email: string;
	referral_source: string;
	created_at: string;
}

export interface QueryParams {
	q?: string;
	from?: string;
	to?: string;
	source?: string;
	limit?: number;
	offset?: number;
}

export interface AuthCredentials {
	user: string;
	pass: string;
}

export interface PreRegisterAdminProps {
	initialParams: QueryParams;
}

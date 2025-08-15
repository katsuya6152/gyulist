export type RegistrationRecord = {
	id: string;
	email: string;
	referralSource: string | null;
	status: string;
	locale: string;
	createdAt: number;
	updatedAt: number;
};

export type EmailLogRecord = {
	id: string;
	email: string;
	type: string;
	httpStatus?: number;
	resendId?: string | null;
	error?: string | null;
	createdAt: number;
};

export type SearchParams = {
	q?: string;
	from?: number;
	to?: number;
	source?: string;
	limit: number;
	offset: number;
};

export interface RegistrationRepoPort {
	findByEmail(email: string): Promise<RegistrationRecord | null>;
	insert(reg: RegistrationRecord): Promise<void>;
	search(
		params: SearchParams
	): Promise<{ items: RegistrationRecord[]; total: number }>;
	insertEmailLog(log: EmailLogRecord): Promise<void>;
}

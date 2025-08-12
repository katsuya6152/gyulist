import type { EmailLogRecord } from "../../src/repositories/emailLogRepository";
import type { RegistrationRecord } from "../../src/repositories/registrationRepository";

export type MemoryDB = {
	registrations: RegistrationRecord[];
	email_logs: EmailLogRecord[];
};

export const createMemoryDB = (): MemoryDB => ({
	registrations: [],
	email_logs: [],
});

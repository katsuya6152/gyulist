import type { AnyD1Database } from "drizzle-orm/d1";
import { makeAlertsRepo } from "../../contexts/alerts/infra/drizzle/repo";
import type { AlertsRepoPort } from "../../contexts/alerts/ports";
import { createAuthRepo } from "../../contexts/auth/infra/drizzle/repo";
import { createCryptoIdPort } from "../../contexts/auth/infra/id";
import { createHonoJwtTokenPort } from "../../contexts/auth/infra/token";
import type { AuthRepoPort } from "../../contexts/auth/ports";
import { makeCattleRepo } from "../../contexts/cattle/infra/drizzle/repo";
import type { CattleRepoPort } from "../../contexts/cattle/ports";
import { makeEventsRepo } from "../../contexts/events/infra/drizzle/repo";
import type { EventsRepoPort } from "../../contexts/events/ports";
import { makeKpiRepo } from "../../contexts/kpi/infra/drizzle/repo";
import type { KpiRepoPort } from "../../contexts/kpi/ports";
import { makeRegistrationRepo } from "../../contexts/registration/infra/drizzle/repo";
import type { RegistrationRepoPort } from "../../contexts/registration/ports";
import { verifyPassword } from "../../lib/auth";
import { generateToken, hashPassword } from "../../lib/token";
import type { ClockPort } from "../ports/clock";
import type { IdPort } from "../ports/id";
import type { TokenPort } from "../ports/token";
// NOTE: Centralized dependency injection for all FDM contexts.

// Core dependencies (most commonly used)
export type CoreDeps = {
	cattleRepo: CattleRepoPort;
	eventsRepo: EventsRepoPort;
	clock: ClockPort;
};

export function makeDeps(db: AnyD1Database, clock: ClockPort): CoreDeps {
	return {
		get cattleRepo() {
			return makeCattleRepo(db);
		}, // Lazy evaluation
		get eventsRepo() {
			return makeEventsRepo(db);
		}, // Lazy evaluation
		clock
	};
}

// Auth-specific dependencies
export type AuthDeps = {
	repo: AuthRepoPort;
	token: TokenPort;
	verifyPassword?: typeof verifyPassword;
	hashPassword?: typeof hashPassword;
	generateVerificationToken?: typeof generateToken;
};

export function makeAuthDeps(db: AnyD1Database, jwtSecret: string): AuthDeps {
	return {
		get repo() {
			return createAuthRepo(db);
		}, // Lazy evaluation
		get token() {
			return createHonoJwtTokenPort(jwtSecret);
		}, // Lazy evaluation
		verifyPassword,
		hashPassword,
		generateVerificationToken: generateToken
	};
}

// Registration-specific dependencies
export type RegistrationDeps = {
	repo: RegistrationRepoPort;
	id: IdPort;
	time: { nowSeconds: () => number };
};

export function makeRegistrationDeps(db: AnyD1Database): RegistrationDeps {
	return {
		get repo() {
			return makeRegistrationRepo(db);
		}, // Lazy evaluation
		get id() {
			return createCryptoIdPort();
		}, // Lazy evaluation
		time: { nowSeconds: () => Math.floor(Date.now() / 1000) }
	};
}

// Alerts dependencies
export type AlertsDeps = {
	repo: AlertsRepoPort;
};

export function makeAlertsDeps(db: AnyD1Database): AlertsDeps {
	return {
		get repo() {
			return makeAlertsRepo(db);
		} // Lazy evaluation to avoid hoisting issues
	};
}

// KPI dependencies
export type KpiDeps = {
	repo: KpiRepoPort;
};

export function makeKpiDeps(db: AnyD1Database): KpiDeps {
	return {
		get repo() {
			return makeKpiRepo(db);
		} // Lazy evaluation to avoid hoisting issues
	};
}

// Complete dependencies (for routes that need everything)
export type AllDeps = CoreDeps & {
	authRepo: AuthRepoPort;
	token: TokenPort;
	alertsRepo: AlertsRepoPort;
	kpiRepo: KpiRepoPort;
	registrationRepo: RegistrationRepoPort;
	id: IdPort;
};

export function makeAllDeps(
	db: AnyD1Database,
	jwtSecret: string,
	clock: ClockPort
): AllDeps {
	return {
		...makeDeps(db, clock),
		get authRepo() {
			return createAuthRepo(db);
		},
		get token() {
			return createHonoJwtTokenPort(jwtSecret);
		},
		get alertsRepo() {
			return makeAlertsRepo(db);
		},
		get kpiRepo() {
			return makeKpiRepo(db);
		},
		get registrationRepo() {
			return makeRegistrationRepo(db);
		},
		get id() {
			return createCryptoIdPort();
		}
	};
}

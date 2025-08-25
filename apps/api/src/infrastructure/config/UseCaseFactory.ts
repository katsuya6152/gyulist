import {
	createAlertUseCase,
	getAlertsUseCase,
	searchAlertsUseCase,
	updateAlertMemoUseCase,
	updateAlertStatusUseCase
} from "../../application/use-cases/alerts";
import {
	completeRegistrationUseCase,
	getUserUseCase,
	loginUserUseCase,
	registerUserUseCase,
	updateUserThemeUseCase,
	verifyTokenUseCase
} from "../../application/use-cases/auth";
import {
	createCattleUseCase,
	deleteCattleUseCase,
	getCattleUseCase,
	getStatusCountsUseCase,
	searchCattleUseCase,
	updateCattleUseCase
} from "../../application/use-cases/cattle";
import {
	createEventUseCase,
	getEventUseCase,
	searchEventsUseCase
} from "../../application/use-cases/events";
import {
	calculateBreedingMetricsUseCase,
	getBreedingKpiDeltaUseCase,
	getBreedingKpiUseCase,
	getBreedingTrendsUseCase
} from "../../application/use-cases/kpi";
import type { AlertRepository } from "../../domain/ports/alerts";
import type { AuthRepository } from "../../domain/ports/auth";
import type { CattleRepository } from "../../domain/ports/cattle";
import type { EventRepository } from "../../domain/ports/events";
import type { KpiRepository } from "../../domain/ports/kpi";
import type { ClockPort } from "../../shared/ports/clock";
import type { TokenPort } from "../../shared/ports/token";

interface RepositoryDependencies {
	cattleRepo: CattleRepository;
	eventRepo: EventRepository;
	alertRepo: AlertRepository;
	kpiRepo: KpiRepository;
	authRepo: AuthRepository;
}

interface ServiceDependencies {
	clock: ClockPort;
	token: TokenPort;
}

export function createUseCases(
	repositories: RepositoryDependencies,
	services: ServiceDependencies
) {
	// パスワードハッシュ化・検証サービス
	const passwordHasher = {
		async hash(password: string): Promise<string> {
			const { hash } = await import("bcryptjs");
			return hash(password, 10);
		}
	};

	const passwordVerifier = {
		async verify(password: string, hash: string): Promise<boolean> {
			const { compare } = await import("bcryptjs");
			return compare(password, hash);
		}
	};

	const tokenGenerator = {
		generate(): string {
			return `token_${Math.random().toString(36).substring(2)}`;
		}
	};

	// Cattle ユースケース
	const createCattle = createCattleUseCase({
		cattleRepo: repositories.cattleRepo,
		clock: services.clock
	});

	const getCattle = getCattleUseCase({
		cattleRepo: repositories.cattleRepo
	});

	const getStatusCounts = getStatusCountsUseCase({
		cattleRepo: repositories.cattleRepo
	});

	const searchCattle = searchCattleUseCase({
		cattleRepo: repositories.cattleRepo
	});

	const updateCattle = updateCattleUseCase({
		cattleRepo: repositories.cattleRepo
	});

	const deleteCattle = deleteCattleUseCase({
		cattleRepo: repositories.cattleRepo
	});

	// Event ユースケース
	const createEvent = createEventUseCase({
		eventRepo: repositories.eventRepo,
		clock: services.clock
	});

	const getEvent = getEventUseCase({
		eventRepo: repositories.eventRepo
	});

	const searchEvents = searchEventsUseCase({
		eventRepo: repositories.eventRepo
	});

	// Alert ユースケース
	const getAlerts = getAlertsUseCase({
		alertRepo: repositories.alertRepo
	});

	const createAlert = createAlertUseCase({
		alertRepo: repositories.alertRepo,
		clock: services.clock
	});

	const updateAlertStatus = updateAlertStatusUseCase({
		alertRepo: repositories.alertRepo,
		clock: services.clock
	});

	const updateAlertMemo = updateAlertMemoUseCase({
		alertsRepo: repositories.alertRepo
	});

	const searchAlerts = searchAlertsUseCase({
		alertRepo: repositories.alertRepo
	});

	// KPI ユースケース
	const getBreedingKpi = getBreedingKpiUseCase({
		kpiRepo: repositories.kpiRepo
	});

	const getBreedingTrends = getBreedingTrendsUseCase({
		kpiRepo: repositories.kpiRepo
	});

	const calculateBreedingMetrics = calculateBreedingMetricsUseCase({
		kpiRepo: repositories.kpiRepo,
		clock: services.clock
	});

	const getBreedingKpiDelta = getBreedingKpiDeltaUseCase({
		kpiRepo: repositories.kpiRepo
	});

	// Auth ユースケース
	const loginUser = loginUserUseCase({
		authRepo: repositories.authRepo,
		passwordVerifier,
		tokenService: services.token,
		clock: services.clock
	});

	const registerUser = registerUserUseCase({
		authRepo: repositories.authRepo,
		tokenGenerator,
		clock: services.clock
	});

	const verifyToken = verifyTokenUseCase({
		authRepo: repositories.authRepo
	});

	const completeRegistration = completeRegistrationUseCase({
		authRepo: repositories.authRepo,
		passwordHasher,
		clock: services.clock
	});

	const updateUserTheme = updateUserThemeUseCase({
		authRepo: repositories.authRepo,
		clock: services.clock
	});

	const getUser = getUserUseCase({
		authRepo: repositories.authRepo
	});

	return {
		createCattleUseCase: createCattle,
		getCattleUseCase: getCattle,
		getStatusCountsUseCase: getStatusCounts,
		searchCattleUseCase: searchCattle,
		updateCattleUseCase: updateCattle,
		deleteCattleUseCase: deleteCattle,
		createEventUseCase: createEvent,
		getEventUseCase: getEvent,
		searchEventsUseCase: searchEvents,
		getAlertsUseCase: getAlerts,
		createAlertUseCase: createAlert,
		updateAlertStatusUseCase: updateAlertStatus,
		updateAlertMemoUseCase: updateAlertMemo,
		searchAlertsUseCase: searchAlerts,
		getBreedingKpiUseCase: getBreedingKpi,
		getBreedingKpiDeltaUseCase: getBreedingKpiDelta,
		getBreedingTrendsUseCase: getBreedingTrends,
		calculateBreedingMetricsUseCase: calculateBreedingMetrics,
		loginUserUseCase: loginUser,
		registerUserUseCase: registerUser,
		verifyTokenUseCase: verifyToken,
		completeRegistrationUseCase: completeRegistration,
		updateUserThemeUseCase: updateUserTheme,
		getUserUseCase: getUser
	};
}

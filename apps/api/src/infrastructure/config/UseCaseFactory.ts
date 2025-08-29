import type { AnyD1Database } from "drizzle-orm/d1";
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
	getCattleWithDetailsUseCase,
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
	getBreedingKpiUseCase
} from "../../application/use-cases/kpi";
import type { AlertRepository } from "../../domain/ports/alerts";
import type { AuthRepository } from "../../domain/ports/auth";
import type { CattleRepository } from "../../domain/ports/cattle";
import type { EventRepository } from "../../domain/ports/events";
import type { KpiRepository } from "../../domain/ports/kpi";
import type { RegistrationRepository } from "../../domain/ports/registration";
import type {
	ShipmentPlanRepository,
	ShipmentRepository
} from "../../domain/ports/shipments";
import type { ClockPort } from "../../shared/ports/clock";
import type { Env } from "../../shared/ports/d1Database";
import type { TokenPort } from "../../shared/ports/token";

interface RepositoryDependencies {
	cattleRepo: CattleRepository;
	eventRepo: EventRepository;
	alertRepo: AlertRepository;
	kpiRepo: KpiRepository;
	authRepo: AuthRepository;
	registrationRepo: RegistrationRepository;
	shipmentRepo: ShipmentRepository;
	shipmentPlanRepo: ShipmentPlanRepository;
}

interface ServiceDependencies {
	clock: ClockPort;
	token: TokenPort;
}

interface UseCaseDependencies {
	createCattleUseCase: ReturnType<typeof createCattleUseCase>;
	getCattleUseCase: ReturnType<typeof getCattleUseCase>;
	getCattleWithDetailsUseCase: ReturnType<typeof getCattleWithDetailsUseCase>;
	getStatusCountsUseCase: ReturnType<typeof getStatusCountsUseCase>;
	searchCattleUseCase: ReturnType<typeof searchCattleUseCase>;
	updateCattleUseCase: ReturnType<typeof updateCattleUseCase>;
	deleteCattleUseCase: ReturnType<typeof deleteCattleUseCase>;
	createEventUseCase: ReturnType<typeof createEventUseCase>;
	getEventUseCase: ReturnType<typeof getEventUseCase>;
	searchEventsUseCase: ReturnType<typeof searchEventsUseCase>;
	getAlertsUseCase: ReturnType<typeof getAlertsUseCase>;
	createAlertUseCase: ReturnType<typeof createAlertUseCase>;
	updateAlertStatusUseCase: ReturnType<typeof updateAlertStatusUseCase>;
	updateAlertMemoUseCase: ReturnType<typeof updateAlertMemoUseCase>;
	searchAlertsUseCase: ReturnType<typeof searchAlertsUseCase>;
	getBreedingKpiUseCase: ReturnType<typeof getBreedingKpiUseCase>;
	calculateBreedingMetricsUseCase: ReturnType<
		typeof calculateBreedingMetricsUseCase
	>;
	loginUserUseCase: ReturnType<typeof loginUserUseCase>;
	registerUserUseCase: ReturnType<typeof registerUserUseCase>;
	verifyTokenUseCase: ReturnType<typeof verifyTokenUseCase>;
	completeRegistrationUseCase: ReturnType<typeof completeRegistrationUseCase>;
	updateUserThemeUseCase: ReturnType<typeof updateUserThemeUseCase>;
	getUserUseCase: ReturnType<typeof getUserUseCase>;
}

interface UseCaseFactoryResult {
	repositories: RepositoryDependencies;
	useCases: UseCaseDependencies;
}

export function makeUseCases(
	repositories: RepositoryDependencies,
	services: ServiceDependencies,
	env?: Partial<Env>
): UseCaseFactoryResult {
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

	const getCattleWithDetails = getCattleWithDetailsUseCase({
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

	const calculateBreedingMetrics = calculateBreedingMetricsUseCase({
		kpiRepo: repositories.kpiRepo,
		clock: services.clock
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
		clock: services.clock,
		mailService: {
			async sendVerificationEmail(email: string, token: string) {
				try {
					// 渡された環境変数またはデフォルト値を使用
					const envConfig = {
						DB: repositories.authRepo as unknown as AnyD1Database,
						ENVIRONMENT: env?.ENVIRONMENT || "development",
						APP_URL: env?.APP_URL || "http://localhost:3000",
						JWT_SECRET: env?.JWT_SECRET || "dummy-secret",
						GOOGLE_CLIENT_ID: env?.GOOGLE_CLIENT_ID || "dummy-id",
						GOOGLE_CLIENT_SECRET: env?.GOOGLE_CLIENT_SECRET || "dummy-secret",
						RESEND_API_KEY: env?.RESEND_API_KEY || "dummy-key",
						MAIL_FROM: env?.MAIL_FROM || "noreply@gyulist.com",
						TURNSTILE_SECRET_KEY: env?.TURNSTILE_SECRET_KEY || "dummy-key",
						ADMIN_USER: env?.ADMIN_USER || "admin",
						ADMIN_PASS: env?.ADMIN_PASS || "admin",
						WEB_ORIGIN: env?.WEB_ORIGIN || "http://localhost:3000"
					};

					// 開発環境ではコンソールログのみ
					if (envConfig.ENVIRONMENT !== "production") {
						console.log(
							`【開発モード】メール送信: ${email} - トークン: ${token}`
						);
						return { ok: true, value: "sent" };
					}

					// 本番環境では実際のメール送信
					const { sendVerificationEmail } = await import("../../lib/mailer");
					await sendVerificationEmail(envConfig, email, token);
					return { ok: true, value: "sent" };
				} catch (error) {
					return {
						ok: false,
						error: {
							type: "InfraError",
							message: "メール送信に失敗しました",
							cause: error
						}
					};
				}
			}
		},
		env: {
			ENVIRONMENT: env?.ENVIRONMENT || "development",
			APP_URL: env?.APP_URL || "http://localhost:3000",
			RESEND_API_KEY: env?.RESEND_API_KEY || "dummy-key",
			MAIL_FROM: env?.MAIL_FROM || "noreply@gyulist.com"
		}
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
		repositories: {
			cattleRepo: repositories.cattleRepo,
			eventRepo: repositories.eventRepo,
			alertRepo: repositories.alertRepo,
			kpiRepo: repositories.kpiRepo,
			authRepo: repositories.authRepo,
			registrationRepo: repositories.registrationRepo,
			shipmentRepo: repositories.shipmentRepo,
			shipmentPlanRepo: repositories.shipmentPlanRepo
		},
		useCases: {
			createCattleUseCase: createCattle,
			getCattleUseCase: getCattle,
			getCattleWithDetailsUseCase: getCattleWithDetails,
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
			calculateBreedingMetricsUseCase: calculateBreedingMetrics,
			loginUserUseCase: loginUser,
			registerUserUseCase: registerUser,
			verifyTokenUseCase: verifyToken,
			completeRegistrationUseCase: completeRegistration,
			updateUserThemeUseCase: updateUserTheme,
			getUserUseCase: getUser
		}
	};
}

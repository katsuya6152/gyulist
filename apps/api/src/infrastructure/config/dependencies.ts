/**
 * Dependency Injection Configuration
 *
 * アプリケーションの依存関係を設定・注入する
 */

import type { AnyD1Database } from "drizzle-orm/d1";
import type {
	ExportRegistrationsCsvUseCase,
	ListRegistrationsUseCase
} from "../../application/use-cases/admin";
import {
	exportRegistrationsCsvUseCase,
	listRegistrationsUseCase
} from "../../application/use-cases/admin";
import type {
	CreateAlertUseCase,
	GetAlertsUseCase,
	SearchAlertsUseCase,
	UpdateAlertStatusUseCase
} from "../../application/use-cases/alerts";
import {
	createAlertUseCase,
	getAlertsUseCase,
	searchAlertsUseCase,
	updateAlertMemoUseCase,
	updateAlertStatusUseCase
} from "../../application/use-cases/alerts";
import type {
	CompleteRegistrationUseCase,
	GetUserUseCase,
	LoginUserUseCase,
	RegisterUserUseCase,
	UpdateUserThemeUseCase,
	VerifyTokenUseCase
} from "../../application/use-cases/auth";
import {
	completeRegistrationUseCase,
	getUserUseCase,
	loginUserUseCase,
	registerUserUseCase,
	updateUserThemeUseCase,
	verifyTokenUseCase
} from "../../application/use-cases/auth";
import type {
	CreateCattleUseCase,
	DeleteCattleUseCase,
	GetCattleUseCase,
	GetStatusCountsUseCase,
	SearchCattleUseCase,
	UpdateCattleUseCase
} from "../../application/use-cases/cattle";
import {
	createCattleUseCase,
	deleteCattleUseCase,
	getCattleUseCase,
	getStatusCountsUseCase,
	searchCattleUseCase,
	updateCattleUseCase
} from "../../application/use-cases/cattle";
import { getCattleWithDetailsUseCase } from "../../application/use-cases/cattle";
import type {
	CreateEventUseCase,
	GetEventUseCase,
	SearchEventsUseCase
} from "../../application/use-cases/events";
import {
	createEventUseCase,
	getEventUseCase,
	searchEventsUseCase
} from "../../application/use-cases/events";
import type {
	CalculateBreedingMetricsUseCase,
	GetBreedingKpiUseCase
} from "../../application/use-cases/kpi";
import {
	calculateBreedingMetricsUseCase,
	getBreedingKpiUseCase
} from "../../application/use-cases/kpi";
import type { PreRegisterUserUseCase } from "../../application/use-cases/registration/preRegisterUser";
import { preRegisterUserUseCase } from "../../application/use-cases/registration/preRegisterUser";
import type {
	CreateShipmentPlanUseCase,
	CreateShipmentUseCase,
	DeleteShipmentUseCase,
	GetMotherShipmentsListUseCase,
	GetShipmentPlansUseCase,
	GetShipmentsUseCase,
	UpdateShipmentUseCase
} from "../../application/use-cases/shipments";
import {
	createShipmentPlanUseCase,
	createShipmentUseCase,
	deleteShipmentUseCase,
	getMotherShipmentsListUseCase,
	getShipmentPlansUseCase,
	getShipmentsUseCase,
	updateShipmentUseCase
} from "../../application/use-cases/shipments";
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
import type { TokenPort } from "../../shared/ports/token";
import { D1DatabaseFactory } from "../database/D1DatabaseFactory";
import { AlertRepositoryImpl } from "../database/repositories/AlertRepositoryImpl";
import { AuthRepositoryImpl } from "../database/repositories/AuthRepositoryImpl";
import { CattleRepositoryImpl } from "../database/repositories/CattleRepositoryImpl";
import { EventRepositoryImpl } from "../database/repositories/EventRepositoryImpl";
import { KpiRepositoryImpl } from "../database/repositories/KpiRepositoryImpl";
import { RegistrationRepositoryImpl } from "../database/repositories/RegistrationRepositoryImpl";
import {
	ShipmentPlanRepositoryImpl,
	ShipmentRepositoryImpl
} from "../database/repositories/ShipmentRepositoryImpl";

/**
 * 環境設定の型定義
 */
export type Environment = {
	DATABASE_URL?: string;
	// 他の環境変数も必要に応じて追加
};

/**
 * アプリケーション全体の依存関係
 */
export type Dependencies = {
	// リポジトリ
	repositories: {
		cattleRepo: CattleRepository;
		eventRepo: EventRepository;
		alertRepo: AlertRepository;
		kpiRepo: KpiRepository;
		authRepo: AuthRepository;
		registrationRepo: RegistrationRepository;
		shipmentRepo: ShipmentRepository;
		shipmentPlanRepo: ShipmentPlanRepository;
	};

	// ユースケース（依存関係が注入された状態）
	useCases: {
		createCattleUseCase: (
			input: Parameters<ReturnType<CreateCattleUseCase>>[0]
		) => ReturnType<ReturnType<CreateCattleUseCase>>;
		getCattleUseCase: (
			input: Parameters<ReturnType<GetCattleUseCase>>[0]
		) => ReturnType<ReturnType<GetCattleUseCase>>;
		getCattleWithDetailsUseCase: (
			input: Parameters<ReturnType<typeof getCattleWithDetailsUseCase>>[0]
		) => ReturnType<ReturnType<typeof getCattleWithDetailsUseCase>>;
		getStatusCountsUseCase: (
			input: Parameters<ReturnType<GetStatusCountsUseCase>>[0]
		) => ReturnType<ReturnType<GetStatusCountsUseCase>>;
		searchCattleUseCase: (
			input: Parameters<ReturnType<SearchCattleUseCase>>[0]
		) => ReturnType<ReturnType<SearchCattleUseCase>>;
		updateCattleUseCase: (
			input: Parameters<ReturnType<UpdateCattleUseCase>>[0]
		) => ReturnType<ReturnType<UpdateCattleUseCase>>;
		deleteCattleUseCase: (
			input: Parameters<ReturnType<DeleteCattleUseCase>>[0]
		) => ReturnType<ReturnType<DeleteCattleUseCase>>;
		createEventUseCase: (
			input: Parameters<ReturnType<CreateEventUseCase>>[0]
		) => ReturnType<ReturnType<CreateEventUseCase>>;
		getEventUseCase: (
			input: Parameters<ReturnType<GetEventUseCase>>[0]
		) => ReturnType<ReturnType<GetEventUseCase>>;
		searchEventsUseCase: (
			input: Parameters<ReturnType<SearchEventsUseCase>>[0]
		) => ReturnType<ReturnType<SearchEventsUseCase>>;
		getAlertsUseCase: (
			input: Parameters<ReturnType<GetAlertsUseCase>>[0]
		) => ReturnType<ReturnType<GetAlertsUseCase>>;
		createAlertUseCase: (
			input: Parameters<ReturnType<CreateAlertUseCase>>[0]
		) => ReturnType<ReturnType<CreateAlertUseCase>>;
		updateAlertStatusUseCase: (
			input: Parameters<ReturnType<UpdateAlertStatusUseCase>>[0]
		) => ReturnType<ReturnType<UpdateAlertStatusUseCase>>;
		updateAlertMemoUseCase: (
			input: Parameters<ReturnType<typeof updateAlertMemoUseCase>>[0]
		) => ReturnType<ReturnType<typeof updateAlertMemoUseCase>>;
		searchAlertsUseCase: (
			input: Parameters<ReturnType<SearchAlertsUseCase>>[0]
		) => ReturnType<ReturnType<SearchAlertsUseCase>>;
		getBreedingKpiUseCase: (
			input: Parameters<ReturnType<GetBreedingKpiUseCase>>[0]
		) => ReturnType<ReturnType<GetBreedingKpiUseCase>>;

		calculateBreedingMetricsUseCase: (
			input: Parameters<ReturnType<CalculateBreedingMetricsUseCase>>[0]
		) => ReturnType<ReturnType<CalculateBreedingMetricsUseCase>>;
		loginUserUseCase: (
			input: Parameters<ReturnType<LoginUserUseCase>>[0]
		) => ReturnType<ReturnType<LoginUserUseCase>>;
		registerUserUseCase: (
			input: Parameters<ReturnType<RegisterUserUseCase>>[0]
		) => ReturnType<ReturnType<RegisterUserUseCase>>;
		verifyTokenUseCase: (
			input: Parameters<ReturnType<VerifyTokenUseCase>>[0]
		) => ReturnType<ReturnType<VerifyTokenUseCase>>;
		completeRegistrationUseCase: (
			input: Parameters<ReturnType<CompleteRegistrationUseCase>>[0]
		) => ReturnType<ReturnType<CompleteRegistrationUseCase>>;
		updateUserThemeUseCase: (
			input: Parameters<ReturnType<UpdateUserThemeUseCase>>[0]
		) => ReturnType<ReturnType<UpdateUserThemeUseCase>>;
		getUserUseCase: (
			input: Parameters<ReturnType<GetUserUseCase>>[0]
		) => ReturnType<ReturnType<GetUserUseCase>>;
		preRegisterUserUseCase: (
			input: Parameters<ReturnType<PreRegisterUserUseCase>>[0]
		) => ReturnType<ReturnType<PreRegisterUserUseCase>>;
		// Shipment use cases
		createShipmentUseCase: (
			input: Parameters<ReturnType<CreateShipmentUseCase>>[0]
		) => ReturnType<ReturnType<CreateShipmentUseCase>>;
		updateShipmentUseCase: (
			input: Parameters<ReturnType<UpdateShipmentUseCase>>[0]
		) => ReturnType<ReturnType<UpdateShipmentUseCase>>;
		deleteShipmentUseCase: (
			input: Parameters<ReturnType<DeleteShipmentUseCase>>[0]
		) => ReturnType<ReturnType<DeleteShipmentUseCase>>;
		getShipmentsUseCase: (
			input: Parameters<ReturnType<GetShipmentsUseCase>>[0]
		) => ReturnType<ReturnType<GetShipmentsUseCase>>;
		createShipmentPlanUseCase: (
			input: Parameters<ReturnType<CreateShipmentPlanUseCase>>[0]
		) => ReturnType<ReturnType<CreateShipmentPlanUseCase>>;
		getMotherShipmentsListUseCase: (
			input: Parameters<ReturnType<GetMotherShipmentsListUseCase>>[0]
		) => ReturnType<ReturnType<GetMotherShipmentsListUseCase>>;
		getShipmentPlansUseCase: (
			input: Parameters<ReturnType<GetShipmentPlansUseCase>>[0]
		) => ReturnType<ReturnType<GetShipmentPlansUseCase>>;
	};

	// 管理APIユースケース
	adminUseCases: {
		listRegistrationsUseCase: (
			input: Parameters<ReturnType<ListRegistrationsUseCase>>[0]
		) => ReturnType<ReturnType<ListRegistrationsUseCase>>;
		exportRegistrationsCsvUseCase: (
			input: Parameters<ReturnType<ExportRegistrationsCsvUseCase>>[0]
		) => ReturnType<ReturnType<ExportRegistrationsCsvUseCase>>;
	};

	// サービス
	services: {
		clock: ClockPort;
	};
};

/**
 * 依存関係を作成・設定する
 *
 * @param db - データベース接続
 * @param clock - クロックサービス
 * @returns 設定された依存関係
 */
export function makeDependencies(
	db: AnyD1Database,
	clock: ClockPort
): Dependencies {
	// D1DatabasePortの作成
	const d1DatabasePort = D1DatabaseFactory.create(db);

	// リポジトリの作成
	const cattleRepo = new CattleRepositoryImpl(d1DatabasePort);
	const eventRepo = new EventRepositoryImpl(d1DatabasePort);
	const alertRepo = new AlertRepositoryImpl(d1DatabasePort);
	const kpiRepo = new KpiRepositoryImpl(d1DatabasePort);
	const authRepo = new AuthRepositoryImpl(d1DatabasePort);
	const registrationRepo = new RegistrationRepositoryImpl(db); // 直接AnyD1Databaseを渡す
	const shipmentRepo = new ShipmentRepositoryImpl(d1DatabasePort);
	const shipmentPlanRepo = new ShipmentPlanRepositoryImpl(d1DatabasePort);

	// ユースケースの作成（依存関係を注入）
	const createCattle = createCattleUseCase({
		cattleRepo,
		clock
	});

	const getCattle = getCattleUseCase({
		cattleRepo
	});

	const getCattleWithDetails = getCattleWithDetailsUseCase({
		cattleRepo
	});

	const getStatusCounts = getStatusCountsUseCase({
		cattleRepo
	});

	const searchCattle = searchCattleUseCase({
		cattleRepo
	});

	const updateCattle = updateCattleUseCase({
		cattleRepo
	});

	const deleteCattle = deleteCattleUseCase({
		cattleRepo
	});

	const createEvent = createEventUseCase({
		eventRepo,
		clock
	});

	const getEvent = getEventUseCase({
		eventRepo
	});

	const searchEvents = searchEventsUseCase({
		eventRepo
	});

	const getAlerts = getAlertsUseCase({
		alertRepo
	});

	const createAlert = createAlertUseCase({
		alertRepo,
		clock
	});

	const updateAlertStatus = updateAlertStatusUseCase({
		alertRepo,
		clock
	});

	const updateAlertMemo = updateAlertMemoUseCase({
		alertsRepo: alertRepo
	});

	const searchAlerts = searchAlertsUseCase({
		alertRepo
	});

	const getBreedingKpi = getBreedingKpiUseCase({
		kpiRepo
	});

	const calculateBreedingMetrics = calculateBreedingMetricsUseCase({
		kpiRepo,
		clock
	});

	const getUser = getUserUseCase({
		authRepo
	});

	// 事前登録ユースケースの作成
	const preRegisterUser = preRegisterUserUseCase({
		registrationRepo,
		turnstileService: {
			verify: async () => ({ ok: true, value: true })
		},
		emailService: {
			sendVerificationEmail: async () => ({ ok: true, value: "sent" }),
			sendCompletionEmail: async () => ({ ok: true, value: "sent" }),
			sendReminderEmail: async () => ({ ok: true, value: "sent" })
		},
		idGenerator: {
			uuid: () => `uuid-${Math.random().toString(36).substring(2)}`,
			next: () => 1
		},
		clock
	});

	// 管理APIユースケースの作成
	const listRegistrations = listRegistrationsUseCase({
		registrationRepo
	});

	const exportRegistrationsCsv = exportRegistrationsCsvUseCase({
		registrationRepo
	});

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
			// 実際の実装では crypto.randomUUID() 等を使用
			return `token_${Math.random().toString(36).substring(2)}`;
		}
	};

	// トークンサービス
	const tokenService: TokenPort = {
		async sign(
			payload: { userId: number; exp: number } & Record<string, unknown>
		): Promise<string> {
			const { sign } = await import("hono/jwt");
			return sign(payload, "secret"); // 実際の環境では環境変数から取得
		},
		async verify(
			token: string
		): Promise<
			({ userId: number; exp: number } & Record<string, unknown>) | null
		> {
			try {
				const { verify } = await import("hono/jwt");
				return (await verify(token, "secret")) as {
					userId: number;
					exp: number;
				} & Record<string, unknown>;
			} catch {
				return null;
			}
		}
	};

	// Authユースケースの作成
	const loginUser = loginUserUseCase({
		authRepo,
		passwordVerifier,
		tokenService,
		clock
	});

	const registerUser = registerUserUseCase({
		authRepo,
		tokenGenerator,
		clock
	});

	const verifyToken = verifyTokenUseCase({
		authRepo
	});

	const completeRegistration = completeRegistrationUseCase({
		authRepo,
		passwordHasher,
		clock
	});

	const updateUserTheme = updateUserThemeUseCase({
		authRepo,
		clock
	});

	// Shipment use cases
	const createShipment = createShipmentUseCase({
		shipmentRepo,
		clock
	});

	const updateShipment = updateShipmentUseCase({
		shipmentRepo,
		cattleRepo
	});

	const deleteShipment = deleteShipmentUseCase({
		shipmentRepo,
		cattleRepo
	});

	const getShipments = getShipmentsUseCase({
		shipmentRepo
	});

	const createShipmentPlan = createShipmentPlanUseCase({
		shipmentPlanRepo,
		clock
	});

	const getMotherShipmentsList = getMotherShipmentsListUseCase({
		shipmentRepo
	});

	const getShipmentPlans = getShipmentPlansUseCase({
		shipmentPlanRepo
	});

	return {
		repositories: {
			cattleRepo,
			eventRepo,
			alertRepo,
			kpiRepo,
			authRepo,
			registrationRepo,
			shipmentRepo,
			shipmentPlanRepo
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
			getUserUseCase: getUser,
			preRegisterUserUseCase: preRegisterUser,
			// Shipment use cases
			createShipmentUseCase: createShipment,
			updateShipmentUseCase: updateShipment,
			deleteShipmentUseCase: deleteShipment,
			getShipmentsUseCase: getShipments,
			createShipmentPlanUseCase: createShipmentPlan,
			getMotherShipmentsListUseCase: getMotherShipmentsList,
			getShipmentPlansUseCase: getShipmentPlans
		},
		adminUseCases: {
			listRegistrationsUseCase: listRegistrations,
			exportRegistrationsCsvUseCase: exportRegistrationsCsv
		},
		services: {
			clock
		}
	};
}

/**
 * 既存の makeDeps との互換性を保つためのアダプター
 *
 * @deprecated 新しいアーキテクチャでは makeDependencies を使用してください
 */
export function makeDeps(db: AnyD1Database, clock: ClockPort) {
	return makeDependencies(db, clock);
}

/**
 * 簡易的な依存関係作成関数（コントローラー用）
 */
export function createDependencies(db: AnyD1Database): Dependencies {
	const clock: ClockPort = {
		now: () => new Date()
	};

	return makeDependencies(db, clock);
}

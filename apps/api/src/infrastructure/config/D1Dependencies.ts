import type { D1DatabasePort } from "../../shared/ports/d1Database";
import { RepositoryFactory } from "../database/RepositoryFactory";
import { createClockService } from "../services/ClockService";
import { createTokenService } from "../services/TokenService";
import { createUseCases } from "./UseCaseFactory";

export interface D1Dependencies {
	database: D1DatabasePort;
	repositories: {
		cattleRepo: ReturnType<typeof RepositoryFactory.createCattleRepository>;
		eventRepo: ReturnType<typeof RepositoryFactory.createEventRepository>;
		alertRepo: ReturnType<typeof RepositoryFactory.createAlertRepository>;
		kpiRepo: ReturnType<typeof RepositoryFactory.createKpiRepository>;
		authRepo: ReturnType<typeof RepositoryFactory.createAuthRepository>;
	};
	useCases: ReturnType<typeof createUseCases>;
	services: {
		clock: ReturnType<typeof createClockService>;
		token: ReturnType<typeof createTokenService>;
	};
}

export function createD1Dependencies(
	db: D1DatabasePort,
	env: string
): D1Dependencies {
	// リポジトリの作成
	const repositories = {
		cattleRepo: RepositoryFactory.createCattleRepository(db),
		eventRepo: RepositoryFactory.createEventRepository(db),
		alertRepo: RepositoryFactory.createAlertRepository(db),
		kpiRepo: RepositoryFactory.createKpiRepository(db),
		authRepo: RepositoryFactory.createAuthRepository(db)
	};

	// サービスの作成
	const services = {
		clock: createClockService(),
		token: createTokenService(env)
	};

	// ユースケースの作成
	const useCases = createUseCases(repositories, services);

	return {
		database: db,
		repositories,
		useCases,
		services
	};
}

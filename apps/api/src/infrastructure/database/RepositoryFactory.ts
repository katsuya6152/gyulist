import type { AlertRepository } from "../../domain/ports/alerts";
import type { AuthRepository } from "../../domain/ports/auth";
import type { CattleRepository } from "../../domain/ports/cattle";
import type { EventRepository } from "../../domain/ports/events";
import type { KpiRepository } from "../../domain/ports/kpi";
import type { D1DatabasePort } from "../../shared/ports/d1Database";
import { AlertRepositoryImpl } from "./repositories/AlertRepositoryImpl";
import { AuthRepositoryImpl } from "./repositories/AuthRepositoryImpl";
import { CattleRepositoryImpl } from "./repositories/CattleRepositoryImpl";
import { EventRepositoryImpl } from "./repositories/EventRepositoryImpl";
import { KpiRepositoryImpl } from "./repositories/KpiRepositoryImpl";

export const RepositoryFactory = {
	createCattleRepository(db: D1DatabasePort): CattleRepository {
		return new CattleRepositoryImpl(db);
	},

	createEventRepository(db: D1DatabasePort): EventRepository {
		return new EventRepositoryImpl(db);
	},

	createAlertRepository(db: D1DatabasePort): AlertRepository {
		return new AlertRepositoryImpl(db);
	},

	createKpiRepository(db: D1DatabasePort): KpiRepository {
		return new KpiRepositoryImpl(db);
	},

	createAuthRepository(db: D1DatabasePort): AuthRepository {
		return new AuthRepositoryImpl(db);
	}
};

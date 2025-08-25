/**
 * Cattle Use Cases
 *
 * 牛管理ドメインのユースケース群を集約
 */

// Cattle use cases
export { createCattleUseCase } from "./createCattle";
export { deleteCattleUseCase } from "./deleteCattle";
export { getCattleUseCase } from "./getCattle";
export { getStatusCountsUseCase } from "./getStatusCounts";
export { searchCattleUseCase } from "./searchCattle";
export { updateCattleUseCase } from "./updateCattle";

// Types
export type {
	SearchCattleUseCase,
	SearchCattleInput,
	SearchCattleResult
} from "./searchCattle";
export type {
	UpdateCattleUseCase,
	UpdateCattleInput,
	UpdateCattleResult
} from "./updateCattle";
export type {
	DeleteCattleUseCase,
	DeleteCattleInput,
	DeleteCattleResult
} from "./deleteCattle";

// Types
export type {
	CreateCattleUseCase,
	CreateCattleDeps,
	CreateCattleInput
} from "./createCattle";
export type {
	GetCattleUseCase,
	GetCattleDeps,
	GetCattleInput
} from "./getCattle";
export type {
	GetStatusCountsUseCase,
	GetStatusCountsDeps,
	GetStatusCountsInput,
	StatusCounts
} from "./getStatusCounts";

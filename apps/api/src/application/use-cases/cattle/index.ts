/**
 * Cattle Use Cases
 *
 * 牛管理ドメインのユースケース群を集約
 */

// Use case functions
export { createCattleUseCase } from "./createCattle";
export { getCattleUseCase } from "./getCattle";
export { searchCattleUseCase } from "./searchCattle";
export { updateCattleUseCase } from "./updateCattle";
export { deleteCattleUseCase } from "./deleteCattle";

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

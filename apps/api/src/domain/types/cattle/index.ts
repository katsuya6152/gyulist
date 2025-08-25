/**
 * Cattle Domain Types
 *
 * 牛管理ドメインの型定義を集約するインデックスファイル
 */

// Core entity types
export type {
	Cattle,
	NewCattleProps,
	UpdateCattleProps,
	CattleSearchCriteria
} from "./Cattle";

// Value object types
export type {
	Gender,
	GrowthStage,
	Status,
	CattleName,
	IdentificationNumber,
	EarTagNumber,
	Breed,
	ProducerName,
	Barn,
	BreedingValue,
	Notes,
	Weight,
	Score
} from "./CattleTypes";

// Constants (not exported to avoid Cloudflare Workers type conflicts)
// Available in CattleTypes.ts: GENDERS, GROWTH_STAGES, STATUSES

// Schemas
export {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema,
	cattleResponseSchema,
	cattleListResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "./schemas";

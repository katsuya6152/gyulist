/**
 * Type Exports for Web Application
 *
 * Webアプリケーションが必要とする型定義を集約してエクスポートするファイル
 * このファイルは型定義のみを含み、実装は含みません
 */

// Domain types
export type {
	Cattle,
	NewCattleProps,
	UpdateCattleProps,
	CattleSearchCriteria
} from "./domain/types/cattle";

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
} from "./domain/types/cattle/CattleTypes";

// Schema types
export type {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema,
	cattleResponseSchema,
	cattleListResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "./domain/types/cattle/schemas";

// Use case types
export type {
	CreateCattleUseCase,
	CreateCattleDeps,
	CreateCattleInput
} from "./application/use-cases/cattle/createCattle";

export type {
	UpdateCattleUseCase,
	UpdateCattleDeps,
	UpdateCattleInput,
	UpdateCattleResult
} from "./application/use-cases/cattle/updateCattle";

export type {
	DeleteCattleUseCase,
	DeleteCattleInput,
	DeleteCattleResult
} from "./application/use-cases/cattle/deleteCattle";

export type {
	GetCattleUseCase,
	GetCattleDeps,
	GetCattleInput
} from "./application/use-cases/cattle/getCattle";

export type {
	SearchCattleUseCase,
	SearchCattleInput,
	SearchCattleResult
} from "./application/use-cases/cattle/searchCattle";

export type {
	GetCattleWithDetailsUseCase,
	GetCattleWithDetailsInput,
	CattleWithDetails
} from "./application/use-cases/cattle/getCattleWithDetails";

// Event types
export type {
	Event,
	NewEventProps,
	UpdateEventProps,
	EventSearchCriteria,
	EventSearchResult
} from "./domain/types/events";

// Event response types
export type EventsSearchResponse = {
	results: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		createdAt: string;
		updatedAt: string;
		cattleName: string | null;
		cattleEarTagNumber: number | null;
	}>;
	nextCursor: number | null;
	hasNext: boolean;
};

export type {
	EventType,
	EventPriority,
	EventGroup
} from "./domain/types/events/EventTypes";

// Alert types
export type {
	Alert,
	NewAlertProps,
	UpdateAlertProps,
	AlertSearchCriteria
} from "./domain/types/alerts";

export type {
	AlertSeverity,
	AlertStatus,
	AlertType
} from "./domain/types/alerts/AlertTypes";

// KPI types - 必要に応じて追加

// Auth types
export type {
	User,
	NewUserProps,
	UpdateUserProps
} from "./domain/types/auth";

// Registration types
export type {
	Registration,
	NewRegistrationProps,
	UpdateRegistrationProps
} from "./domain/types/registration";

// Shared types
export type {
	UserId,
	CattleId,
	EventId,
	AlertId
} from "./shared/brand";

export type { Result } from "./shared/result";

// Environment types
export type { Env } from "./shared/ports/d1Database";

// Pre-register response types
export type PreRegisterSuccess = {
	ok: true;
	alreadyRegistered?: boolean;
};

export type PreRegisterError = {
	ok: false;
	code: string;
	fieldErrors?: Record<string, string>;
};

export type PreRegisterResponse = PreRegisterSuccess | PreRegisterError;

// Theme response types
export type UpdateThemeResponse = {
	success: boolean;
	data?: {
		user: {
			id: number;
			email: string;
			userName: string;
			theme: string;
			createdAt: string;
			updatedAt: string;
		};
	};
};

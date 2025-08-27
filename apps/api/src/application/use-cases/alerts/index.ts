/**
 * Alerts Use Cases
 *
 * アラート管理ドメインのユースケース群を集約
 */

// Use case functions
export { getAlertsUseCase } from "./getAlerts";
export { createAlertUseCase } from "./createAlert";
export { updateAlertStatusUseCase } from "./updateAlertStatus";
export { updateAlertMemoUseCase } from "./updateAlertMemo";
export { searchAlertsUseCase } from "./searchAlerts";

// Types
export type {
	GetAlertsUseCase,
	GetAlertsDeps,
	GetAlertsInput,
	GetAlertsResult
} from "./getAlerts";
export type {
	CreateAlertUseCase,
	CreateAlertDeps,
	CreateAlertInput
} from "./createAlert";
export type {
	UpdateAlertStatusUseCase,
	UpdateAlertStatusDeps,
	UpdateAlertStatusInput
} from "./updateAlertStatus";
export type {
	UpdateAlertMemoInput,
	UpdateAlertMemoResult
} from "./updateAlertMemo";
export type {
	SearchAlertsUseCase,
	SearchAlertsDeps,
	SearchAlertsInput
} from "./searchAlerts";

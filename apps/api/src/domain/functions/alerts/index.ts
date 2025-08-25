/**
 * Alerts Domain Functions
 *
 * アラート管理ドメインの関数群を集約するインデックスファイル
 */

// Factory functions
export {
	createAlert,
	updateAlert,
	updateAlertStatus,
	updateAlertSeverity,
	createAlertType,
	createAlertSeverity,
	createAlertStatus,
	AlertRules
} from "./alertFactory";

// Validation functions
export {
	validateNewAlertProps,
	validateUpdateAlertProps,
	validateDueAt,
	validateStatusTransition,
	normalizeString
} from "./alertValidation";

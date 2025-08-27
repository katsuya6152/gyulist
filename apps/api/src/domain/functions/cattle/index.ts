/**
 * 牛管理ドメイン関数のエクスポート
 */

// Factory functions
export { createCattle, updateCattle } from "./cattleFactory";

// Validation functions
export {
	validateAndTransformString,
	validateIdentificationNumber,
	validateBirthday,
	validateWeight,
	validateScore,
	validateNewCattleProps
} from "./cattleValidation";

// Utility functions
export { calculateAgeFromBirthday } from "./calculateAge";

/**
 * Registration Domain Functions
 *
 * 事前登録ドメインの関数群を集約
 */

// Registration factory functions
export {
	createRegistration,
	updateRegistration,
	updateRegistrationStatus,
	updateReferralSource,
	createRegistrationStatusValue,
	createLocaleValue,
	canChangeStatus,
	isRegistrationEditable,
	isRegistrationActive,
	RegistrationRules
} from "./registrationFactory";

// Email log factory functions
export {
	createEmailLog,
	updateEmailLog,
	createEmailTypeValue,
	createHttpStatusValue,
	isEmailSentSuccessfully,
	isEmailRetryable,
	getMaxRetries,
	getEmailCategory,
	EmailLogRules
} from "./emailLogFactory";

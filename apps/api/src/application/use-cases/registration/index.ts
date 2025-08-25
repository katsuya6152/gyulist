/**
 * Registration Use Cases
 *
 * 事前登録ドメインのユースケース群を集約
 */

// Use case functions
export { preRegisterUserUseCase } from "./preRegisterUser";
export { listRegistrationsUseCase } from "./listRegistrations";
export { updateRegistrationStatusUseCase } from "./updateRegistrationStatus";

// Use case types
export type {
	PreRegisterUserInput,
	PreRegisterUserResult,
	PreRegisterUserDeps,
	PreRegisterUserUseCase
} from "./preRegisterUser";
export type {
	ListRegistrationsInput,
	ListRegistrationsResult,
	ListRegistrationsDeps,
	ListRegistrationsUseCase
} from "./listRegistrations";
export type {
	UpdateRegistrationStatusInput,
	UpdateRegistrationStatusResult,
	UpdateRegistrationStatusDeps,
	UpdateRegistrationStatusUseCase
} from "./updateRegistrationStatus";

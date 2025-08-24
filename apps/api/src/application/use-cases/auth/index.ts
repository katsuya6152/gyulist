/**
 * Auth Use Cases
 *
 * 認証・ユーザー管理ドメインのユースケース群を集約
 */

// Use case functions
export { loginUserUseCase } from "./loginUser";
export { registerUserUseCase } from "./registerUser";
export { verifyTokenUseCase } from "./verifyToken";
export { completeRegistrationUseCase } from "./completeRegistration";
export { updateUserThemeUseCase } from "./updateUserTheme";

// Use case types
export type {
	LoginUserInput,
	LoginUserResult,
	LoginUserDeps,
	LoginUserUseCase
} from "./loginUser";
export type {
	RegisterUserInput,
	RegisterUserResult,
	RegisterUserDeps,
	RegisterUserUseCase
} from "./registerUser";
export type {
	VerifyTokenInput,
	VerifyTokenResult,
	VerifyTokenDeps,
	VerifyTokenUseCase
} from "./verifyToken";
export type {
	CompleteRegistrationInput,
	CompleteRegistrationResult,
	CompleteRegistrationDeps,
	CompleteRegistrationUseCase
} from "./completeRegistration";
export type {
	UpdateUserThemeInput,
	UpdateUserThemeResult,
	UpdateUserThemeDeps,
	UpdateUserThemeUseCase
} from "./updateUserTheme";

/**
 * Auth Use Cases
 *
 * 認証・ユーザー管理ドメインのユースケース群を集約
 */

// Auth use cases
export { loginUserUseCase } from "./loginUser";
export { registerUserUseCase } from "./registerUser";
export { verifyTokenUseCase } from "./verifyToken";
export { completeRegistrationUseCase } from "./completeRegistration";
export { updateUserThemeUseCase } from "./updateUserTheme";
export { getUserUseCase } from "./getUser";

// Types
export type {
	LoginUserUseCase,
	LoginUserDeps,
	LoginUserInput,
	LoginUserResult
} from "./loginUser";
export type {
	RegisterUserUseCase,
	RegisterUserDeps,
	RegisterUserInput,
	RegisterUserResult
} from "./registerUser";
export type {
	VerifyTokenUseCase,
	VerifyTokenDeps,
	VerifyTokenInput,
	VerifyTokenResult
} from "./verifyToken";
export type {
	CompleteRegistrationUseCase,
	CompleteRegistrationDeps,
	CompleteRegistrationInput,
	CompleteRegistrationResult
} from "./completeRegistration";
export type {
	UpdateUserThemeUseCase,
	UpdateUserThemeDeps,
	UpdateUserThemeInput,
	UpdateUserThemeResult
} from "./updateUserTheme";
export type {
	GetUserUseCase,
	GetUserDeps,
	GetUserInput
} from "./getUser";

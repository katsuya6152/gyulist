package usecases

import (
	"log"
	"regexp"
	"strings"

	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
	domainServices "gyulist-api-go/internal/domain/services"
)

// CompleteRegistrationRequest 本登録完了リクエスト
type CompleteRegistrationRequest struct {
	Token    string `json:"token"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

// CompleteRegistrationResponse 本登録完了レスポンス
type CompleteRegistrationResponse struct {
	Success bool                `json:"success"`
	Message string              `json:"message"`
	User    UserSummaryResponse `json:"user"`
}

// UserSummaryResponse ユーザー情報サマリー
type UserSummaryResponse struct {
	ID       int     `json:"id"`
	UserName string  `json:"userName"`
	Email    string  `json:"email"`
	Theme    *string `json:"theme,omitempty"`
}

// CompleteRegistrationUseCase 本登録完了ユースケース
type CompleteRegistrationUseCase struct {
	authRepo    repositories.AuthRepository
	passwordSvc domainServices.PasswordHasher
}

// NewCompleteRegistrationUseCase CompleteRegistrationUseCaseのコンストラクタ
func NewCompleteRegistrationUseCase(
	authRepo repositories.AuthRepository,
	passwordSvc domainServices.PasswordHasher,
) *CompleteRegistrationUseCase {
	return &CompleteRegistrationUseCase{
		authRepo:    authRepo,
		passwordSvc: passwordSvc,
	}
}

// Execute 本登録完了ユースケースを実行
func (uc *CompleteRegistrationUseCase) Execute(req CompleteRegistrationRequest) (*CompleteRegistrationResponse, error) {
	log.Printf("Complete registration attempt for token: %s", req.Token)

	// バリデーション
	if err := uc.validateRequest(req); err != nil {
		log.Printf("Complete registration validation failed: %v", err)
		return nil, err
	}

	// トークンでユーザーを検索
	foundUser, err := uc.authRepo.FindByVerificationToken(req.Token)
	if err != nil {
		log.Printf("Failed to find user by token: %v", err)
		return nil, domainErrors.NewInternalError("ユーザー検索に失敗しました", "USER_SEARCH_FAILED", err)
	}

	if foundUser == nil {
		log.Printf("Complete registration failed: token not found")
		return nil, domainErrors.NewValidationError("トークンが無効です", "INVALID_TOKEN")
	}

	// ユーザーが既に認証済みかチェック
	if foundUser.IsVerified {
		log.Printf("Complete registration failed: user already verified, user ID: %d", foundUser.ID)
		return nil, domainErrors.NewConflictError("このユーザーは既に登録完了しています", "USER_ALREADY_VERIFIED")
	}

	// パスワードハッシュ化
	hashedPassword, err := uc.passwordSvc.Hash(req.Password)
	if err != nil {
		log.Printf("Failed to hash password for user ID: %d, error: %v", foundUser.ID, err)
		return nil, domainErrors.NewInternalError("パスワード処理に失敗しました", "PASSWORD_HASH_FAILED", err)
	}

	// 本登録完了
	completedUser, err := uc.authRepo.CompleteRegistration(req.Token, req.Name, hashedPassword)
	if err != nil {
		log.Printf("Failed to complete registration for user ID: %d, error: %v", foundUser.ID, err)
		return nil, domainErrors.NewInternalError("本登録完了に失敗しました", "REGISTRATION_COMPLETE_FAILED", err)
	}

	log.Printf("Registration completed successfully for user ID: %d", completedUser.ID)

	// レスポンス作成
	theme := ""
	if completedUser.Theme != nil {
		theme = string(*completedUser.Theme)
	}

	return &CompleteRegistrationResponse{
		Success: true,
		Message: "ユーザー登録が完了しました",
		User: UserSummaryResponse{
			ID:       int(completedUser.ID),
			UserName: string(completedUser.UserName),
			Email:    string(completedUser.Email),
			Theme:    &theme,
		},
	}, nil
}

// validateRequest リクエストのバリデーション
func (uc *CompleteRegistrationUseCase) validateRequest(req CompleteRegistrationRequest) error {
	// トークン必須チェック
	if strings.TrimSpace(req.Token) == "" {
		return domainErrors.NewValidationError("トークンは必須です", "TOKEN_REQUIRED")
	}

	// ユーザー名必須チェック
	if strings.TrimSpace(req.Name) == "" {
		return domainErrors.NewValidationError("ユーザー名は必須です", "NAME_REQUIRED")
	}

	// ユーザー名長チェック
	if len(req.Name) > 100 {
		return domainErrors.NewValidationError("ユーザー名は100文字以下で入力してください", "NAME_TOO_LONG")
	}

	// パスワード必須チェック
	if strings.TrimSpace(req.Password) == "" {
		return domainErrors.NewValidationError("パスワードは必須です", "PASSWORD_REQUIRED")
	}

	// パスワード長チェック
	if len(req.Password) < 8 {
		return domainErrors.NewValidationError("パスワードは8文字以上で入力してください", "PASSWORD_TOO_SHORT")
	}

	if len(req.Password) > 128 {
		return domainErrors.NewValidationError("パスワードは128文字以下で入力してください", "PASSWORD_TOO_LONG")
	}

	// パスワード強度チェック
	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(req.Password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(req.Password)

	if !hasLetter || !hasNumber {
		return domainErrors.NewValidationError("パスワードには英字と数字の両方を含めてください", "PASSWORD_TOO_WEAK")
	}

	return nil
}

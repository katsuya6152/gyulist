package usecases

import (
	"log"
	"time"

	"gyulist-api-go/internal/domain/entities/user"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
	domainServices "gyulist-api-go/internal/domain/services"
)

// LoginRequest ログインリクエスト
type LoginRequest struct {
	Email    string
	Password string
}

// LoginResponse ログインレスポンス
type LoginResponse struct {
	Token string      `json:"token"`
	User  UserSummary `json:"user"`
}

// UserSummary ユーザー情報サマリー
type UserSummary struct {
	ID       user.UserID       `json:"id"`
	UserName user.UserName     `json:"userName"`
	Email    user.EmailAddress `json:"email"`
	Theme    *user.Theme       `json:"theme"`
}

// LoginUseCase ログインユースケース
// ログインのビジネスプロセス全体を担当
type LoginUseCase struct {
	authRepo         repositories.AuthRepository
	userDomainSvc    *domainServices.UserDomainService
	passwordVerifier domainServices.PasswordVerifier
	tokenGenerator   domainServices.TokenGenerator
}

// NewLoginUseCase LoginUseCaseのコンストラクタ
func NewLoginUseCase(
	authRepo repositories.AuthRepository,
	userDomainSvc *domainServices.UserDomainService,
	passwordVerifier domainServices.PasswordVerifier,
	tokenGenerator domainServices.TokenGenerator,
) *LoginUseCase {
	return &LoginUseCase{
		authRepo:         authRepo,
		userDomainSvc:    userDomainSvc,
		passwordVerifier: passwordVerifier,
		tokenGenerator:   tokenGenerator,
	}
}

// Execute ログインユースケースを実行
func (uc *LoginUseCase) Execute(req LoginRequest) (*LoginResponse, error) {
	log.Printf("Login attempt for email: %s", req.Email)

	// Domain Serviceでバリデーション
	if err := uc.userDomainSvc.ValidateLoginCredentials(req.Email, req.Password); err != nil {
		log.Printf("Login validation failed for email: %s, error: %v", req.Email, err)
		return nil, err
	}

	// ユーザー検索
	u, err := uc.authRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if u == nil {
		log.Printf("User not found for email: %s", req.Email)
		return nil, domainErrors.NewUnauthorizedError(domainErrors.MsgInvalidCredentials, domainErrors.CodeInvalidCredentials)
	}

	// Domain Serviceでログイン可能かチェック
	if err := uc.userDomainSvc.CanUserLogin(u); err != nil {
		log.Printf("User login not allowed for email: %s, error: %v", req.Email, err)
		return nil, err
	}

	// パスワード検証
	if u.PasswordHash == nil {
		return nil, domainErrors.NewUnauthorizedError(domainErrors.MsgInvalidCredentials, domainErrors.CodeInvalidCredentials)
	}

	if err := uc.passwordVerifier.Verify(req.Password, string(*u.PasswordHash)); err != nil {
		log.Printf("Password verification failed for email: %s", req.Email)
		return nil, domainErrors.NewUnauthorizedError(domainErrors.MsgInvalidCredentials, domainErrors.CodeInvalidCredentials)
	}

	// 最終ログイン日時更新
	now := time.Now()
	updatedUser, err := uc.authRepo.UpdateLastLogin(u.ID, now)
	if err != nil {
		log.Printf("Failed to update last login for user ID: %d, error: %v", u.ID, err)
		return nil, err
	}

	// JWTトークン生成
	token, err := uc.tokenGenerator.Generate(int(updatedUser.ID))
	if err != nil {
		log.Printf("Failed to generate token for user ID: %d, error: %v", updatedUser.ID, err)
		return nil, err
	}

	log.Printf("Login successful for user ID: %d, email: %s", updatedUser.ID, req.Email)

	// レスポンス作成
	return &LoginResponse{
		Token: token,
		User: UserSummary{
			ID:       updatedUser.ID,
			UserName: updatedUser.UserName,
			Email:    updatedUser.Email,
			Theme:    updatedUser.Theme,
		},
	}, nil
}

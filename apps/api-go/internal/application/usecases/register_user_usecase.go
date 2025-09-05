package usecases

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"regexp"
	"strings"

	"gyulist-api-go/internal/domain/entities/user"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
	domainServices "gyulist-api-go/internal/domain/services"
)

// RegisterUserRequest ユーザー仮登録リクエスト
type RegisterUserRequest struct {
	Email string `json:"email"`
}

// RegisterUserResponse ユーザー仮登録レスポンス
type RegisterUserResponse struct {
	Success        bool   `json:"success"`
	Message        string `json:"message"`
	IsExistingUser bool   `json:"isExistingUser"`
}

// RegisterUserUseCase ユーザー仮登録ユースケース
type RegisterUserUseCase struct {
	authRepo repositories.AuthRepository
	emailSvc domainServices.EmailService
}

// NewRegisterUserUseCase RegisterUserUseCaseのコンストラクタ
func NewRegisterUserUseCase(
	authRepo repositories.AuthRepository,
	emailSvc domainServices.EmailService,
) *RegisterUserUseCase {
	return &RegisterUserUseCase{
		authRepo: authRepo,
		emailSvc: emailSvc,
	}
}

// Execute ユーザー仮登録ユースケースを実行
func (uc *RegisterUserUseCase) Execute(req RegisterUserRequest) (*RegisterUserResponse, error) {
	log.Printf("User registration attempt for email: %s", req.Email)

	// バリデーション
	if err := uc.validateRequest(req); err != nil {
		log.Printf("Registration validation failed for email: %s, error: %v", req.Email, err)
		return nil, err
	}

	// 既存ユーザー確認
	existingUser, err := uc.authRepo.FindByEmail(req.Email)
	if err != nil && err != user.ErrUserNotFound {
		log.Printf("Failed to check existing user for email: %s, error: %v", req.Email, err)
		return nil, domainErrors.NewInternalError("ユーザー確認に失敗しました", "USER_CHECK_FAILED", err)
	}

	// 既存ユーザーがいる場合
	if existingUser != nil {
		if existingUser.IsVerified {
			log.Printf("Registration failed: user already verified, email: %s", req.Email)
			return &RegisterUserResponse{
				Success:        false,
				Message:        "このメールアドレスは既に登録されています",
				IsExistingUser: true,
			}, nil
		}

		// 未認証ユーザーの場合は新規トークンを生成して再送信
		log.Printf("Resending verification email for existing unverified user: %s", req.Email)
		return uc.resendVerificationEmail(existingUser)
	}

	// 新規ユーザー作成
	verificationToken := uc.generateVerificationToken()

	props := user.NewUserProps{
		UserName:          "仮登録ユーザー",
		Email:             req.Email,
		OAuthProvider:     func() *user.OAuthProvider { p := user.OAuthProviderEmail; return &p }(),
		VerificationToken: &verificationToken,
	}

	newUser, err := uc.authRepo.Create(props)
	if err != nil {
		log.Printf("Failed to create user for email: %s, error: %v", req.Email, err)
		return nil, domainErrors.NewInternalError("ユーザー作成に失敗しました", "USER_CREATE_FAILED", err)
	}

	log.Printf("User created successfully, ID: %d, email: %s", newUser.ID, req.Email)

	// 確認メール送信
	if err := uc.sendVerificationEmail(newUser.Email, verificationToken); err != nil {
		log.Printf("Failed to send verification email for user ID: %d, error: %v", newUser.ID, err)
		// メール送信失敗はログのみ記録（ユーザー作成は成功している）
	}

	return &RegisterUserResponse{
		Success:        true,
		Message:        "確認メールを送信しました",
		IsExistingUser: false,
	}, nil
}

// validateRequest リクエストのバリデーション
func (uc *RegisterUserUseCase) validateRequest(req RegisterUserRequest) error {
	// メールアドレス必須チェック
	if strings.TrimSpace(req.Email) == "" {
		return domainErrors.NewValidationError("メールアドレスは必須です", "EMAIL_REQUIRED")
	}

	// メールアドレス形式チェック
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return domainErrors.NewValidationError("メールアドレスの形式が正しくありません", "INVALID_EMAIL_FORMAT")
	}

	// メールアドレス長チェック
	if len(req.Email) > 254 {
		return domainErrors.NewValidationError("メールアドレスが長すぎます", "EMAIL_TOO_LONG")
	}

	return nil
}

// resendVerificationEmail 未認証ユーザーに確認メールを再送信
func (uc *RegisterUserUseCase) resendVerificationEmail(user *user.User) (*RegisterUserResponse, error) {
	verificationToken := uc.generateVerificationToken()

	// トークン更新
	_, err := uc.authRepo.UpdateVerificationToken(user.ID, verificationToken)
	if err != nil {
		log.Printf("Failed to update verification token for user ID: %d, error: %v", user.ID, err)
		return nil, domainErrors.NewInternalError("トークン更新に失敗しました", "TOKEN_UPDATE_FAILED", err)
	}

	// 確認メール送信
	if err := uc.sendVerificationEmail(user.Email, verificationToken); err != nil {
		log.Printf("Failed to resend verification email for user ID: %d, error: %v", user.ID, err)
	}

	return &RegisterUserResponse{
		Success:        true,
		Message:        "確認メールを再送信しました",
		IsExistingUser: true,
	}, nil
}

// generateVerificationToken 検証トークンを生成
func (uc *RegisterUserUseCase) generateVerificationToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// sendVerificationEmail 確認メールを送信
func (uc *RegisterUserUseCase) sendVerificationEmail(email user.EmailAddress, token string) error {
	ctx := context.Background()
	err := uc.emailSvc.SendVerificationEmail(ctx, string(email), token)
	if err != nil {
		log.Printf("Failed to send verification email to %s: %v", email, err)
		return err
	}

	log.Printf("Verification email sent successfully to: %s", email)
	return nil
}

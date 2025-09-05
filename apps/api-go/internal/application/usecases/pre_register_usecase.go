package usecases

import (
	"context"
	"log"
	"regexp"
	"strings"

	"gyulist-api-go/internal/domain/entities/registration"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
	domainServices "gyulist-api-go/internal/domain/services"
)

// PreRegisterRequest 仮登録リクエスト
type PreRegisterRequest struct {
	Email          string  `json:"email"`
	ReferralSource *string `json:"referralSource,omitempty"`
}

// PreRegisterResponse 仮登録レスポンス
type PreRegisterResponse struct {
	Ok                bool `json:"ok"`
	AlreadyRegistered bool `json:"alreadyRegistered,omitempty"`
}

// PreRegisterUseCase 仮登録ユースケース
type PreRegisterUseCase struct {
	registrationRepo repositories.RegistrationRepository
	emailService     domainServices.EmailService
}

// NewPreRegisterUseCase PreRegisterUseCaseのコンストラクタ
func NewPreRegisterUseCase(
	registrationRepo repositories.RegistrationRepository,
	emailService domainServices.EmailService,
) *PreRegisterUseCase {
	return &PreRegisterUseCase{
		registrationRepo: registrationRepo,
		emailService:     emailService,
	}
}

// Execute 仮登録ユースケースを実行
func (uc *PreRegisterUseCase) Execute(req PreRegisterRequest) (*PreRegisterResponse, error) {
	log.Printf("Pre-register attempt for email: %s", req.Email)

	// バリデーション
	if err := uc.validateRequest(req); err != nil {
		log.Printf("Pre-register validation failed for email: %s, error: %v", req.Email, err)
		return nil, err
	}

	// 既存登録チェック
	existingReg, err := uc.registrationRepo.FindByEmail(req.Email)
	if err != nil && err != registration.ErrNotFound {
		log.Printf("Failed to check existing registration for email: %s, error: %v", req.Email, err)
		return nil, domainErrors.NewInternalError("仮登録の確認に失敗しました", "REGISTRATION_CHECK_FAILED", err)
	}

	// 既に仮登録済みの場合は成功レスポンスを返す
	if existingReg != nil {
		log.Printf("Email already registered: %s", req.Email)
		return &PreRegisterResponse{
			Ok:                true,
			AlreadyRegistered: true,
		}, nil
	}

	// 新規仮登録作成
	props := registration.NewRegistrationProps{
		Email:          req.Email,
		ReferralSource: req.ReferralSource,
	}

	newReg, err := uc.registrationRepo.Create(props)
	if err != nil {
		log.Printf("Failed to create registration for email: %s, error: %v", req.Email, err)
		return nil, domainErrors.NewInternalError("仮登録の作成に失敗しました", "REGISTRATION_CREATE_FAILED", err)
	}

	log.Printf("Pre-register successful for email: %s, registration ID: %s", req.Email, newReg.ID)

	// 完了メール送信
	log.Printf("Attempting to send completion email to: %s", req.Email)
	ctx := context.Background()
	resendId, err := uc.emailService.SendCompletionEmail(ctx, req.Email, "新規ユーザー")
	if err != nil {
		log.Printf("Failed to send completion email for %s: %v", req.Email, err)
		// メール送信失敗はエラーにせず、ログのみ記録
		// 仮登録自体は成功しているため
	} else {
		log.Printf("Successfully sent completion email to %s, Resend ID: %s", req.Email, resendId)
	}

	return &PreRegisterResponse{
		Ok:                true,
		AlreadyRegistered: false,
	}, nil
}

// validateRequest リクエストのバリデーション
func (uc *PreRegisterUseCase) validateRequest(req PreRegisterRequest) error {
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

	// 紹介元長チェック（オプション）
	if req.ReferralSource != nil && len(*req.ReferralSource) > 100 {
		return domainErrors.NewValidationError("紹介元が長すぎます", "REFERRAL_SOURCE_TOO_LONG")
	}

	return nil
}

package usecases

import (
	"log"

	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
)

// VerifyTokenRequest トークン検証リクエスト
type VerifyTokenRequest struct {
	Token string `json:"token"`
}

// VerifyTokenResponse トークン検証レスポンス
type VerifyTokenResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// VerifyTokenUseCase トークン検証ユースケース
type VerifyTokenUseCase struct {
	authRepo repositories.AuthRepository
}

// NewVerifyTokenUseCase VerifyTokenUseCaseのコンストラクタ
func NewVerifyTokenUseCase(authRepo repositories.AuthRepository) *VerifyTokenUseCase {
	return &VerifyTokenUseCase{
		authRepo: authRepo,
	}
}

// Execute トークン検証ユースケースを実行
func (uc *VerifyTokenUseCase) Execute(req VerifyTokenRequest) (*VerifyTokenResponse, error) {
	log.Printf("Token verification attempt for token: %s", req.Token)

	// トークン形式の基本バリデーション
	if req.Token == "" {
		log.Printf("Token verification failed: empty token")
		return nil, domainErrors.NewValidationError("トークンは必須です", "TOKEN_REQUIRED")
	}

	// トークンでユーザーを検索
	foundUser, err := uc.authRepo.FindByVerificationToken(req.Token)
	if err != nil {
		log.Printf("Failed to find user by token: %v", err)
		return nil, domainErrors.NewInternalError("トークン検証に失敗しました", "TOKEN_VERIFICATION_FAILED", err)
	}

	if foundUser == nil {
		log.Printf("Token verification failed: token not found")
		return &VerifyTokenResponse{
			Success: false,
			Message: "トークンが無効です",
		}, nil
	}

	// ユーザーが既に認証済みかチェック
	if foundUser.IsVerified {
		log.Printf("Token verification failed: user already verified, user ID: %d", foundUser.ID)
		return &VerifyTokenResponse{
			Success: false,
			Message: "このトークンは既に使用されています",
		}, nil
	}

	log.Printf("Token verification successful for user ID: %d", foundUser.ID)

	return &VerifyTokenResponse{
		Success: true,
		Message: "トークンは有効です。本登録に進んでください",
	}, nil
}

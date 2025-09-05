package usecases

import (
	"fmt"

	"gyulist-api-go/internal/domain/services"
)

// InitiateGoogleOAuthRequest Google OAuth開始リクエスト
type InitiateGoogleOAuthRequest struct{}

// InitiateGoogleOAuthResponse Google OAuth開始レスポンス
type InitiateGoogleOAuthResponse struct {
	AuthURL string `json:"authUrl"`
	State   string `json:"state"`
}

// InitiateGoogleOAuthUseCase Google OAuth開始ユースケース
type InitiateGoogleOAuthUseCase struct {
	oauthService services.GoogleOAuthService
}

// NewInitiateGoogleOAuthUseCase InitiateGoogleOAuthUseCaseのコンストラクタ
func NewInitiateGoogleOAuthUseCase(oauthService services.GoogleOAuthService) *InitiateGoogleOAuthUseCase {
	return &InitiateGoogleOAuthUseCase{
		oauthService: oauthService,
	}
}

// Execute Google OAuth開始ユースケースを実行
func (uc *InitiateGoogleOAuthUseCase) Execute(req InitiateGoogleOAuthRequest) (*InitiateGoogleOAuthResponse, error) {
	// CSRF対策用のstateパラメータを生成
	state, err := uc.generateState()
	if err != nil {
		return nil, fmt.Errorf("failed to generate state: %w", err)
	}

	// Google OAuth認証URLを生成
	authURL := uc.oauthService.GenerateAuthURL(state)

	return &InitiateGoogleOAuthResponse{
		AuthURL: authURL,
		State:   state,
	}, nil
}

// generateState stateパラメータを生成（CSRF対策）
func (uc *InitiateGoogleOAuthUseCase) generateState() (string, error) {
	// 実際の実装ではランダムな値を生成
	// 簡易的に固定値を返す
	return "random-state-value", nil
}

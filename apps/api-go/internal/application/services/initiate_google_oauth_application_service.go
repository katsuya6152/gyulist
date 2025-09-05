package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// InitiateGoogleOAuthApplicationService Google OAuth開始アプリケーションサービス
type InitiateGoogleOAuthApplicationService struct {
	initiateGoogleOAuthUseCase *usecases.InitiateGoogleOAuthUseCase
}

// NewInitiateGoogleOAuthApplicationService InitiateGoogleOAuthApplicationServiceのコンストラクタ
func NewInitiateGoogleOAuthApplicationService(
	initiateGoogleOAuthUseCase *usecases.InitiateGoogleOAuthUseCase,
) *InitiateGoogleOAuthApplicationService {
	return &InitiateGoogleOAuthApplicationService{
		initiateGoogleOAuthUseCase: initiateGoogleOAuthUseCase,
	}
}

// InitiateGoogleOAuthRequest Google OAuth開始リクエスト
type InitiateGoogleOAuthRequest struct{}

// InitiateGoogleOAuthResponse Google OAuth開始レスポンス
type InitiateGoogleOAuthResponse struct {
	AuthURL string `json:"authUrl"`
	State   string `json:"state"`
}

// InitiateGoogleOAuth Google OAuthを開始
func (s *InitiateGoogleOAuthApplicationService) InitiateGoogleOAuth(req InitiateGoogleOAuthRequest) (*InitiateGoogleOAuthResponse, error) {
	result, err := s.initiateGoogleOAuthUseCase.Execute(usecases.InitiateGoogleOAuthRequest{})
	if err != nil {
		return nil, err
	}

	return &InitiateGoogleOAuthResponse{
		AuthURL: result.AuthURL,
		State:   result.State,
	}, nil
}

package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// HandleGoogleOAuthCallbackApplicationService Google OAuthコールバック処理アプリケーションサービス
type HandleGoogleOAuthCallbackApplicationService struct {
	handleGoogleOAuthCallbackUseCase *usecases.HandleGoogleOAuthCallbackUseCase
}

// NewHandleGoogleOAuthCallbackApplicationService HandleGoogleOAuthCallbackApplicationServiceのコンストラクタ
func NewHandleGoogleOAuthCallbackApplicationService(
	handleGoogleOAuthCallbackUseCase *usecases.HandleGoogleOAuthCallbackUseCase,
) *HandleGoogleOAuthCallbackApplicationService {
	return &HandleGoogleOAuthCallbackApplicationService{
		handleGoogleOAuthCallbackUseCase: handleGoogleOAuthCallbackUseCase,
	}
}

// HandleGoogleOAuthCallbackRequest Google OAuthコールバック処理リクエスト
type HandleGoogleOAuthCallbackRequest struct {
	Code  string
	State string
	Error string
}

// HandleGoogleOAuthCallbackResponse Google OAuthコールバック処理レスポンス
type HandleGoogleOAuthCallbackResponse struct {
	RedirectURL string
	Error       string
}

// HandleGoogleOAuthCallback Google OAuthコールバックを処理
func (s *HandleGoogleOAuthCallbackApplicationService) HandleGoogleOAuthCallback(req HandleGoogleOAuthCallbackRequest) (*HandleGoogleOAuthCallbackResponse, error) {
	result, err := s.handleGoogleOAuthCallbackUseCase.Execute(usecases.HandleGoogleOAuthCallbackRequest{
		Code:  req.Code,
		State: req.State,
		Error: req.Error,
	})
	if err != nil {
		return nil, err
	}

	return &HandleGoogleOAuthCallbackResponse{
		RedirectURL: result.RedirectURL,
		Error:       result.Error,
	}, nil
}

package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// VerifyTokenApplicationService トークン検証アプリケーションサービス
type VerifyTokenApplicationService struct {
	verifyTokenUseCase *usecases.VerifyTokenUseCase
}

// NewVerifyTokenApplicationService VerifyTokenApplicationServiceのコンストラクタ
func NewVerifyTokenApplicationService(
	verifyTokenUseCase *usecases.VerifyTokenUseCase,
) *VerifyTokenApplicationService {
	return &VerifyTokenApplicationService{
		verifyTokenUseCase: verifyTokenUseCase,
	}
}

// VerifyTokenRequest トークン検証リクエスト
type VerifyTokenRequest struct {
	Token string `json:"token"`
}

// VerifyTokenResponse トークン検証レスポンス
type VerifyTokenResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// VerifyToken トークンの検証を実行
func (s *VerifyTokenApplicationService) VerifyToken(req VerifyTokenRequest) (*VerifyTokenResponse, error) {
	// ユースケース実行
	result, err := s.verifyTokenUseCase.Execute(usecases.VerifyTokenRequest{
		Token: req.Token,
	})
	if err != nil {
		return nil, err
	}

	// レスポンス変換
	return &VerifyTokenResponse{
		Success: result.Success,
		Message: result.Message,
	}, nil
}

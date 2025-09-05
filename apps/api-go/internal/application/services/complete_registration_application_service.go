package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// CompleteRegistrationApplicationService 本登録完了アプリケーションサービス
type CompleteRegistrationApplicationService struct {
	completeRegistrationUseCase *usecases.CompleteRegistrationUseCase
}

// NewCompleteRegistrationApplicationService CompleteRegistrationApplicationServiceのコンストラクタ
func NewCompleteRegistrationApplicationService(
	completeRegistrationUseCase *usecases.CompleteRegistrationUseCase,
) *CompleteRegistrationApplicationService {
	return &CompleteRegistrationApplicationService{
		completeRegistrationUseCase: completeRegistrationUseCase,
	}
}

// CompleteRegistrationRequest 本登録完了リクエスト
type CompleteRegistrationRequest struct {
	Token    string `json:"token"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

// CompleteRegistrationResponse 本登録完了レスポンス
type CompleteRegistrationResponse struct {
	Success bool                         `json:"success"`
	Message string                       `json:"message"`
	User    usecases.UserSummaryResponse `json:"user"`
}

// CompleteRegistration 本登録完了を実行
func (s *CompleteRegistrationApplicationService) CompleteRegistration(req CompleteRegistrationRequest) (*CompleteRegistrationResponse, error) {
	// ユースケース実行
	result, err := s.completeRegistrationUseCase.Execute(usecases.CompleteRegistrationRequest{
		Token:    req.Token,
		Name:     req.Name,
		Password: req.Password,
	})
	if err != nil {
		return nil, err
	}

	// レスポンス変換
	return &CompleteRegistrationResponse{
		Success: result.Success,
		Message: result.Message,
		User:    result.User,
	}, nil
}

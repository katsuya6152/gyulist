package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// RegisterUserApplicationService ユーザー仮登録アプリケーションサービス
type RegisterUserApplicationService struct {
	registerUserUseCase *usecases.RegisterUserUseCase
}

// NewRegisterUserApplicationService RegisterUserApplicationServiceのコンストラクタ
func NewRegisterUserApplicationService(
	registerUserUseCase *usecases.RegisterUserUseCase,
) *RegisterUserApplicationService {
	return &RegisterUserApplicationService{
		registerUserUseCase: registerUserUseCase,
	}
}

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

// RegisterUser ユーザーの仮登録を実行
func (s *RegisterUserApplicationService) RegisterUser(req RegisterUserRequest) (*RegisterUserResponse, error) {
	// ユースケース実行
	result, err := s.registerUserUseCase.Execute(usecases.RegisterUserRequest{
		Email: req.Email,
	})
	if err != nil {
		return nil, err
	}

	// レスポンス変換
	return &RegisterUserResponse{
		Success:        result.Success,
		Message:        result.Message,
		IsExistingUser: result.IsExistingUser,
	}, nil
}

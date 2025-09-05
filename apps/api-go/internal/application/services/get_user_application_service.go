package services

import (
	"gyulist-api-go/internal/application/usecases"
	"gyulist-api-go/internal/domain/entities/user"
)

// GetUserApplicationService ユーザー情報取得アプリケーションサービス
type GetUserApplicationService struct {
	getUserUseCase *usecases.GetUserUseCase
}

// NewGetUserApplicationService GetUserApplicationServiceのコンストラクタ
func NewGetUserApplicationService(getUserUseCase *usecases.GetUserUseCase) *GetUserApplicationService {
	return &GetUserApplicationService{
		getUserUseCase: getUserUseCase,
	}
}

// GetUserRequest ユーザー情報取得リクエスト
type GetUserRequest struct {
	UserID           user.UserID
	RequestingUserID user.UserID
}

// GetUserResponse ユーザー情報取得レスポンス
type GetUserResponse struct {
	User *user.User
}

// GetUser ユーザー情報を取得
func (s *GetUserApplicationService) GetUser(req GetUserRequest) (*GetUserResponse, error) {
	result, err := s.getUserUseCase.Execute(usecases.GetUserRequest{
		UserID:           req.UserID,
		RequestingUserID: req.RequestingUserID,
	})
	if err != nil {
		return nil, err
	}

	return &GetUserResponse{
		User: result.User,
	}, nil
}

package services

import (
	"gyulist-api-go/internal/application/usecases"
	"gyulist-api-go/internal/domain/entities/user"
)

// UpdateUserThemeApplicationService ユーザーテーマ更新アプリケーションサービス
type UpdateUserThemeApplicationService struct {
	updateUserThemeUseCase *usecases.UpdateUserThemeUseCase
}

// NewUpdateUserThemeApplicationService UpdateUserThemeApplicationServiceのコンストラクタ
func NewUpdateUserThemeApplicationService(updateUserThemeUseCase *usecases.UpdateUserThemeUseCase) *UpdateUserThemeApplicationService {
	return &UpdateUserThemeApplicationService{
		updateUserThemeUseCase: updateUserThemeUseCase,
	}
}

// UpdateUserThemeRequest ユーザーテーマ更新リクエスト
type UpdateUserThemeRequest struct {
	UserID           user.UserID
	RequestingUserID user.UserID
	Theme            user.Theme
}

// UpdateUserThemeResponse ユーザーテーマ更新レスポンス
type UpdateUserThemeResponse struct {
	User *user.User
}

// UpdateUserTheme ユーザーテーマを更新
func (s *UpdateUserThemeApplicationService) UpdateUserTheme(req UpdateUserThemeRequest) (*UpdateUserThemeResponse, error) {
	result, err := s.updateUserThemeUseCase.Execute(usecases.UpdateUserThemeRequest{
		UserID:           req.UserID,
		RequestingUserID: req.RequestingUserID,
		Theme:            req.Theme,
	})
	if err != nil {
		return nil, err
	}

	return &UpdateUserThemeResponse{
		User: result.User,
	}, nil
}

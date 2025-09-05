package usecases

import (
	"time"

	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
)

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

// UpdateUserThemeUseCase ユーザーテーマ更新ユースケース
type UpdateUserThemeUseCase struct {
	authRepo repositories.AuthRepository
	clock    func() time.Time
}

// NewUpdateUserThemeUseCase UpdateUserThemeUseCaseのコンストラクタ
func NewUpdateUserThemeUseCase(
	authRepo repositories.AuthRepository,
	clock func() time.Time,
) *UpdateUserThemeUseCase {
	return &UpdateUserThemeUseCase{
		authRepo: authRepo,
		clock:    clock,
	}
}

// Execute ユーザーテーマ更新ユースケースを実行
func (uc *UpdateUserThemeUseCase) Execute(req UpdateUserThemeRequest) (*UpdateUserThemeResponse, error) {
	// 権限チェック：本人のみが更新可能
	if req.UserID != req.RequestingUserID {
		return nil, errors.NewForbiddenError("他のユーザーのテーマは変更できません", "ACCESS_DENIED")
	}

	// ユーザー存在確認
	userEntity, err := uc.authRepo.FindByID(req.UserID)
	if err != nil {
		return nil, errors.NewInternalError("ユーザー情報の取得に失敗しました", "USER_RETRIEVAL_FAILED", err)
	}

	if userEntity == nil {
		return nil, errors.NewNotFoundError("ユーザーが見つかりません", "USER_NOT_FOUND")
	}

	// テーマバリデーション
	if !uc.isValidTheme(req.Theme) {
		return nil, errors.NewValidationError("無効なテーマです", "INVALID_THEME")
	}

	// テーマ更新
	currentTime := uc.clock()
	updatedUser, err := uc.authRepo.UpdateTheme(req.UserID, req.Theme, currentTime)
	if err != nil {
		return nil, errors.NewInternalError("テーマの更新に失敗しました", "THEME_UPDATE_FAILED", err)
	}

	return &UpdateUserThemeResponse{
		User: updatedUser,
	}, nil
}

// isValidTheme テーマのバリデーション
func (uc *UpdateUserThemeUseCase) isValidTheme(theme user.Theme) bool {
	switch theme {
	case user.ThemeLight, user.ThemeDark, user.ThemeAuto:
		return true
	default:
		return false
	}
}

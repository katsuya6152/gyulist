package usecases

import (
	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
)

// GetUserRequest ユーザー情報取得リクエスト
type GetUserRequest struct {
	UserID           user.UserID
	RequestingUserID user.UserID
}

// GetUserResponse ユーザー情報取得レスポンス
type GetUserResponse struct {
	User *user.User
}

// GetUserUseCase ユーザー情報取得ユースケース
type GetUserUseCase struct {
	authRepo repositories.AuthRepository
}

// NewGetUserUseCase GetUserUseCaseのコンストラクタ
func NewGetUserUseCase(authRepo repositories.AuthRepository) *GetUserUseCase {
	return &GetUserUseCase{
		authRepo: authRepo,
	}
}

// Execute ユーザー情報取得ユースケースを実行
func (uc *GetUserUseCase) Execute(req GetUserRequest) (*GetUserResponse, error) {
	// セキュリティチェック：自分自身の情報のみ取得可能
	if req.UserID != req.RequestingUserID {
		return nil, errors.NewForbiddenError("自分の情報のみ取得可能です", "ACCESS_DENIED")
	}

	// ユーザー情報を取得
	userEntity, err := uc.authRepo.FindByID(req.UserID)
	if err != nil {
		return nil, errors.NewInternalError("ユーザー情報の取得に失敗しました", "USER_RETRIEVAL_FAILED", err)
	}

	if userEntity == nil {
		return nil, errors.NewNotFoundError("ユーザーが見つかりません", "USER_NOT_FOUND")
	}

	return &GetUserResponse{
		User: userEntity,
	}, nil
}

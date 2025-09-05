package services

import (
	"gyulist-api-go/internal/application/usecases"
	domainServices "gyulist-api-go/internal/domain/services"
)

// AuthApplicationService 認証アプリケーションサービス
// 認証関連のユースケースを調整・オーケストレーション
type AuthApplicationService struct {
	loginUseCase  *usecases.LoginUseCase
	userDomainSvc *domainServices.UserDomainService
}

// NewAuthApplicationService AuthApplicationServiceのコンストラクタ
func NewAuthApplicationService(
	loginUseCase *usecases.LoginUseCase,
	userDomainSvc *domainServices.UserDomainService,
) *AuthApplicationService {
	return &AuthApplicationService{
		loginUseCase:  loginUseCase,
		userDomainSvc: userDomainSvc,
	}
}

// LoginRequest ログインリクエスト
type LoginRequest struct {
	Email    string
	Password string
}

// LoginResponse ログインレスポンス
type LoginResponse struct {
	Token string               `json:"token"`
	User  usecases.UserSummary `json:"user"`
}

// Login ユーザーログインを実行
func (s *AuthApplicationService) Login(req LoginRequest) (*LoginResponse, error) {
	// ユースケース実行（Use Case内でバリデーションとビジネスロジックを処理）
	result, err := s.loginUseCase.Execute(usecases.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		return nil, err
	}

	// レスポンス変換
	return &LoginResponse{
		Token: result.Token,
		User:  result.User,
	}, nil
}

// Additional application services can be added here
// For example: RegisterUser, ChangePassword, etc.

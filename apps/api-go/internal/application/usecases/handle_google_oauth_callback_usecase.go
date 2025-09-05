package usecases

import (
	"context"
	"fmt"
	"time"

	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/repositories"
	"gyulist-api-go/internal/domain/services"
)

// HandleGoogleOAuthCallbackRequest Google OAuthコールバックリクエスト
type HandleGoogleOAuthCallbackRequest struct {
	Code  string
	State string
	Error string
}

// HandleGoogleOAuthCallbackResponse Google OAuthコールバックレスポンス
type HandleGoogleOAuthCallbackResponse struct {
	RedirectURL string
	Error       string
}

// HandleGoogleOAuthCallbackUseCase Google OAuthコールバック処理ユースケース
type HandleGoogleOAuthCallbackUseCase struct {
	authRepo     repositories.AuthRepository
	oauthService services.GoogleOAuthService
	tokenService services.TokenGenerator
	clock        func() time.Time
}

// NewHandleGoogleOAuthCallbackUseCase HandleGoogleOAuthCallbackUseCaseのコンストラクタ
func NewHandleGoogleOAuthCallbackUseCase(
	authRepo repositories.AuthRepository,
	oauthService services.GoogleOAuthService,
	tokenService services.TokenGenerator,
	clock func() time.Time,
) *HandleGoogleOAuthCallbackUseCase {
	return &HandleGoogleOAuthCallbackUseCase{
		authRepo:     authRepo,
		oauthService: oauthService,
		tokenService: tokenService,
		clock:        clock,
	}
}

// Execute Google OAuthコールバック処理ユースケースを実行
func (uc *HandleGoogleOAuthCallbackUseCase) Execute(req HandleGoogleOAuthCallbackRequest) (*HandleGoogleOAuthCallbackResponse, error) {
	// エラーパラメータが含まれている場合はエラー処理
	if req.Error != "" {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=" + req.Error,
			Error:       req.Error,
		}, nil
	}

	// 認証コードが含まれていない場合はエラー
	if req.Code == "" {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=no_code",
			Error:       "no authorization code",
		}, nil
	}

	ctx := context.Background()

	// 認証コードをアクセストークンと交換
	tokenResp, err := uc.oauthService.ExchangeCodeForToken(ctx, req.Code)
	if err != nil {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=token_exchange_failed",
			Error:       fmt.Sprintf("token exchange failed: %v", err),
		}, nil
	}

	// Googleユーザー情報を取得
	userInfo, err := uc.oauthService.GetUserInfo(ctx, tokenResp.AccessToken)
	if err != nil {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=user_info_failed",
			Error:       fmt.Sprintf("failed to get user info: %v", err),
		}, nil
	}

	// 既存のGoogleユーザーを検索
	existingUser, err := uc.authRepo.FindByGoogleID(userInfo.ID)
	if err != nil && err != user.ErrUserNotFound {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=database_error",
			Error:       fmt.Sprintf("database error: %v", err),
		}, nil
	}

	if existingUser != nil {
		// 既存ユーザーの場合、最終ログイン時間を更新してログイン処理
		return uc.handleExistingUser(existingUser)
	}

	// 新規ユーザーの場合、ユーザーを作成
	return uc.handleNewUser(userInfo)
}

// handleExistingUser 既存ユーザーのログイン処理
func (uc *HandleGoogleOAuthCallbackUseCase) handleExistingUser(existingUser *user.User) (*HandleGoogleOAuthCallbackResponse, error) {
	// 最終ログイン時間を更新
	now := uc.clock()
	_, err := uc.authRepo.UpdateLastLogin(existingUser.ID, now)
	if err != nil {
		// ログ更新失敗でもログインは成功させる
		fmt.Printf("Failed to update last login time: %v\n", err)
	}

	// JWTトークンを生成
	token, err := uc.tokenService.Generate(int(existingUser.ID))
	if err != nil {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=token_generation_failed",
			Error:       fmt.Sprintf("failed to generate token: %v", err),
		}, nil
	}

	// 成功時はホーム画面にリダイレクト（トークンはフロントエンドで処理）
	return &HandleGoogleOAuthCallbackResponse{
		RedirectURL: "/home?token=" + token,
		Error:       "",
	}, nil
}

// handleNewUser 新規ユーザーの作成処理
func (uc *HandleGoogleOAuthCallbackUseCase) handleNewUser(userInfo *services.GoogleUserInfo) (*HandleGoogleOAuthCallbackResponse, error) {
	// メールアドレスが既に使用されているかチェック
	existingUser, err := uc.authRepo.FindByEmail(userInfo.Email)
	if err != nil && err != user.ErrUserNotFound {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=database_error",
			Error:       fmt.Sprintf("database error: %v", err),
		}, nil
	}

	if existingUser != nil {
		// メールアドレスが既に使用されている場合
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=email_already_exists",
			Error:       "email already exists",
		}, nil
	}

	// 新規ユーザー作成
	props := user.NewUserProps{
		UserName: userInfo.Name,
		Email:    userInfo.Email,
		GoogleID: &userInfo.ID,
		OAuthProvider: func() *user.OAuthProvider {
			p := user.OAuthProviderGoogle
			return &p
		}(),
		AvatarUrl: func() *string {
			if userInfo.Picture != "" {
				return &userInfo.Picture
			}
			return nil
		}(),
	}

	newUser, err := uc.authRepo.Create(props)
	if err != nil {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=user_creation_failed",
			Error:       fmt.Sprintf("failed to create user: %v", err),
		}, nil
	}

	// 作成したユーザーを認証済みとしてマーク
	// （Google OAuthで認証済みなのでメール認証は不要）
	newUser.IsVerified = true
	_, err = uc.authRepo.UpdateLastLogin(newUser.ID, uc.clock())
	if err != nil {
		fmt.Printf("Failed to update user verification status: %v\n", err)
	}

	// JWTトークンを生成
	token, err := uc.tokenService.Generate(int(newUser.ID))
	if err != nil {
		return &HandleGoogleOAuthCallbackResponse{
			RedirectURL: "/login?error=oauth_failed&details=token_generation_failed",
			Error:       fmt.Sprintf("failed to generate token: %v", err),
		}, nil
	}

	// 成功時はホーム画面にリダイレクト
	return &HandleGoogleOAuthCallbackResponse{
		RedirectURL: "/home?token=" + token,
		Error:       "",
	}, nil
}

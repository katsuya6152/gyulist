package repositories

import (
	"time"

	"gyulist-api-go/internal/domain/entities/user"
)

// AuthRepository 認証・ユーザー管理リポジトリインターフェース
type AuthRepository interface {
	// FindByID IDでユーザーを取得
	FindByID(id user.UserID) (*user.User, error)

	// FindByEmail メールアドレスでユーザーを取得
	FindByEmail(email string) (*user.User, error)

	// FindByVerificationToken 検証トークンでユーザーを取得
	FindByVerificationToken(token string) (*user.User, error)

	// FindByGoogleID Google IDでユーザーを取得
	FindByGoogleID(googleID string) (*user.User, error)

	// FindByLineID LINE IDでユーザーを取得
	FindByLineID(lineID string) (*user.User, error)

	// Create 新規ユーザーを作成（事前登録段階）
	Create(props user.NewUserProps) (*user.User, error)

	// CompleteRegistration ユーザー登録を完了
	CompleteRegistration(token string, name string, passwordHash string) (*user.User, error)

	// UpdateVerificationToken 検証トークンを更新
	UpdateVerificationToken(userID user.UserID, verificationToken string) (*user.User, error)

	// UpdateLastLogin 最終ログイン日時を更新
	UpdateLastLogin(userID user.UserID, loginTime time.Time) (*user.User, error)

	// UpdateTheme ユーザーのテーマ設定を更新
	UpdateTheme(userID user.UserID, theme user.Theme, updateTime time.Time) (*user.User, error)

	// CreateOrUpdateOAuthUser OAuthユーザーを作成または更新
	CreateOrUpdateOAuthUser(props user.NewUserProps) (*user.User, error)
}

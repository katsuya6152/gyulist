package services

import (
	"errors"
	"fmt"
	"strings"

	"gyulist-api-go/internal/domain/entities/user"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/domain/repositories"
)

// UserDomainService ユーザードメインサービス
// ドメインのビジネスルールを担当
type UserDomainService struct {
	authRepo repositories.AuthRepository
}

// NewUserDomainService UserDomainServiceのコンストラクタ
func NewUserDomainService(authRepo repositories.AuthRepository) *UserDomainService {
	return &UserDomainService{
		authRepo: authRepo,
	}
}

// IsEmailExists メールアドレスが存在するかどうかを確認
func (s *UserDomainService) IsEmailExists(email string) (bool, error) {
	user, err := s.authRepo.FindByEmail(email)
	if err != nil {
		return false, err
	}
	return user != nil, nil
}

// ValidateLoginCredentials ログインバリデーション
func (s *UserDomainService) ValidateLoginCredentials(email, password string) error {
	if strings.TrimSpace(email) == "" {
		return domainErrors.NewValidationError(domainErrors.MsgEmailRequired, domainErrors.CodeEmailRequired)
	}
	if strings.TrimSpace(password) == "" {
		return domainErrors.NewValidationError(domainErrors.MsgPasswordRequired, domainErrors.CodePasswordRequired)
	}

	// メールアドレスの形式チェック
	if !strings.Contains(email, "@") {
		return domainErrors.NewValidationError(domainErrors.MsgInvalidEmailFormat, domainErrors.CodeInvalidEmailFormat)
	}

	return nil
}

// CanUserLogin ユーザーがログイン可能かどうかを判定
func (s *UserDomainService) CanUserLogin(user *user.User) error {
	if !user.IsVerified {
		return domainErrors.NewForbiddenError(domainErrors.MsgEmailNotVerified, domainErrors.CodeEmailNotVerified)
	}

	if user.IsOAuthUser() {
		provider := s.getOAuthProviderName(user)
		message := fmt.Sprintf(domainErrors.MsgOAuthRequired, provider)
		return domainErrors.NewForbiddenError(message, domainErrors.CodeOAuthRequired)
	}

	return nil
}

// ValidatePasswordStrength パスワードの強度を検証
func (s *UserDomainService) ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return errors.New("パスワードは8文字以上で入力してください")
	}

	if len(password) > 128 {
		return errors.New("パスワードは128文字以下で入力してください")
	}

	// 基本的な強度チェック
	hasLetter := strings.ContainsAny(password, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	hasNumber := strings.ContainsAny(password, "0123456789")

	if !hasLetter || !hasNumber {
		return errors.New("パスワードには英字と数字の両方を含めてください")
	}

	return nil
}

// IsValidUserName ユーザー名の有効性を検証
func (s *UserDomainService) IsValidUserName(userName string) error {
	if strings.TrimSpace(userName) == "" {
		return errors.New("ユーザー名は必須です")
	}

	if len(userName) > 100 {
		return errors.New("ユーザー名は100文字以下で入力してください")
	}

	return nil
}

// GetUserLoginStatus ユーザーのログイン状態を取得
func (s *UserDomainService) GetUserLoginStatus(user *user.User) string {
	if !user.IsVerified {
		return "unverified"
	}

	if user.IsOAuthUser() {
		return "oauth_only"
	}

	return "active"
}

// getOAuthProviderName OAuthプロバイダー名を取得
func (s *UserDomainService) getOAuthProviderName(user *user.User) string {
	if user.OAuthProvider != nil {
		switch *user.OAuthProvider {
		case "google":
			return "Google"
		case "line":
			return "LINE"
		}
	}
	return "外部サービス"
}

// CanUpdateUser ユーザーが別のユーザーを更新可能かどうかを判定
func (s *UserDomainService) CanUpdateUser(requestingUserID, targetUserID user.UserID) bool {
	return requestingUserID == targetUserID
}

// ShouldUpdateLastLogin 最後のログイン日時を更新すべきかどうかを判定
func (s *UserDomainService) ShouldUpdateLastLogin(user *user.User) bool {
	if user.LastLoginAt == nil {
		return true
	}

	// 一定時間経過していたら更新（例: 1時間）
	// 実際の実装では設定値から取得
	return true
}

// Domain Layer用のエラー定義（Use Caseで使用）
var (
	// ErrUserNotFound はユーザーが見つからない場合のエラー
	ErrUserNotFound = NewNotFoundError("メールアドレスまたはパスワードが正しくありません")
	// ErrInvalidPassword はパスワードが正しくない場合のエラー
	ErrInvalidPassword = NewUnauthorizedError("メールアドレスまたはパスワードが正しくありません")
)

// エラーコンストラクタ関数
func NewNotFoundError(message string) *NotFoundError {
	return &NotFoundError{Message: message}
}

func NewUnauthorizedError(message string) *UnauthorizedError {
	return &UnauthorizedError{Message: message}
}

// NotFoundError リソース未発見エラー
type NotFoundError struct {
	Message string
}

func (e *NotFoundError) Error() string {
	return e.Message
}

// UnauthorizedError 認証エラー
type UnauthorizedError struct {
	Message string
}

func (e *UnauthorizedError) Error() string {
	return e.Message
}

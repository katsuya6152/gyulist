package user

import (
	"time"
)

// UserID ユーザーIDの型
type UserID int

// UserName ユーザー名の型
type UserName string

// EmailAddress メールアドレスの型
type EmailAddress string

// PasswordHash パスワードハッシュの型
type PasswordHash string

// VerificationToken 検証トークンの型
type VerificationToken string

// GoogleID Google IDの型
type GoogleID string

// LineID LINE IDの型
type LineID string

// AvatarUrl アバターURLの型
type AvatarUrl string

// Theme テーマ設定の型
type Theme string

// OAuthProvider OAuthプロバイダーの型
type OAuthProvider string

// OAuthプロバイダーの定数
const (
	OAuthProviderEmail  OAuthProvider = "email"
	OAuthProviderGoogle OAuthProvider = "google"
	OAuthProviderLine   OAuthProvider = "line"
)

// Themeの定数
const (
	ThemeLight Theme = "light"
	ThemeDark  Theme = "dark"
	ThemeAuto  Theme = "auto"
)

// User ユーザーエンティティ
type User struct {
	ID                UserID             `json:"id" gorm:"primaryKey;autoIncrement"`
	UserName          UserName           `json:"userName" gorm:"column:user_name;default:仮登録ユーザー"`
	Email             EmailAddress       `json:"email" gorm:"uniqueIndex;not null"`
	IsVerified        bool               `json:"isVerified" gorm:"column:is_verified;default:false"`
	PasswordHash      *PasswordHash      `json:"-" gorm:"column:password_hash"`
	GoogleID          *GoogleID          `json:"-" gorm:"column:google_id"`
	LineID            *LineID            `json:"-" gorm:"column:line_id"`
	OAuthProvider     *OAuthProvider     `json:"oauthProvider" gorm:"column:oauth_provider"`
	AvatarUrl         *AvatarUrl         `json:"avatarUrl" gorm:"column:avatar_url"`
	LastLoginAt       *time.Time         `json:"lastLoginAt" gorm:"column:last_login_at"`
	Theme             *Theme             `json:"theme" gorm:"default:light"`
	CreatedAt         time.Time          `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt         time.Time          `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
	VerificationToken *VerificationToken `json:"-" gorm:"column:verification_token"`
}

// NewUserProps 新規ユーザー作成プロパティ
type NewUserProps struct {
	UserName          string
	Email             string
	PasswordHash      *string
	GoogleID          *string
	LineID            *string
	OAuthProvider     *OAuthProvider
	AvatarUrl         *string
	Theme             *Theme
	VerificationToken *string
}

// UpdateUserProps ユーザー更新プロパティ
type UpdateUserProps struct {
	UserName          *string
	IsVerified        *bool
	PasswordHash      *string
	GoogleID          *string
	LineID            *string
	OAuthProvider     *OAuthProvider
	AvatarUrl         *string
	LastLoginAt       *time.Time
	Theme             *Theme
	VerificationToken *string
}

// IsOAuthUser OAuthユーザーを判定する
func (u *User) IsOAuthUser() bool {
	return u.PasswordHash != nil && *u.PasswordHash != "" && string(*u.PasswordHash)[:13] == "oauth_dummy_"
}

// IsGoogleUser Google OAuthユーザーを判定する
func (u *User) IsGoogleUser() bool {
	return u.OAuthProvider != nil && *u.OAuthProvider == OAuthProviderGoogle
}

// IsLineUser LINE OAuthユーザーを判定する
func (u *User) IsLineUser() bool {
	return u.OAuthProvider != nil && *u.OAuthProvider == OAuthProviderLine
}

// Validate ユーザーの基本バリデーション
func (u *User) Validate() error {
	if u.UserName == "" {
		return ErrUserNameRequired
	}
	if u.Email == "" {
		return ErrEmailRequired
	}
	return nil
}

// エラーの定義
var (
	ErrUserNameRequired  = NewValidationError("ユーザー名は必須です")
	ErrEmailRequired     = NewValidationError("メールアドレスは必須です")
	ErrUserNotFound      = NewNotFoundError("ユーザーが見つかりません")
	ErrInvalidPassword   = NewUnauthorizedError("パスワードが正しくありません")
	ErrUserAlreadyExists = NewConflictError("ユーザーは既に存在します")
)

// ValidationError バリデーションエラー
type ValidationError struct {
	Message string
}

func NewValidationError(message string) *ValidationError {
	return &ValidationError{Message: message}
}

func (e *ValidationError) Error() string {
	return e.Message
}

// NotFoundError リソース未発見エラー
type NotFoundError struct {
	Message string
}

func NewNotFoundError(message string) *NotFoundError {
	return &NotFoundError{Message: message}
}

func (e *NotFoundError) Error() string {
	return e.Message
}

// UnauthorizedError 認証エラー
type UnauthorizedError struct {
	Message string
}

func NewUnauthorizedError(message string) *UnauthorizedError {
	return &UnauthorizedError{Message: message}
}

func (e *UnauthorizedError) Error() string {
	return e.Message
}

// ConflictError 競合エラー
type ConflictError struct {
	Message string
}

func NewConflictError(message string) *ConflictError {
	return &ConflictError{Message: message}
}

func (e *ConflictError) Error() string {
	return e.Message
}

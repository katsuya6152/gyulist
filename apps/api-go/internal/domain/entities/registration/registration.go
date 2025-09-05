package registration

import (
	"time"
)

// RegistrationID 仮登録IDの型
type RegistrationID string

// EmailAddress メールアドレスの型
type EmailAddress string

// ReferralSource 紹介元の型
type ReferralSource string

// RegistrationStatus 登録ステータスの型
type RegistrationStatus string

// 登録ステータスの定数
const (
	StatusPending   RegistrationStatus = "pending"
	StatusConfirmed RegistrationStatus = "confirmed"
	StatusCompleted RegistrationStatus = "completed"
	StatusCancelled RegistrationStatus = "cancelled"
)

// Registration 仮登録エンティティ
type Registration struct {
	ID             RegistrationID     `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Email          EmailAddress       `json:"email" gorm:"uniqueIndex;not null;type:varchar(254)"`
	ReferralSource *ReferralSource    `json:"referralSource" gorm:"type:varchar(100)"`
	Status         RegistrationStatus `json:"status" gorm:"not null;default:pending"`
	CreatedAt      time.Time          `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time          `json:"updatedAt" gorm:"autoUpdateTime"`
}

// NewRegistrationProps 新規仮登録作成プロパティ
type NewRegistrationProps struct {
	Email          string
	ReferralSource *string
}

// UpdateRegistrationProps 仮登録更新プロパティ
type UpdateRegistrationProps struct {
	Status         *RegistrationStatus
	ReferralSource *ReferralSource
}

// Validate 仮登録の基本バリデーション
func (r *Registration) Validate() error {
	if r.Email == "" {
		return ErrEmailRequired
	}
	if len(r.Email) > 254 {
		return ErrEmailTooLong
	}
	return nil
}

// エラーの定義
var (
	ErrEmailRequired = NewValidationError("メールアドレスは必須です")
	ErrEmailTooLong  = NewValidationError("メールアドレスが長すぎます")
	ErrNotFound      = NewNotFoundError("仮登録が見つかりません")
	ErrAlreadyExists = NewConflictError("このメールアドレスは既に仮登録されています")
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

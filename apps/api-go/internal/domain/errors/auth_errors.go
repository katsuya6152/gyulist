package errors

import "net/http"

// ErrorType エラータイプ
type ErrorType string

const (
	ErrorTypeValidation   ErrorType = "VALIDATION_ERROR"
	ErrorTypeUnauthorized ErrorType = "UNAUTHORIZED"
	ErrorTypeForbidden    ErrorType = "FORBIDDEN"
	ErrorTypeNotFound     ErrorType = "NOT_FOUND"
	ErrorTypeConflict     ErrorType = "CONFLICT"
	ErrorTypeInternal     ErrorType = "INTERNAL_ERROR"
)

// DomainError ドメインエラー
type DomainError struct {
	Type    ErrorType `json:"type"`
	Message string    `json:"message"`
	Code    string    `json:"code"`
	Cause   error     `json:"-"`
}

func (e *DomainError) Error() string {
	return e.Message
}

// HTTPStatus HTTPステータスコードを返す
func (e *DomainError) HTTPStatus() int {
	switch e.Type {
	case ErrorTypeValidation:
		return http.StatusBadRequest
	case ErrorTypeUnauthorized:
		return http.StatusUnauthorized
	case ErrorTypeForbidden:
		return http.StatusForbidden
	case ErrorTypeNotFound:
		return http.StatusNotFound
	case ErrorTypeConflict:
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// NewValidationError バリデーションエラーを作成
func NewValidationError(message, code string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeValidation,
		Message: message,
		Code:    code,
	}
}

// NewUnauthorizedError 認証エラーを作成
func NewUnauthorizedError(message, code string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeUnauthorized,
		Message: message,
		Code:    code,
	}
}

// NewForbiddenError 権限エラーを作成
func NewForbiddenError(message, code string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeForbidden,
		Message: message,
		Code:    code,
	}
}

// NewNotFoundError リソース未発見エラーを作成
func NewNotFoundError(message, code string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeNotFound,
		Message: message,
		Code:    code,
	}
}

// NewConflictError 競合エラーを作成
func NewConflictError(message, code string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeConflict,
		Message: message,
		Code:    code,
	}
}

// NewInternalError 内部エラーを作成
func NewInternalError(message, code string, cause error) *DomainError {
	return &DomainError{
		Type:    ErrorTypeInternal,
		Message: message,
		Code:    code,
		Cause:   cause,
	}
}

// 共通のエラーメッセージ定数
const (
	MsgEmailRequired       = "メールアドレスは必須です"
	MsgPasswordRequired    = "パスワードは必須です"
	MsgInvalidCredentials  = "メールアドレスまたはパスワードが正しくありません"
	MsgEmailNotVerified    = "メール認証が完了していません"
	MsgOAuthRequired       = "このアカウントは%sログインでご利用ください"
	MsgInvalidEmailFormat  = "メールアドレスの形式が正しくありません"
	MsgPasswordTooWeak     = "パスワードは8文字以上で入力してください"
	MsgUserNotFound        = "ユーザーが見つかりません"
	MsgInternalServerError = "サーバー内部エラーが発生しました"
)

// 共通のエラーコード定数
const (
	CodeEmailRequired      = "EMAIL_REQUIRED"
	CodePasswordRequired   = "PASSWORD_REQUIRED"
	CodeInvalidCredentials = "INVALID_CREDENTIALS"
	CodeEmailNotVerified   = "EMAIL_NOT_VERIFIED"
	CodeOAuthRequired      = "OAUTH_REQUIRED"
	CodeInvalidEmailFormat = "INVALID_EMAIL_FORMAT"
	CodePasswordTooWeak    = "PASSWORD_TOO_WEAK"
	CodeUserNotFound       = "USER_NOT_FOUND"
	CodeInternalError      = "INTERNAL_ERROR"
)

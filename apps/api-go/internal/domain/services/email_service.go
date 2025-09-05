package services

import (
	"context"
)

// EmailService メール送信サービスインターフェース
type EmailService interface {
	// SendCompletionEmail 事前登録完了メールを送信
	SendCompletionEmail(ctx context.Context, to string, userName string) (string, error)
	// SendVerificationEmail 検証メールを送信
	SendVerificationEmail(ctx context.Context, to string, token string) error
}

// EmailConfig メール設定
type EmailConfig struct {
	APIKey string
	From   string
	WebURL string
}

// EmailTemplate メールテンプレートインターフェース
type EmailTemplate interface {
	GenerateCompletionEmail() string
	GenerateVerificationEmail(token string) string
}

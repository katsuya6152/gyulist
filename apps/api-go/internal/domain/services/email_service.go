package services

import (
	"context"
)

// EmailService メール送信サービスインターフェース
type EmailService interface {
	// SendCompletionEmail 事前登録完了メールを送信
	SendCompletionEmail(ctx context.Context, to string, userName string) (string, error)
}

// EmailConfig メール設定
type EmailConfig struct {
	APIKey string
	From   string
}

// EmailTemplate メールテンプレートインターフェース
type EmailTemplate interface {
	GenerateCompletionEmail() string
}

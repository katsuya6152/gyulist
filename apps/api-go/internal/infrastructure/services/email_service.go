package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"gyulist-api-go/internal/domain/services"
)

// ResendEmailService Resendを使用したメールサービス実装
type ResendEmailService struct {
	config services.EmailConfig
	client *http.Client
}

// NewResendEmailService ResendEmailServiceのコンストラクタ
func NewResendEmailService(config services.EmailConfig) *ResendEmailService {
	return &ResendEmailService{
		config: config,
		client: &http.Client{},
	}
}

// SendCompletionEmail 事前登録完了メールを送信
func (s *ResendEmailService) SendCompletionEmail(ctx context.Context, to string, userName string) (string, error) {
	template := NewEmailTemplate(s.config)
	htmlContent := template.GenerateCompletionEmail()

	requestBody := map[string]interface{}{
		"from":    s.config.From,
		"to":      []string{to},
		"subject": "事前登録完了のお知らせ｜ギュウリスト",
		"html":    htmlContent,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.config.APIKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("resend API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	id, ok := result["id"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format: missing id")
	}

	return id, nil
}

// SendVerificationEmail 検証メールを送信
func (s *ResendEmailService) SendVerificationEmail(ctx context.Context, to string, token string) error {
	template := NewEmailTemplate(s.config)
	htmlContent := template.GenerateVerificationEmail(token)

	requestBody := map[string]interface{}{
		"from":    s.config.From,
		"to":      []string{to},
		"subject": "ギュウリスト会員登録の確認",
		"html":    htmlContent,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.config.APIKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}

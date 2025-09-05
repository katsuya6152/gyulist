package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	domainServices "gyulist-api-go/internal/domain/services"
)

// GoogleOAuthServiceImpl GoogleOAuthServiceの実装
type GoogleOAuthServiceImpl struct {
	config *domainServices.GoogleOAuthConfig
	client *http.Client
}

// NewGoogleOAuthService GoogleOAuthServiceImplのコンストラクタ
func NewGoogleOAuthService(config *domainServices.GoogleOAuthConfig) domainServices.GoogleOAuthService {
	return &GoogleOAuthServiceImpl{
		config: config,
		client: &http.Client{},
	}
}

// GenerateAuthURL Google OAuth認証URLを生成
func (s *GoogleOAuthServiceImpl) GenerateAuthURL(state string) string {
	baseURL := "https://accounts.google.com/o/oauth2/v2/auth"

	params := url.Values{}
	params.Add("client_id", s.config.ClientID)
	params.Add("redirect_uri", s.config.RedirectURI)
	params.Add("response_type", "code")
	params.Add("scope", "openid email profile")
	params.Add("state", state)
	params.Add("access_type", "offline")
	params.Add("prompt", "consent")

	return baseURL + "?" + params.Encode()
}

// ExchangeCodeForToken 認証コードをアクセストークンと交換
func (s *GoogleOAuthServiceImpl) ExchangeCodeForToken(ctx context.Context, code string) (*domainServices.GoogleTokenResponse, error) {
	tokenURL := "https://oauth2.googleapis.com/token"

	data := url.Values{}
	data.Set("client_id", s.config.ClientID)
	data.Set("client_secret", s.config.ClientSecret)
	data.Set("code", code)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", s.config.RedirectURI)

	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create token request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code for token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: status %d, body: %s", resp.StatusCode, string(body))
	}

	var tokenResp domainServices.GoogleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokenResp, nil
}

// GetUserInfo アクセストークンを使ってGoogleユーザー情報を取得
func (s *GoogleOAuthServiceImpl) GetUserInfo(ctx context.Context, accessToken string) (*domainServices.GoogleUserInfo, error) {
	userInfoURL := "https://www.googleapis.com/oauth2/v2/userinfo"

	req, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create user info request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("user info request failed: status %d, body: %s", resp.StatusCode, string(body))
	}

	var userInfo domainServices.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &userInfo, nil
}

// GenerateState ランダムなstateパラメータを生成（CSRF対策）
func (s *GoogleOAuthServiceImpl) GenerateState() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate state: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

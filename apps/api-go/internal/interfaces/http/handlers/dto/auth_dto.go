package dto

import (
	appServices "gyulist-api-go/internal/application/services"
)

// LoginRequest ログインリクエストDTO
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email" validate:"required,email"`
	Password string `json:"password" binding:"required,min=8" validate:"required,min=8"`
}

// LoginResponse ログインレスポンスDTO
type LoginResponse struct {
	Token     string         `json:"token"`
	User      UserSummaryDTO `json:"user"`
	ExpiresAt int64          `json:"expires_at,omitempty"` // JWT有効期限
}

// UserSummaryDTO ユーザー情報サマリーDTO
type UserSummaryDTO struct {
	ID       int    `json:"id"`
	UserName string `json:"userName"`
	Email    string `json:"email"`
	Theme    string `json:"theme,omitempty"`
}

// FromAppServiceResponse Application ServiceレスポンスからDTOに変換
func FromAppServiceResponse(resp *appServices.LoginResponse) *LoginResponse {
	var theme string
	if resp.User.Theme != nil {
		theme = string(*resp.User.Theme)
	}

	return &LoginResponse{
		Token: resp.Token,
		User: UserSummaryDTO{
			ID:       int(resp.User.ID),
			UserName: string(resp.User.UserName),
			Email:    string(resp.User.Email),
			Theme:    theme,
		},
	}
}

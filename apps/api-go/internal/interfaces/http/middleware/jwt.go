package middleware

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"gyulist-api-go/internal/domain/entities/user"
)

// JWTPayload JWTペイロードの構造体
type JWTPayload struct {
	UserID    float64 `json:"userId"`
	Issuer    string  `json:"iss"`
	Subject   string  `json:"sub"`
	ExpiresAt int64   `json:"exp"`
	IssuedAt  int64   `json:"iat"`
}

// JWTMiddleware JWT認証ミドルウェア
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "認証が必要です",
				"code":  "AUTHENTICATION_REQUIRED",
			})
			c.Abort()
			return
		}

		// Bearerトークンを取得
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "無効な認証形式です",
				"code":  "INVALID_AUTH_FORMAT",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// JWTトークンを検証
		payload, err := validateJWTToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "無効なトークンです",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// コンテキストにペイロードを設定
		c.Set("jwtPayload", payload)
		c.Next()
	}
}

// validateJWTToken JWTトークンの検証
func validateJWTToken(token string) (*JWTPayload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Invalid token format"}
	}

	// ペイロードをデコード
	payloadData, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	var payload JWTPayload
	if err := json.Unmarshal(payloadData, &payload); err != nil {
		return nil, err
	}

	// 有効期限チェック
	if payload.ExpiresAt > 0 && time.Now().Unix() > payload.ExpiresAt {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Token expired"}
	}

	// 必須フィールドチェック
	if payload.UserID == 0 {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Invalid token payload"}
	}

	return &payload, nil
}

// RequireAuth JWT認証を要求し、認証済みユーザーを返す
func RequireAuth(c *gin.Context) (*user.User, error) {
	// JWTミドルウェアを実行
	JWTMiddleware()(c)
	if c.IsAborted() {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Authentication failed"}
	}

	// 認証済みユーザー情報を取得
	jwtPayload, exists := c.Get("jwtPayload")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "認証情報が見つかりません",
			"code":  "MISSING_AUTH_INFO",
		})
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Missing JWT payload"}
	}

	payload, ok := jwtPayload.(*JWTPayload)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "認証情報の形式が無効です",
			"code":  "INVALID_AUTH_FORMAT",
		})
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Invalid JWT payload format"}
	}

	userID := user.UserID(payload.UserID)
	return &user.User{ID: userID}, nil
}

// AuthenticatedUser 認証済みユーザー情報を取得（ミドルウェア実行後）
func AuthenticatedUser(c *gin.Context) (*user.User, error) {
	jwtPayload, exists := c.Get("jwtPayload")
	if !exists {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "No JWT payload found"}
	}

	payload, ok := jwtPayload.(*JWTPayload)
	if !ok {
		return nil, gin.Error{Err: nil, Type: gin.ErrorTypePublic, Meta: "Invalid JWT payload format"}
	}

	userID := user.UserID(payload.UserID)
	return &user.User{ID: userID}, nil
}

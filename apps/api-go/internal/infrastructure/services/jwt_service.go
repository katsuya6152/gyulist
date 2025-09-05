package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"gyulist-api-go/internal/domain/entities/user"
)

// JWTService JWTトークンサービス
// Domain LayerのTokenGeneratorインターフェースを実装
type JWTService struct {
	secretKey []byte
}

// JWTClaims JWTトークンのクレーム
type JWTClaims struct {
	UserID int `json:"userId"`
	jwt.RegisteredClaims
}

// NewJWTService JWTサービスのコンストラクタ
func NewJWTService(secretKey string) *JWTService {
	return &JWTService{
		secretKey: []byte(secretKey),
	}
}

// Generate ユーザーIDからJWTトークンを生成（Domainインターフェースの実装）
func (s *JWTService) Generate(userID int) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)), // 12時間有効
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "gyulist-api-go",
			Subject:   "user-auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

// Validate JWTトークンを検証し、ユーザーIDを返す
func (s *JWTService) Validate(tokenString string) (user.UserID, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secretKey, nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return user.UserID(claims.UserID), nil
	}

	return 0, errors.New("invalid token")
}

// Refresh トークンをリフレッシュ（新しい有効期限で再生成）
func (s *JWTService) Refresh(tokenString string) (string, error) {
	userID, err := s.Validate(tokenString)
	if err != nil {
		return "", err
	}

	// 新しいトークンを生成
	return s.Generate(int(userID))
}

// GetExpirationTime トークンの有効期限を取得
func (s *JWTService) GetExpirationTime(tokenString string) (time.Time, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return s.secretKey, nil
	})

	if err != nil {
		return time.Time{}, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims.ExpiresAt.Time, nil
	}

	return time.Time{}, errors.New("invalid token")
}

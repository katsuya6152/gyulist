package services

import (
	"golang.org/x/crypto/bcrypt"
)

// PasswordService パスワードサービス
// Domain LayerのPasswordVerifierインターフェースを実装
type PasswordService struct{}

// NewPasswordService パスワードサービスのコンストラクタ
func NewPasswordService() *PasswordService {
	return &PasswordService{}
}

// Hash パスワードをハッシュ化
func (s *PasswordService) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Verify パスワードを検証（Domainインターフェースの実装）
func (s *PasswordService) Verify(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

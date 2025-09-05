package services

// PasswordVerifier パスワード検証インターフェース
type PasswordVerifier interface {
	Verify(password, hash string) error
}

// TokenGenerator トークン生成インターフェース
type TokenGenerator interface {
	Generate(userID int) (string, error)
}

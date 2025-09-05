package services

// PasswordVerifier パスワード検証インターフェース
type PasswordVerifier interface {
	Verify(password, hash string) error
}

// PasswordHasher パスワードハッシュ化インターフェース
type PasswordHasher interface {
	Hash(password string) (string, error)
}

// TokenGenerator トークン生成インターフェース
type TokenGenerator interface {
	Generate(userID int) (string, error)
}

// VerificationTokenGenerator 検証トークン生成インターフェース
type VerificationTokenGenerator interface {
	Generate() string
}

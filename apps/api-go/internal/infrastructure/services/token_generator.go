package services

import (
	"crypto/rand"
	"encoding/hex"
)

// VerificationTokenGeneratorImpl 検証トークン生成の実装
type VerificationTokenGeneratorImpl struct{}

// NewVerificationTokenGenerator VerificationTokenGeneratorImplのコンストラクタ
func NewVerificationTokenGenerator() *VerificationTokenGeneratorImpl {
	return &VerificationTokenGeneratorImpl{}
}

// Generate 検証トークンを生成
func (g *VerificationTokenGeneratorImpl) Generate() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

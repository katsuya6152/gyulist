package services

import (
	"gyulist-api-go/internal/domain/repositories"
)

// HealthService はヘルスチェック関連のビジネスロジックを担当
type HealthService struct {
	healthRepo repositories.HealthRepository
}

// NewHealthService はHealthServiceのコンストラクタ
func NewHealthService(healthRepo repositories.HealthRepository) *HealthService {
	return &HealthService{
		healthRepo: healthRepo,
	}
}

// CheckDatabaseStatus はデータベース接続状態をチェックして結果を返します
func (s *HealthService) CheckDatabaseStatus() string {
	if err := s.healthRepo.CheckDatabaseConnection(); err != nil {
		return "disconnected"
	}
	return "connected"
}

package services

import (
	"gyulist-api-go/internal/domain/repositories"
)

// HealthInfrastructureService はヘルスチェック関連の技術的実装を担当
type HealthInfrastructureService struct {
	healthRepo repositories.HealthRepository
}

// NewHealthInfrastructureService はHealthInfrastructureServiceのコンストラクタ
func NewHealthInfrastructureService(healthRepo repositories.HealthRepository) *HealthInfrastructureService {
	return &HealthInfrastructureService{
		healthRepo: healthRepo,
	}
}

// CheckDatabaseStatus はデータベース接続状態をチェックして結果を返します
func (s *HealthInfrastructureService) CheckDatabaseStatus() string {
	if err := s.healthRepo.CheckDatabaseConnection(); err != nil {
		return "disconnected"
	}
	return "connected"
}

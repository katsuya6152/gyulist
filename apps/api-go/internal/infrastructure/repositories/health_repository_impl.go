package repositories

import (
	"gyulist-api-go/internal/domain/repositories"
	"gyulist-api-go/internal/infrastructure/database"
)

// healthRepositoryImpl はHealthRepositoryの実装
type healthRepositoryImpl struct{}

// NewHealthRepository はHealthRepositoryのコンストラクタ
func NewHealthRepository() repositories.HealthRepository {
	return &healthRepositoryImpl{}
}

// CheckDatabaseConnection はデータベース接続状態を確認します
func (r *healthRepositoryImpl) CheckDatabaseConnection() error {
	return database.HealthCheck()
}

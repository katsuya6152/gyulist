package database

import (
	"log"

	"gorm.io/gorm"

	"gyulist-api-go/internal/domain/entities/registration"
	"gyulist-api-go/internal/domain/entities/user"
)

// RunMigrations はすべてのマイグレーションを実行します
func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// ユーザーエンティティのマイグレーション
	if err := db.AutoMigrate(&user.User{}); err != nil {
		log.Printf("Failed to migrate User table: %v", err)
		return err
	}

	// 仮登録エンティティのマイグレーション
	if err := db.AutoMigrate(&registration.Registration{}); err != nil {
		log.Printf("Failed to migrate Registration table: %v", err)
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// InitAndMigrate はデータベース初期化とマイグレーションを実行します
func InitAndMigrate() error {
	// データベース接続を取得
	db := GetDB()
	if db == nil {
		log.Println("Database connection is nil, skipping migrations")
		return nil
	}

	// マイグレーション実行
	return RunMigrations(db)
}

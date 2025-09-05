package main

import (
	"fmt"
	"log"

	"gyulist-api-go/configs"
	"gyulist-api-go/internal/infrastructure/database"
	"gyulist-api-go/internal/infrastructure/logging"
)

func main() {
	// Wireで依存性注入を行い、Ginエンジンを初期化
	router, err := InitializeApp()
	if err != nil {
		log.Fatalf("Failed to initialize app: %v", err)
	}

	// データベース接続初期化
	cfg := configs.Load()
	if dbErr := database.InitDB(cfg); dbErr != nil {
		log.Printf("Warning: Failed to initialize database: %v", dbErr)
		log.Println("Application will continue without database connection")
	} else {
		defer database.Close()
	}

	// ロガー初期化
	logger := logging.NewZapLogger(cfg.Log.Level, cfg.Log.Format)

	// サーバー起動
	addr := fmt.Sprintf(":%d", cfg.App.Port)
	logger.Info(fmt.Sprintf("Starting %s on port %d", cfg.App.Name, cfg.App.Port))

	if err := router.Run(addr); err != nil {
		logger.Fatal("Failed to start server", "error", err)
	}
}

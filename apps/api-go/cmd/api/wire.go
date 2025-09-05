//go:build wireinject
// +build wireinject

package main

import (
	"gyulist-api-go/configs"
	"gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/infrastructure/repositories"
	"gyulist-api-go/internal/interfaces/http/handlers"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/wire"
)

// InitializeApp はアプリケーション全体の依存性を初期化します
func InitializeApp() (*gin.Engine, error) {
	wire.Build(
		// 設定
		configs.Load,

		// リポジトリ
		repositories.NewHealthRepository,

		// サービス
		services.NewHealthService,

		// ハンドラー
		handlers.NewSystemHandler,

		// Ginルーター
		NewRouter,
	)
	return &gin.Engine{}, nil
}

// NewRouter はGinルーターを作成します
func NewRouter(
	cfg *configs.Config,
	systemHandler *handlers.SystemHandler,
) *gin.Engine {
	// Ginモード設定
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Ginルーター作成
	r := gin.New()

	// CORS設定
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://gyulist.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// OpenAPIで定義されたルーティングを登録
	generated.RegisterHandlersWithOptions(r, systemHandler, generated.GinServerOptions{
		BaseURL:      "/api/v1",
		Middlewares:  nil,
		ErrorHandler: nil,
	})

	return r
}

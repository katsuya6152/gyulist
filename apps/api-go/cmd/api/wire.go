//go:build wireinject
// +build wireinject

package main

import (
	"gyulist-api-go/configs"
	appServices "gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/application/usecases"
	domainServices "gyulist-api-go/internal/domain/services"
	"gyulist-api-go/internal/infrastructure/database"
	"gyulist-api-go/internal/infrastructure/repositories"
	infraServices "gyulist-api-go/internal/infrastructure/services"
	"gyulist-api-go/internal/interfaces/http/handlers"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/wire"
	"gorm.io/gorm"
)

// InitializeApp はアプリケーション全体の依存性を初期化します
func InitializeApp() (*gin.Engine, error) {
	wire.Build(
		// 設定
		configs.Load,

		// データベース
		provideDatabase,

		// JWTシークレット
		provideJWTSecret,

		// メール設定
		provideEmailConfig,

		// リポジトリ
		repositories.NewHealthRepository,
		repositories.NewAuthRepository,
		repositories.NewRegistrationRepository,

		// インフラサービス
		infraServices.NewPasswordService,
		infraServices.NewJWTService,
		infraServices.NewHealthInfrastructureService,
		infraServices.NewResendEmailService,

		// Domainインターフェースの実装
		providePasswordVerifier,
		provideTokenGenerator,
		provideEmailService,
		providePasswordHasher,

		// ドメインサービス
		domainServices.NewUserDomainService,

		// ユースケース
		usecases.NewLoginUseCase,
		usecases.NewPreRegisterUseCase,
		usecases.NewRegisterUserUseCase,
		usecases.NewVerifyTokenUseCase,
		usecases.NewCompleteRegistrationUseCase,

		// アプリケーションサービス
		appServices.NewAuthApplicationService,
		appServices.NewPreRegisterApplicationService,
		appServices.NewRegisterUserApplicationService,
		appServices.NewVerifyTokenApplicationService,
		appServices.NewCompleteRegistrationApplicationService,

		// ハンドラー
		handlers.NewServerHandler,

		// Ginルーター
		NewRouter,
	)
	return &gin.Engine{}, nil
}

// provideDatabase はデータベース接続を提供します
func provideDatabase(cfg *configs.Config) (*gorm.DB, error) {
	if err := database.InitDB(cfg); err != nil {
		return nil, err
	}
	return database.GetDB(), nil
}

// provideJWTSecret はJWTシークレットを提供します
func provideJWTSecret(cfg *configs.Config) string {
	return cfg.JWT.Secret
}

// provideEmailConfig はメール設定を提供します
func provideEmailConfig(cfg *configs.Config) domainServices.EmailConfig {
	return domainServices.EmailConfig{
		APIKey: cfg.Email.APIKey,
		From:   cfg.Email.From,
		WebURL: cfg.Email.WebURL,
	}
}

// provideEmailService はEmailServiceを提供します
func provideEmailService(emailSvc *infraServices.ResendEmailService) domainServices.EmailService {
	return emailSvc
}

// providePasswordHasher はPasswordHasherを提供します
func providePasswordHasher(passwordSvc *infraServices.PasswordService) domainServices.PasswordHasher {
	return passwordSvc
}

// providePasswordVerifier はPasswordVerifierを提供します
func providePasswordVerifier(passwordSvc *infraServices.PasswordService) domainServices.PasswordVerifier {
	return passwordSvc
}

// provideTokenGenerator はTokenGeneratorを提供します
func provideTokenGenerator(jwtSvc *infraServices.JWTService) domainServices.TokenGenerator {
	return jwtSvc
}

// NewRouter はGinルーターを作成します
func NewRouter(
	cfg *configs.Config,
	serverHandler *handlers.ServerHandler,
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
	generated.RegisterHandlersWithOptions(r, serverHandler, generated.GinServerOptions{
		BaseURL:      "/api/v1",
		Middlewares:  nil,
		ErrorHandler: nil,
	})

	return r
}

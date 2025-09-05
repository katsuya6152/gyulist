package handlers

import (
	"gyulist-api-go/configs"
	appServices "gyulist-api-go/internal/application/services"
	infra "gyulist-api-go/internal/infrastructure/services"

	"github.com/gin-gonic/gin"
)

// ServerHandler ServerInterfaceを実装するハンドラー
type ServerHandler struct {
	systemHandler *SystemHandler
	authHandler   *AuthHandler
}

// NewServerHandler ServerHandlerのコンストラクタ
func NewServerHandler(
	config *configs.Config,
	healthService *infra.HealthInfrastructureService,
	authAppService *appServices.AuthApplicationService,
) *ServerHandler {
	return &ServerHandler{
		systemHandler: NewSystemHandler(config, healthService),
		authHandler:   NewAuthHandler(authAppService),
	}
}

// GetApiInfo API情報を返す (GET /)
func (h *ServerHandler) GetApiInfo(c *gin.Context) {
	h.systemHandler.GetApiInfo(c)
}

// LoginUser ユーザーログイン (POST /auth/login)
func (h *ServerHandler) LoginUser(c *gin.Context) {
	h.authHandler.LoginUser(c)
}

// GetHealth 健康チェック (GET /health)
func (h *ServerHandler) GetHealth(c *gin.Context) {
	h.systemHandler.GetHealth(c)
}

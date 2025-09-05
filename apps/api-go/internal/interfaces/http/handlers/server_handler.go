package handlers

import (
	"gyulist-api-go/configs"
	appServices "gyulist-api-go/internal/application/services"
	infra "gyulist-api-go/internal/infrastructure/services"

	"github.com/gin-gonic/gin"
)

// ServerHandler ServerInterfaceを実装するハンドラー
type ServerHandler struct {
	systemHandler      *SystemHandler
	authHandler        *AuthHandler
	preRegisterHandler *PreRegisterHandler
	registerHandler    *RegisterHandler
	verifyHandler      *VerifyHandler
	completeHandler    *CompleteHandler
}

// NewServerHandler ServerHandlerのコンストラクタ
func NewServerHandler(
	config *configs.Config,
	healthService *infra.HealthInfrastructureService,
	authAppService *appServices.AuthApplicationService,
	preRegisterAppService *appServices.PreRegisterApplicationService,
	registerAppService *appServices.RegisterUserApplicationService,
	verifyAppService *appServices.VerifyTokenApplicationService,
	completeAppService *appServices.CompleteRegistrationApplicationService,
) *ServerHandler {
	return &ServerHandler{
		systemHandler:      NewSystemHandler(config, healthService),
		authHandler:        NewAuthHandler(authAppService),
		preRegisterHandler: NewPreRegisterHandler(preRegisterAppService),
		registerHandler:    NewRegisterHandler(registerAppService),
		verifyHandler:      NewVerifyHandler(verifyAppService),
		completeHandler:    NewCompleteHandler(completeAppService),
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

// PreRegisterUser ユーザー仮登録 (POST /auth/pre-register)
func (h *ServerHandler) PreRegisterUser(c *gin.Context) {
	h.preRegisterHandler.PreRegisterUser(c)
}

// RegisterUser ユーザー仮登録 (POST /auth/register)
func (h *ServerHandler) RegisterUser(c *gin.Context) {
	h.registerHandler.RegisterUser(c)
}

// VerifyToken トークン検証 (POST /auth/verify)
func (h *ServerHandler) VerifyToken(c *gin.Context) {
	h.verifyHandler.VerifyToken(c)
}

// CompleteRegistration 本登録完了 (POST /auth/complete)
func (h *ServerHandler) CompleteRegistration(c *gin.Context) {
	h.completeHandler.CompleteRegistration(c)
}

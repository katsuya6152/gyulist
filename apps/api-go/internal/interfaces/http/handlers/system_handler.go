package handlers

import (
	"net/http"
	"time"

	"gyulist-api-go/configs"
	infra "gyulist-api-go/internal/infrastructure/services"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"

	"github.com/gin-gonic/gin"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// SystemHandler システム関連のハンドラーを実装
type SystemHandler struct {
	config        *configs.Config
	healthService *infra.HealthInfrastructureService
}

// NewSystemHandler SystemHandlerのコンストラクタ
func NewSystemHandler(config *configs.Config, healthService *infra.HealthInfrastructureService) *SystemHandler {
	return &SystemHandler{
		config:        config,
		healthService: healthService,
	}
}

// GetApiInfo API情報を返す
// (GET /)
func (h *SystemHandler) GetApiInfo(c *gin.Context) {
	env := generated.ApiInfoResponseEnvironment(h.config.App.Env)
	email := openapi_types.Email("support@gyulist.com")

	// データベース接続状態を確認
	dbStatus := h.healthService.CheckDatabaseStatus()

	// データベース接続状態を適切な型に変換
	var dbStatusEnum generated.ApiInfoResponseStatusDatabase
	switch dbStatus {
	case "connected":
		dbStatusEnum = generated.Connected
	case "disconnected":
		dbStatusEnum = generated.Disconnected
	default:
		dbStatusEnum = generated.Error
	}

	response := generated.ApiInfoResponse{
		Name:        "Gyulist API Go",
		Description: stringPtr("牛群管理システムのGo API"),
		Version:     "1.0.0",
		Environment: env,
		Status: &struct {
			Database *generated.ApiInfoResponseStatusDatabase `json:"database,omitempty"`
		}{
			Database: &dbStatusEnum,
		},
		Endpoints: &struct {
			Docs   *string `json:"docs,omitempty"`
			Health *string `json:"health,omitempty"`
		}{
			Health: stringPtr("/health"),
			Docs:   stringPtr("/docs"),
		},
		Contact: &struct {
			Email *openapi_types.Email `json:"email,omitempty"`
			Name  *string              `json:"name,omitempty"`
		}{
			Name:  stringPtr("Gyulist Development Team"),
			Email: &email,
		},
		License: &struct {
			Name *string `json:"name,omitempty"`
			Url  *string `json:"url,omitempty"`
		}{
			Name: stringPtr("MIT"),
			Url:  stringPtr("https://opensource.org/licenses/MIT"),
		},
	}

	c.JSON(http.StatusOK, response)
}

// GetHealth 健康チェック
// (GET /health)
func (h *SystemHandler) GetHealth(c *gin.Context) {
	status := generated.Healthy
	env := generated.HealthResponseEnvironment(h.config.App.Env)
	now := time.Now()

	response := generated.HealthResponse{
		Status:      status,
		Service:     h.config.App.Name,
		Version:     h.config.App.Version,
		Environment: env,
		Timestamp:   &now,
	}

	c.JSON(http.StatusOK, response)
}

// ヘルパー関数
func stringPtr(s string) *string {
	return &s
}

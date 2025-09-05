package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
)

// InitiateGoogleOAuthHandler Google OAuth開始ハンドラー
type InitiateGoogleOAuthHandler struct {
	initiateGoogleOAuthAppService *appServices.InitiateGoogleOAuthApplicationService
}

// NewInitiateGoogleOAuthHandler InitiateGoogleOAuthHandlerのコンストラクタ
func NewInitiateGoogleOAuthHandler(initiateGoogleOAuthAppService *appServices.InitiateGoogleOAuthApplicationService) *InitiateGoogleOAuthHandler {
	return &InitiateGoogleOAuthHandler{
		initiateGoogleOAuthAppService: initiateGoogleOAuthAppService,
	}
}

// InitiateGoogleOAuth Google OAuthを開始 (GET /oauth/google)
func (h *InitiateGoogleOAuthHandler) InitiateGoogleOAuth(c *gin.Context) {
	resp, err := h.initiateGoogleOAuthAppService.InitiateGoogleOAuth(appServices.InitiateGoogleOAuthRequest{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		})
		return
	}

	// Google OAuth認証URLにリダイレクト
	c.Redirect(http.StatusFound, resp.AuthURL)
}

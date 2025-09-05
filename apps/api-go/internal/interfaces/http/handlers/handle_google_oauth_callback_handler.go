package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// HandleGoogleOAuthCallbackHandler Google OAuthコールバック処理ハンドラー
type HandleGoogleOAuthCallbackHandler struct {
	handleGoogleOAuthCallbackAppService *appServices.HandleGoogleOAuthCallbackApplicationService
}

// NewHandleGoogleOAuthCallbackHandler HandleGoogleOAuthCallbackHandlerのコンストラクタ
func NewHandleGoogleOAuthCallbackHandler(handleGoogleOAuthCallbackAppService *appServices.HandleGoogleOAuthCallbackApplicationService) *HandleGoogleOAuthCallbackHandler {
	return &HandleGoogleOAuthCallbackHandler{
		handleGoogleOAuthCallbackAppService: handleGoogleOAuthCallbackAppService,
	}
}

// HandleGoogleOAuthCallback Google OAuthコールバックを処理 (GET /oauth/google/callback)
func (h *HandleGoogleOAuthCallbackHandler) HandleGoogleOAuthCallback(c *gin.Context, params generated.HandleGoogleOAuthCallbackParams) {
	req := appServices.HandleGoogleOAuthCallbackRequest{
		Code: params.Code,
		State: func() string {
			if params.State != nil {
				return *params.State
			}
			return ""
		}(),
		Error: func() string {
			if params.Error != nil {
				return *params.Error
			}
			return ""
		}(),
	}

	resp, err := h.handleGoogleOAuthCallbackAppService.HandleGoogleOAuthCallback(req)
	if err != nil {
		// エラーが発生した場合はログインページにリダイレクト
		c.Redirect(http.StatusFound, "/login?error=oauth_failed&details=internal_error")
		return
	}

	// 指定されたURLにリダイレクト
	c.Redirect(http.StatusFound, resp.RedirectURL)
}

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// CompleteHandler 本登録完了ハンドラー
type CompleteHandler struct {
	completeRegistrationAppService *appServices.CompleteRegistrationApplicationService
}

// NewCompleteHandler CompleteHandlerのコンストラクタ
func NewCompleteHandler(completeRegistrationAppService *appServices.CompleteRegistrationApplicationService) *CompleteHandler {
	return &CompleteHandler{
		completeRegistrationAppService: completeRegistrationAppService,
	}
}

// CompleteRegistration 本登録完了 (POST /auth/complete)
func (h *CompleteHandler) CompleteRegistration(c *gin.Context) {
	var req generated.CompleteRegistrationJSONBody

	// 生成されたモデルでリクエストバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエスト形式が正しくありません",
			"code":  "INVALID_REQUEST_FORMAT",
		})
		return
	}

	// 生成されたモデルからApplication Serviceリクエストへ変換
	appReq := appServices.CompleteRegistrationRequest{
		Token:    req.Token,
		Name:     req.Name,
		Password: req.Password,
	}

	resp, err := h.completeRegistrationAppService.CompleteRegistration(appReq)
	if err != nil {
		h.handleDomainError(c, err)
		return
	}

	// レスポンス作成
	c.JSON(http.StatusOK, resp)
}

// handleDomainError DomainエラーをHTTPレスポンスに変換
func (h *CompleteHandler) handleDomainError(c *gin.Context, err error) {
	if domainErr, ok := err.(*domainErrors.DomainError); ok {
		c.JSON(domainErr.HTTPStatus(), gin.H{
			"error": domainErr.Message,
			"code":  domainErr.Code,
			"type":  string(domainErr.Type),
		})
		return
	}

	// 予期しないエラーの場合
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": domainErrors.MsgInternalServerError,
		"code":  domainErrors.CodeInternalError,
		"type":  string(domainErrors.ErrorTypeInternal),
	})
}

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// VerifyHandler トークン検証ハンドラー
type VerifyHandler struct {
	verifyTokenAppService *appServices.VerifyTokenApplicationService
}

// NewVerifyHandler VerifyHandlerのコンストラクタ
func NewVerifyHandler(verifyTokenAppService *appServices.VerifyTokenApplicationService) *VerifyHandler {
	return &VerifyHandler{
		verifyTokenAppService: verifyTokenAppService,
	}
}

// VerifyToken トークン検証 (POST /auth/verify)
func (h *VerifyHandler) VerifyToken(c *gin.Context) {
	var req generated.VerifyTokenJSONBody

	// 生成されたモデルでリクエストバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエスト形式が正しくありません",
			"code":  "INVALID_REQUEST_FORMAT",
		})
		return
	}

	// 生成されたモデルからApplication Serviceリクエストへ変換
	appReq := appServices.VerifyTokenRequest{
		Token: req.Token,
	}

	resp, err := h.verifyTokenAppService.VerifyToken(appReq)
	if err != nil {
		h.handleDomainError(c, err)
		return
	}

	// レスポンス作成
	statusCode := http.StatusOK
	if !resp.Success {
		statusCode = http.StatusBadRequest
	}

	c.JSON(statusCode, resp)
}

// handleDomainError DomainエラーをHTTPレスポンスに変換
func (h *VerifyHandler) handleDomainError(c *gin.Context, err error) {
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

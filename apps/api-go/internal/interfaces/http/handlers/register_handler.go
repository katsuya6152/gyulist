package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// RegisterHandler ユーザー仮登録ハンドラー
type RegisterHandler struct {
	registerUserAppService *appServices.RegisterUserApplicationService
}

// NewRegisterHandler RegisterHandlerのコンストラクタ
func NewRegisterHandler(registerUserAppService *appServices.RegisterUserApplicationService) *RegisterHandler {
	return &RegisterHandler{
		registerUserAppService: registerUserAppService,
	}
}

// RegisterUser ユーザー仮登録 (POST /auth/register)
func (h *RegisterHandler) RegisterUser(c *gin.Context) {
	var req generated.RegisterUserJSONBody

	// 生成されたモデルでリクエストバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエスト形式が正しくありません",
			"code":  "INVALID_REQUEST_FORMAT",
		})
		return
	}

	// 生成されたモデルからApplication Serviceリクエストへ変換
	appReq := appServices.RegisterUserRequest{
		Email: string(req.Email),
	}

	resp, err := h.registerUserAppService.RegisterUser(appReq)
	if err != nil {
		h.handleDomainError(c, err)
		return
	}

	// レスポンス作成
	c.JSON(http.StatusOK, resp)
}

// handleDomainError DomainエラーをHTTPレスポンスに変換
func (h *RegisterHandler) handleDomainError(c *gin.Context, err error) {
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

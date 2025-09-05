package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	domainErrors "gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// PreRegisterHandler 仮登録ハンドラー
type PreRegisterHandler struct {
	preRegisterAppService *appServices.PreRegisterApplicationService
}

// NewPreRegisterHandler PreRegisterHandlerのコンストラクタ
func NewPreRegisterHandler(preRegisterAppService *appServices.PreRegisterApplicationService) *PreRegisterHandler {
	return &PreRegisterHandler{
		preRegisterAppService: preRegisterAppService,
	}
}

// PreRegisterUser ユーザー仮登録 (POST /auth/pre-register)
func (h *PreRegisterHandler) PreRegisterUser(c *gin.Context) {
	var req generated.PreRegisterUserJSONBody

	// 生成されたモデルでリクエストバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエスト形式が正しくありません",
			"code":  "INVALID_REQUEST_FORMAT",
		})
		return
	}

	// 追加バリデーション
	if err := h.validatePreRegisterRequest(&req); err != nil {
		h.handleDomainError(c, err)
		return
	}

	// 生成されたモデルからApplication Serviceリクエストへ変換
	appReq := appServices.PreRegisterRequest{
		Email:          string(req.Email), // openapi_types.Email を string に変換
		ReferralSource: req.ReferralSource,
	}

	resp, err := h.preRegisterAppService.PreRegister(appReq)
	if err != nil {
		h.handleDomainError(c, err)
		return
	}

	// レスポンス作成
	c.JSON(http.StatusOK, resp)
}

// validatePreRegisterRequest 生成されたリクエストモデルの追加バリデーション
func (h *PreRegisterHandler) validatePreRegisterRequest(req *generated.PreRegisterUserJSONBody) error {
	// メールアドレス形式チェック（@が含まれているか）
	emailStr := string(req.Email)
	if len(emailStr) == 0 || emailStr[0] == '@' || emailStr[len(emailStr)-1] == '@' {
		return domainErrors.NewValidationError("メールアドレスの形式が正しくありません", "INVALID_EMAIL_FORMAT")
	}

	return nil
}

// handleDomainError DomainエラーをHTTPレスポンスに変換
func (h *PreRegisterHandler) handleDomainError(c *gin.Context, err error) {
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

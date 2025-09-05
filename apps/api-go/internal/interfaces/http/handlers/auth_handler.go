package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	openapi_types "github.com/oapi-codegen/runtime/types"

	appServices "gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
)

// AuthHandler 認証ハンドラー
type AuthHandler struct {
	authAppService *appServices.AuthApplicationService
}

// NewAuthHandler AuthHandlerのコンストラクタ
func NewAuthHandler(authAppService *appServices.AuthApplicationService) *AuthHandler {
	return &AuthHandler{
		authAppService: authAppService,
	}
}

// LoginUser ユーザーログイン (POST /auth/login)
func (h *AuthHandler) LoginUser(c *gin.Context) {
	var req generated.LoginUserJSONBody

	// 生成されたモデルでリクエストバインド
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエスト形式が正しくありません",
			"code":  "INVALID_REQUEST_FORMAT",
		})
		return
	}

	// 追加バリデーション
	if err := h.validateLoginRequest(&req); err != nil {
		h.handleDomainError(c, err)
		return
	}

	// 生成されたモデルからApplication Serviceリクエストへ変換
	appReq := appServices.LoginRequest{
		Email:    string(req.Email), // openapi_types.Email を string に変換
		Password: req.Password,
	}

	resp, err := h.authAppService.Login(appReq)
	if err != nil {
		h.handleDomainError(c, err)
		return
	}

	// 生成されたモデルに変換してレスポンス
	generatedResp := h.convertToGeneratedResponse(resp)
	c.JSON(http.StatusOK, generatedResp)
}

// validateLoginRequest 生成されたリクエストモデルの追加バリデーション
func (h *AuthHandler) validateLoginRequest(req *generated.LoginUserJSONBody) error {
	// メールアドレスが空でないかチェック
	emailStr := string(req.Email)
	if strings.TrimSpace(emailStr) == "" {
		return errors.NewValidationError(errors.MsgEmailRequired, errors.CodeEmailRequired)
	}

	// メールアドレス形式チェック（@が含まれているか）
	if !strings.Contains(emailStr, "@") {
		return errors.NewValidationError(errors.MsgInvalidEmailFormat, errors.CodeInvalidEmailFormat)
	}

	// パスワードが空でないかチェック
	if strings.TrimSpace(req.Password) == "" {
		return errors.NewValidationError(errors.MsgPasswordRequired, errors.CodePasswordRequired)
	}

	// パスワード長チェック（OpenAPI仕様では8文字以上）
	if len(req.Password) < 8 {
		return errors.NewValidationError(errors.MsgPasswordTooWeak, errors.CodePasswordTooWeak)
	}

	return nil
}

// convertToGeneratedResponse Application Serviceレスポンスを生成されたモデルに変換
func (h *AuthHandler) convertToGeneratedResponse(resp *appServices.LoginResponse) *generated.LoginResponse {
	// User情報の変換（生成されたモデルの構造に合わせる）
	user := generated.UserSummary{
		Email:    openapi_types.Email(resp.User.Email),
		Id:       int(resp.User.ID),
		UserName: string(resp.User.UserName),
	}

	// Themeの変換
	if resp.User.Theme != nil {
		theme := generated.UserSummaryTheme(*resp.User.Theme)
		user.Theme = &theme
	}

	return &generated.LoginResponse{
		Token: resp.Token,
		User:  user,
	}
}

// handleDomainError DomainエラーをHTTPレスポンスに変換
func (h *AuthHandler) handleDomainError(c *gin.Context, err error) {
	if domainErr, ok := err.(*errors.DomainError); ok {
		c.JSON(domainErr.HTTPStatus(), gin.H{
			"error": domainErr.Message,
			"code":  domainErr.Code,
			"type":  string(domainErr.Type),
		})
		return
	}

	// 予期しないエラーの場合
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": errors.MsgInternalServerError,
		"code":  errors.CodeInternalError,
		"type":  string(errors.ErrorTypeInternal),
	})
}

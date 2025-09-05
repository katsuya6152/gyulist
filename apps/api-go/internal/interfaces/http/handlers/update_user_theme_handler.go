package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/handlers/generated"
	"gyulist-api-go/internal/interfaces/http/middleware"
)

// UpdateUserThemeHandler ユーザーテーマ更新ハンドラー
type UpdateUserThemeHandler struct {
	updateUserThemeAppService *appServices.UpdateUserThemeApplicationService
}

// NewUpdateUserThemeHandler UpdateUserThemeHandlerのコンストラクタ
func NewUpdateUserThemeHandler(updateUserThemeAppService *appServices.UpdateUserThemeApplicationService) *UpdateUserThemeHandler {
	return &UpdateUserThemeHandler{
		updateUserThemeAppService: updateUserThemeAppService,
	}
}

// UpdateUserTheme ユーザーテーマを更新 (PATCH /users/:id/theme)
func (h *UpdateUserThemeHandler) UpdateUserTheme(c *gin.Context, id int32) {
	// JWT認証を実行
	authUser, err := middleware.RequireAuth(c)
	if err != nil {
		return
	}
	requestingUserID := authUser.ID

	// リクエストボディをパース
	var reqBody generated.UpdateUserThemeJSONRequestBody
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストボディが不正です",
			"code":  "INVALID_REQUEST_BODY",
		})
		return
	}

	// テーマを変換
	var theme user.Theme
	switch reqBody.Theme {
	case generated.Light:
		theme = user.ThemeLight
	case generated.Dark:
		theme = user.ThemeDark
	case generated.Auto:
		theme = user.ThemeAuto
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "無効なテーマです",
			"code":  "INVALID_THEME",
		})
		return
	}

	req := appServices.UpdateUserThemeRequest{
		UserID:           user.UserID(id),
		RequestingUserID: requestingUserID,
		Theme:            theme,
	}

	resp, err := h.updateUserThemeAppService.UpdateUserTheme(req)
	if err != nil {
		// エラーレスポンスの処理
		statusCode := http.StatusInternalServerError
		errorCode := "INTERNAL_ERROR"
		errorMessage := "サーバー内部エラーが発生しました"

		if domainErr, ok := err.(*errors.DomainError); ok {
			statusCode = domainErr.HTTPStatus()
			errorCode = string(domainErr.Code)
			errorMessage = domainErr.Message
		}

		c.JSON(statusCode, gin.H{
			"error": errorMessage,
			"code":  errorCode,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": resp.User,
		},
	})
}

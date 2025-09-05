package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appServices "gyulist-api-go/internal/application/services"
	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/errors"
	"gyulist-api-go/internal/interfaces/http/middleware"
)

// GetUserHandler ユーザー情報取得ハンドラー
type GetUserHandler struct {
	getUserAppService *appServices.GetUserApplicationService
}

// NewGetUserHandler GetUserHandlerのコンストラクタ
func NewGetUserHandler(getUserAppService *appServices.GetUserApplicationService) *GetUserHandler {
	return &GetUserHandler{
		getUserAppService: getUserAppService,
	}
}

// GetUser ユーザー情報を取得 (GET /users/:id)
func (h *GetUserHandler) GetUser(c *gin.Context, id int32) {
	// JWT認証を実行
	authUser, err := middleware.RequireAuth(c)
	if err != nil {
		return
	}
	requestingUserID := authUser.ID

	req := appServices.GetUserRequest{
		UserID:           user.UserID(id),
		RequestingUserID: requestingUserID,
	}

	resp, err := h.getUserAppService.GetUser(req)
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
		"data":    resp.User,
	})
}

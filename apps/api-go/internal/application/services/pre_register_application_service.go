package services

import (
	"gyulist-api-go/internal/application/usecases"
)

// PreRegisterApplicationService 仮登録アプリケーションサービス
type PreRegisterApplicationService struct {
	preRegisterUseCase *usecases.PreRegisterUseCase
}

// NewPreRegisterApplicationService PreRegisterApplicationServiceのコンストラクタ
func NewPreRegisterApplicationService(
	preRegisterUseCase *usecases.PreRegisterUseCase,
) *PreRegisterApplicationService {
	return &PreRegisterApplicationService{
		preRegisterUseCase: preRegisterUseCase,
	}
}

// PreRegisterRequest 仮登録リクエスト
type PreRegisterRequest struct {
	Email          string  `json:"email"`
	ReferralSource *string `json:"referralSource,omitempty"`
}

// PreRegisterResponse 仮登録レスポンス
type PreRegisterResponse struct {
	Ok                bool `json:"ok"`
	AlreadyRegistered bool `json:"alreadyRegistered,omitempty"`
}

// PreRegister ユーザーの仮登録を実行
func (s *PreRegisterApplicationService) PreRegister(req PreRegisterRequest) (*PreRegisterResponse, error) {
	// ユースケース実行
	result, err := s.preRegisterUseCase.Execute(usecases.PreRegisterRequest{
		Email:          req.Email,
		ReferralSource: req.ReferralSource,
	})
	if err != nil {
		return nil, err
	}

	// レスポンス変換
	return &PreRegisterResponse{
		Ok:                result.Ok,
		AlreadyRegistered: result.AlreadyRegistered,
	}, nil
}

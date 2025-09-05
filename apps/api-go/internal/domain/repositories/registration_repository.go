package repositories

import (
	"gyulist-api-go/internal/domain/entities/registration"
)

// RegistrationRepository 仮登録リポジトリインターフェース
type RegistrationRepository interface {
	// FindByEmail メールアドレスで仮登録を検索
	FindByEmail(email string) (*registration.Registration, error)

	// FindByID IDで仮登録を検索
	FindByID(id registration.RegistrationID) (*registration.Registration, error)

	// Create 新規仮登録を作成
	Create(props registration.NewRegistrationProps) (*registration.Registration, error)

	// UpdateStatus ステータスを更新
	UpdateStatus(id registration.RegistrationID, status registration.RegistrationStatus) (*registration.Registration, error)

	// Delete 仮登録を削除
	Delete(id registration.RegistrationID) error
}

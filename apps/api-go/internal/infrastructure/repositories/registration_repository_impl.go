package repositories

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"gyulist-api-go/internal/domain/entities/registration"
	"gyulist-api-go/internal/domain/repositories"
)

// registrationRepositoryImpl GORMを使用したRegistrationRepository実装
type registrationRepositoryImpl struct {
	db *gorm.DB
}

// NewRegistrationRepository RegistrationRepositoryのコンストラクタ
func NewRegistrationRepository(db *gorm.DB) repositories.RegistrationRepository {
	return &registrationRepositoryImpl{
		db: db,
	}
}

// FindByEmail メールアドレスで仮登録を検索
func (r *registrationRepositoryImpl) FindByEmail(email string) (*registration.Registration, error) {
	var reg registration.Registration
	if err := r.db.Where("email = ?", email).First(&reg).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, registration.ErrNotFound
		}
		return nil, err
	}
	return &reg, nil
}

// FindByID IDで仮登録を検索
func (r *registrationRepositoryImpl) FindByID(id registration.RegistrationID) (*registration.Registration, error) {
	var reg registration.Registration
	if err := r.db.Where("id = ?", id).First(&reg).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, registration.ErrNotFound
		}
		return nil, err
	}
	return &reg, nil
}

// Create 新規仮登録を作成
func (r *registrationRepositoryImpl) Create(props registration.NewRegistrationProps) (*registration.Registration, error) {
	now := time.Now()

	reg := registration.Registration{
		ID:        registration.RegistrationID(generateUUID()),
		Email:     registration.EmailAddress(props.Email),
		Status:    registration.StatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if props.ReferralSource != nil {
		referralSource := registration.ReferralSource(*props.ReferralSource)
		reg.ReferralSource = &referralSource
	}

	if err := r.db.Create(&reg).Error; err != nil {
		return nil, err
	}

	return &reg, nil
}

// UpdateStatus ステータスを更新
func (r *registrationRepositoryImpl) UpdateStatus(id registration.RegistrationID, status registration.RegistrationStatus) (*registration.Registration, error) {
	var reg registration.Registration

	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	if err := r.db.Model(&reg).Where("id = ?", id).Updates(updates).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, registration.ErrNotFound
		}
		return nil, err
	}

	// 更新されたデータを再取得
	if err := r.db.Where("id = ?", id).First(&reg).Error; err != nil {
		return nil, err
	}

	return &reg, nil
}

// Delete 仮登録を削除
func (r *registrationRepositoryImpl) Delete(id registration.RegistrationID) error {
	result := r.db.Where("id = ?", id).Delete(&registration.Registration{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return registration.ErrNotFound
	}
	return nil
}

// generateUUID UUIDを生成
func generateUUID() string {
	// crypto/randを使ってUUID v4形式の文字列を生成
	return time.Now().Format("20060102150405") + "-" + generateRandomString(8)
}

// generateRandomString ランダム文字列を生成
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(result)
}

package repositories

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"gyulist-api-go/internal/domain/entities/user"
	"gyulist-api-go/internal/domain/repositories"
)

// authRepositoryImpl PostgreSQLを使用したAuthRepository実装
type authRepositoryImpl struct {
	db *gorm.DB
}

// NewAuthRepository AuthRepositoryのコンストラクタ
func NewAuthRepository(db *gorm.DB) repositories.AuthRepository {
	return &authRepositoryImpl{
		db: db,
	}
}

// FindByID IDでユーザーを取得
func (r *authRepositoryImpl) FindByID(id user.UserID) (*user.User, error) {
	var u user.User
	if err := r.db.Where("id = ?", id).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

// FindByEmail メールアドレスでユーザーを取得
func (r *authRepositoryImpl) FindByEmail(email string) (*user.User, error) {
	var u user.User
	if err := r.db.Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

// FindByVerificationToken 検証トークンでユーザーを取得
func (r *authRepositoryImpl) FindByVerificationToken(token string) (*user.User, error) {
	var u user.User
	if err := r.db.Where("verification_token = ?", token).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

// FindByGoogleID Google IDでユーザーを取得
func (r *authRepositoryImpl) FindByGoogleID(googleID string) (*user.User, error) {
	var u user.User
	if err := r.db.Where("google_id = ?", googleID).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

// FindByLineID LINE IDでユーザーを取得
func (r *authRepositoryImpl) FindByLineID(lineID string) (*user.User, error) {
	var u user.User
	if err := r.db.Where("line_id = ?", lineID).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

// Create 新規ユーザーを作成（事前登録段階）
func (r *authRepositoryImpl) Create(props user.NewUserProps) (*user.User, error) {
	now := time.Now()

	u := user.User{
		UserName:          user.UserName(props.UserName),
		Email:             user.EmailAddress(props.Email),
		IsVerified:        false,
		OAuthProvider:     props.OAuthProvider,
		CreatedAt:         now,
		UpdatedAt:         now,
		VerificationToken: (*user.VerificationToken)(props.VerificationToken),
	}

	if props.PasswordHash != nil {
		passwordHash := user.PasswordHash(*props.PasswordHash)
		u.PasswordHash = &passwordHash
	}
	if props.GoogleID != nil {
		googleID := user.GoogleID(*props.GoogleID)
		u.GoogleID = &googleID
	}
	if props.LineID != nil {
		lineID := user.LineID(*props.LineID)
		u.LineID = &lineID
	}
	if props.AvatarUrl != nil {
		avatarUrl := user.AvatarUrl(*props.AvatarUrl)
		u.AvatarUrl = &avatarUrl
	}
	if props.Theme != nil {
		u.Theme = props.Theme
	}

	if err := r.db.Create(&u).Error; err != nil {
		return nil, err
	}

	return &u, nil
}

// CompleteRegistration ユーザー登録を完了
func (r *authRepositoryImpl) CompleteRegistration(token string, name string, passwordHash string) (*user.User, error) {
	var u user.User

	// トークンでユーザーを検索
	if err := r.db.Where("verification_token = ?", token).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}

	// 更新データ
	updates := map[string]interface{}{
		"user_name":          name,
		"password_hash":      passwordHash,
		"is_verified":        true,
		"verification_token": nil,
		"updated_at":         time.Now(),
	}

	if err := r.db.Model(&u).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 更新されたユーザーを再取得
	if err := r.db.Where("id = ?", u.ID).First(&u).Error; err != nil {
		return nil, err
	}

	return &u, nil
}

// UpdateVerificationToken 検証トークンを更新
func (r *authRepositoryImpl) UpdateVerificationToken(userID user.UserID, verificationToken string) (*user.User, error) {
	var u user.User

	updates := map[string]interface{}{
		"verification_token": verificationToken,
		"updated_at":         time.Now(),
	}

	if err := r.db.Model(&u).Where("id = ?", userID).Updates(updates).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}

	// 更新されたユーザーを再取得
	if err := r.db.Where("id = ?", userID).First(&u).Error; err != nil {
		return nil, err
	}

	return &u, nil
}

// UpdateLastLogin 最終ログイン日時を更新
func (r *authRepositoryImpl) UpdateLastLogin(userID user.UserID, loginTime time.Time) (*user.User, error) {
	var u user.User

	updates := map[string]interface{}{
		"last_login_at": loginTime,
		"updated_at":    time.Now(),
	}

	if err := r.db.Model(&u).Where("id = ?", userID).Updates(updates).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}

	// 更新されたユーザーを再取得
	if err := r.db.Where("id = ?", userID).First(&u).Error; err != nil {
		return nil, err
	}

	return &u, nil
}

// UpdateTheme ユーザーのテーマ設定を更新
func (r *authRepositoryImpl) UpdateTheme(userID user.UserID, theme user.Theme, updateTime time.Time) (*user.User, error) {
	var u user.User

	updates := map[string]interface{}{
		"theme":      theme,
		"updated_at": updateTime,
	}

	if err := r.db.Model(&u).Where("id = ?", userID).Updates(updates).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}

	// 更新されたユーザーを再取得
	if err := r.db.Where("id = ?", userID).First(&u).Error; err != nil {
		return nil, err
	}

	return &u, nil
}

// CreateOrUpdateOAuthUser OAuthユーザーを作成または更新
func (r *authRepositoryImpl) CreateOrUpdateOAuthUser(props user.NewUserProps) (*user.User, error) {
	now := time.Now()

	// OAuthプロバイダーに応じて検索条件を設定
	var findCondition map[string]interface{}
	var updateData map[string]interface{}

	if props.GoogleID != nil {
		findCondition = map[string]interface{}{"google_id": *props.GoogleID}
		updateData = map[string]interface{}{
			"user_name":      props.UserName,
			"email":          props.Email,
			"google_id":      *props.GoogleID,
			"oauth_provider": props.OAuthProvider,
			"avatar_url":     props.AvatarUrl,
			"is_verified":    true,
			"last_login_at":  now,
			"updated_at":     now,
		}
	} else if props.LineID != nil {
		findCondition = map[string]interface{}{"line_id": *props.LineID}
		updateData = map[string]interface{}{
			"user_name":      props.UserName,
			"email":          props.Email,
			"line_id":        *props.LineID,
			"oauth_provider": props.OAuthProvider,
			"avatar_url":     props.AvatarUrl,
			"is_verified":    true,
			"last_login_at":  now,
			"updated_at":     now,
		}
	} else {
		return nil, errors.New("Google IDまたはLINE IDが必要です")
	}

	if props.Theme != nil {
		updateData["theme"] = *props.Theme
	}

	var u user.User
	result := r.db.Where(findCondition).Assign(updateData).FirstOrCreate(&u)

	if result.Error != nil {
		return nil, result.Error
	}

	return &u, nil
}

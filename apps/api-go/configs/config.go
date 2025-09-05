package configs

import (
	"os"
	"strconv"
	"time"
)

// Config はアプリケーション全体の設定を保持します
type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Email    EmailConfig
	Log      LogConfig
}

// AppConfig はアプリケーションの基本設定
type AppConfig struct {
	Name    string
	Version string
	Env     string
	Port    int
	Debug   bool
}

// DatabaseConfig はデータベース設定
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
	TimeZone string
}

// RedisConfig はRedis設定
type RedisConfig struct {
	URL         string
	Password    string
	DB          int
	MaxRetries  int
	DialTimeout time.Duration
}

// JWTConfig はJWT設定
type JWTConfig struct {
	Secret          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	Issuer          string
	Audience        string
}

// EmailConfig はメール設定
type EmailConfig struct {
	APIKey string
	From   string
	WebURL string
}

// LogConfig はログ設定
type LogConfig struct {
	Level  string
	Format string
	Output string
}

// Load は環境変数から設定を読み込みます
func Load() *Config {
	return &Config{
		App: AppConfig{
			Name:    getEnv("APP_NAME", "gyulist-api-go"),
			Version: getEnv("APP_VERSION", "1.0.0"),
			Env:     getEnv("ENV", "development"),
			Port:    getEnvAsInt("PORT", 8080),
			Debug:   getEnvAsBool("DEBUG", true),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "gyulist"),
			Password: getEnv("DB_PASSWORD", "gyulist123"),
			Name:     getEnv("DB_NAME", "gyulist_dev"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			TimeZone: getEnv("DB_TIMEZONE", "Asia/Tokyo"),
		},
		Redis: RedisConfig{
			URL:         getEnv("REDIS_URL", "redis://localhost:6379"),
			Password:    getEnv("REDIS_PASSWORD", ""),
			DB:          getEnvAsInt("REDIS_DB", 0),
			MaxRetries:  getEnvAsInt("REDIS_MAX_RETRIES", 3),
			DialTimeout: getEnvAsDuration("REDIS_DIAL_TIMEOUT", "5s"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "your-secret-key"),
			AccessTokenTTL:  getEnvAsDuration("JWT_ACCESS_TTL", "15m"),
			RefreshTokenTTL: getEnvAsDuration("JWT_REFRESH_TTL", "24h"),
			Issuer:          getEnv("JWT_ISSUER", "gyulist-api-go"),
			Audience:        getEnv("JWT_AUDIENCE", "gyulist-client"),
		},
		Email: EmailConfig{
			APIKey: getEnv("RESEND_API_KEY", ""),
			From:   getEnv("MAIL_FROM", "noreply@gyulist.com"),
			WebURL: getEnv("WEB_URL", "http://localhost:3000"),
		},
		Log: LogConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
			Output: getEnv("LOG_OUTPUT", "stdout"),
		},
	}
}

// ヘルパー関数

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue string) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	if duration, err := time.ParseDuration(defaultValue); err == nil {
		return duration
	}
	return 0
}

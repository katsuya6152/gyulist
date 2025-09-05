package repositories

// HealthRepository はヘルスチェック関連のデータベース操作を定義するインターフェース
type HealthRepository interface {
	// CheckDatabaseConnection はデータベース接続状態を確認します
	CheckDatabaseConnection() error
}

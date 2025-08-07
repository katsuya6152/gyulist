-- OAuth対応のためのカラム追加
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN line_id TEXT;
ALTER TABLE users ADD COLUMN oauth_provider TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- セッション管理テーブルを作成
CREATE TABLE sessions (
	id TEXT PRIMARY KEY NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id),
	expires_at INTEGER NOT NULL,
	createdAt TEXT DEFAULT (CURRENT_TIMESTAMP)
); 
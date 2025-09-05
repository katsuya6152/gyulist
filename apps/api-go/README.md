# Gyulist API Go

Go言語で実装されたギュウリストAPIサーバーです。

## 🚀 クイックスタート

### 前提条件
- Go 1.23.0+
- Docker & Docker Compose
- Make

### 環境構築

1. **依存関係インストール**
```bash
go mod tidy
```

2. **Docker環境起動**
```bash
make docker-up
```

3. **開発サーバー起動**
```bash
make dev
```

4. **API確認**
```bash
curl http://localhost:8080/health
```

## 📁 プロジェクト構造

```
apps/api-go/
├── cmd/api/               # APIサーバーエントリーポイント
├── internal/              # プライベートコード
│   ├── application/       # アプリケーション層 (UseCase)
│   ├── domain/           # ドメイン層 (Entity, Service)
│   ├── infrastructure/   # インフラ層 (DB, Logger)
│   └── interfaces/       # インターフェース層 (HTTP, Repository)
├── configs/              # 設定ファイル
├── specs/                # OpenAPI仕様
├── tests/                # テストコード
├── Makefile              # ビルド・開発タスク
├── Dockerfile            # コンテナ定義
├── docker-compose.yml    # 開発環境
└── .air.toml            # Airホットリロード設定
```

## 🛠️ 利用可能なコマンド

```bash
# 開発
make dev          # Airホットリロードで開発サーバー起動
make run          # 通常のGo実行
make build        # アプリケーションをビルド

# テスト
make test         # 全テスト実行
make test-unit    # ユニットテストのみ
make test-coverage # カバレッジレポート付きテスト

# 品質管理
make lint         # golangci-lint実行
make fmt          # コードフォーマット
make mod-tidy     # go.mod整理

# コード生成
make wire-gen     # Google Wire依存性注入コード生成
make api-gen      # OpenAPIコード生成

# Docker
make docker-build # Dockerイメージビルド
make docker-up    # 全サービス起動
make docker-down  # 全サービス停止

# ユーティリティ
make clean        # ビルドファイル・キャッシュ削除
make help         # 利用可能なコマンド一覧表示
```

## 🔧 設定

### 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `APP_NAME` | gyulist-api-go | アプリケーション名 |
| `APP_VERSION` | 1.0.0 | バージョン |
| `ENV` | development | 環境 (development/production) |
| `PORT` | 8080 | サーバーポート |
| `DB_HOST` | localhost | データベースホスト |
| `DB_PORT` | 5432 | データベースポート |
| `DB_USER` | gyulist | データベースユーザー |
| `DB_PASSWORD` | gyulist123 | データベースパスワード |
| `DB_NAME` | gyulist_dev | データベース名 |
| `JWT_SECRET` | your-secret-key | JWTシークレット |
| `REDIS_URL` | redis://localhost:6379 | Redis接続URL |
| `RESEND_API_KEY` | "" | ResendメールサービスAPIキー |
| `MAIL_FROM` | noreply@gyulist.com | メール送信元アドレス |
| `WEB_URL` | http://localhost:3000 | WebアプリケーションURL |
| `GOOGLE_CLIENT_ID` | "" | Google OAuthクライアントID |
| `GOOGLE_CLIENT_SECRET` | "" | Google OAuthクライアントシークレット |
| `GOOGLE_REDIRECT_URI` | http://localhost:8080/api/v1/oauth/google/callback | Google OAuthリダイレクトURI |

### Docker Composeサービス

- **api**: Go APIサーバー (Airホットリロード)
- **db**: PostgreSQLデータベース
- **redis**: Redis (セッション/キャッシュ)
- **pgadmin**: PostgreSQL管理ツール (オプション)

## 🧪 テスト

### テスト実行
```bash
# 全テスト
make test

# カバレッジレポート
make test-coverage

# ユニットテストのみ
make test-unit

# 統合テスト
make test-integration
```

### テスト構成
- **ユニットテスト**: `tests/unit/` - 個別コンポーネントテスト
- **統合テスト**: `tests/integration/` - DB操作を含むテスト
- **E2Eテスト**: `tests/e2e/` - HTTPリクエスト/レスポンステスト

## 📊 監視・ログ

### ログレベル
- `DEBUG`: 詳細なデバッグ情報
- `INFO`: 一般的な情報
- `WARN`: 警告
- `ERROR`: エラー

### ログフォーマット
- `json`: JSON形式 (本番環境推奨)
- `console`: コンソール形式 (開発環境)

### ヘルスチェック
```bash
curl http://localhost:8080/health
```

## 🔒 セキュリティ

- JWT認証 (Access Token + Refresh Token)
- bcryptパスワードハッシュ
- CORS設定
- HTTPSリダイレクト (本番環境)
- レート制限 (将来拡張)

## 🚀 デプロイ

### 開発環境
```bash
make docker-up
make dev
```

### 本番環境
```bash
# Dockerイメージビルド
make docker-build

# コンテナ実行
docker run -p 8080:8080 gyulist-api-go
```

## 📚 API仕様

### エンドポイント
- `GET /health` - ヘルスチェック
- `POST /api/v1/auth/login` - ログイン (今後実装)
- その他APIエンドポイントは `specs/` 配下のOpenAPI定義を参照

### OpenAPI仕様
```bash
# OpenAPIコード生成
make api-gen
```

## 🤝 開発ガイドライン

### コミットメッセージ
```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

### コード品質
- `make lint` で品質チェック
- `make fmt` でコードフォーマット
- テストカバレッジ80%以上を目指す

### アーキテクチャ
- **クリーンアーキテクチャ**採用
- **依存性注入** (Google Wire使用)
- **レイヤード構成** (Interface → Application → Domain → Infrastructure)

---

## 📝 次のステップ

1. **ログインAPI実装**
   - JWTトークン管理
   - パスワード認証
   - ユーザー管理

2. **データベース接続**
   - GORM設定
   - マイグレーション
   - リポジトリ実装

3. **ミドルウェア実装**
   - 認証ミドルウェア
   - エラーハンドリング
   - リクエストログ

4. **テスト実装**
   - ユニットテスト
   - 統合テスト
   - E2Eテスト

詳細は [Go API移行ガイド](../../docs/architecture/go-api-migration.md) を参照してください。

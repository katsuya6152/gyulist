# Go API 移行ガイド

## 概要

現行のHono (TypeScript) APIをGo APIに段階的に移行するプロジェクトです。
初回フェーズではログインAPIのみを対象とし、将来的に全APIエンドポイントの移行を目指します。

## 技術スタック

### 🏗️ **コア技術**

#### **プログラミング言語 & フレームワーク**
- **Go**: 1.23.0
  - Gin Web Framework (v1.10.1) - HTTPルーター
  - GORM (v1.30.2) - ORMライブラリ
  - Google Wire (v0.7.0) - 依存性注入

#### **データベース**
- **PostgreSQL**: lib/pq (v1.10.9) ドライバー使用
- **GORM PostgreSQL Driver** (v1.6.0)

#### **認証・セキュリティ**
- **JWT**: golang-jwt/jwt (v5.3.0)
- **bcrypt**: golang.org/x/crypto (v0.41.0)

### 🧪 **テスト・品質管理**

#### **テストフレームワーク**
- **Testify**: ユニットテスト・アサーション (v1.11.1)
- **TestContainers**: 統合テスト用コンテナ管理
  - PostgreSQLテストコンテナ (v0.27.0)

#### **Lint・コード品質**
- **golangci-lint**: Goコード品質チェック

### 📊 **監視・ログ**

#### **ログ**
- **Zap**: 高性能構造化ログ (v1.26.0)

### 🔧 **開発ツール**

#### **ホットリロード**
- **Air**: 開発時自動再ビルド (v1.52.3)

#### **OpenAPIツール**
- **oapi-codegen**: OpenAPI仕様からGoコード生成 (v2.5.0)
- **Redocly CLI**: OpenAPI仕様検証・統合 (Dockerコンテナ使用)

### 🐳 **コンテナ化・インフラ**

#### **コンテナ化**
- **Docker**: マルチステージビルド
  - 本番用: Alpine Linuxベース
  - 開発用: Air統合ホットリロード
- **Docker Compose**: 開発・テスト環境管理

### 📋 **API仕様管理**

#### **OpenAPI仕様**
- **分割型OpenAPI**: specs/src/ 配下に分割管理
- **バンドル統合**: Redocly CLIによる統合
- **コード生成**: oapi-codegenによる型・ハンドラー生成

### 🏭 **ビルド・CI/CD**

#### **ビルドツール**
- **Make**: タスク自動化 (Makefile)
- **Go Modules**: 依存関係管理

## 移行アプローチ

### 段階的移行戦略

1. **フェーズ1**: ログインAPIのみ移行 (本プロジェクト)
2. **フェーズ2**: ユーザー関連API追加
3. **フェーズ3**: 家畜管理API移行
4. **フェーズ4**: 残りの全API移行
5. **フェーズ5**: Hono API完全廃止

### 並行稼働期間
- 新旧APIを並行稼働させ、段階的にトラフィックを移行
- Webフロントエンドは設定により新旧APIを切り替え可能

## 開発環境構築

### 前提条件
- Go 1.23.0+
- Docker & Docker Compose
- Make
- golangci-lint

### 環境構築手順

```bash
# 1. Go 1.23.0インストール
# 2. プロジェクトルートで依存関係インストール
cd apps/api-go
go mod download

# 3. Docker環境構築
make docker-build
make docker-up

# 4. 開発用ホットリロード起動
make dev

# 5. テスト実行
make test
```

### Docker Compose構成
- **api**: Go APIサーバー (開発時はAirでホットリロード)
- **db**: PostgreSQLデータベース
- **redis**: セッション/キャッシュ用 (将来拡張用)

## プロジェクト構造

```
apps/api-go/
├── cmd/
│   ├── api/           # APIサーバーエントリーポイント
│   └── batch/         # バッチ処理エントリーポイント
├── internal/
│   ├── application/   # アプリケーション層 (UseCase)
│   │   └── auth/      # 認証関連ユースケース
│   ├── domain/        # ドメイン層 (Entity, Value Object)
│   │   ├── models/    # ドメインモデル
│   │   └── services/  # ドメインサービス
│   ├── infrastructure/ # インフラストラクチャ層
│   │   ├── database/  # DB接続・マイグレーション
│   │   ├── auth/      # JWT・bcrypt実装
│   │   └── logger/    # Zapロガー設定
│   └── interfaces/    # インターフェース層
│       ├── handlers/  # HTTPハンドラー
│       ├── middleware/# ミドルウェア
│       └── repositories/ # リポジトリ実装
├── configs/           # 設定ファイル
├── specs/             # OpenAPI仕様
│   ├── src/           # 分割型OpenAPIファイル
│   └── gen/           # 生成コード
├── tests/             # テストコード
│   ├── unit/          # ユニットテスト
│   ├── integration/   # 統合テスト
│   └── mocks/         # モック
├── docs/              # APIドキュメント
├── go.mod
├── go.sum
├── Makefile           # ビルド・開発タスク
├── Dockerfile         # マルチステージビルド
├── docker-compose.yml # 開発環境
└── .air.toml          # Air設定
```

## ログインAPI実装計画

### エンドポイント設計

#### POST /api/v1/auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "ユーザー名"
  }
}
```

### 実装コンポーネント

#### 1. ドメインモデル (`internal/domain/models/`)
- `User`: ユーザーモデル
- `AuthToken`: 認証トークンモデル

#### 2. リポジトリ (`internal/interfaces/repositories/`)
- `UserRepository`: ユーザー永続化
- `AuthRepository`: 認証関連永続化

#### 3. ユースケース (`internal/application/auth/`)
- `LoginUseCase`: ログイン処理
- `TokenRefreshUseCase`: トークンリフレッシュ

#### 4. ハンドラー (`internal/interfaces/handlers/`)
- `AuthHandler`: 認証APIエンドポイント

#### 5. ミドルウェア (`internal/interfaces/middleware/`)
- `AuthMiddleware`: JWT認証ミドルウェア
- `CORSMiddleware`: CORS設定

### 依存性注入 (Google Wire)

```go
// internal/wire/wire.go
func InitializeAuthHandler() *handlers.AuthHandler {
    wire.Build(
        // Repository層
        repositories.NewUserRepository,
        repositories.NewAuthRepository,

        // Domain Service層
        services.NewAuthService,

        // Application層
        usecases.NewLoginUseCase,
        usecases.NewTokenRefreshUseCase,

        // Interface層
        handlers.NewAuthHandler,

        // Infrastructure層
        database.NewDB,
        auth.NewJWTManager,
        auth.NewPasswordHasher,
    )
    return &handlers.AuthHandler{}
}
```

## テスト戦略

### ユニットテスト
- **対象**: 各レイヤーの個別コンポーネント
- **ツール**: Testify
- **カバレッジ目標**: 80%以上

### 統合テスト
- **対象**: APIエンドポイント全体
- **ツール**: TestContainers + Testify
- **内容**: DB操作を含むテスト

### E2Eテスト
- **対象**: 実際のHTTPリクエスト/レスポンス
- **ツール**: 既存のPlaywrightテストを拡張

## 品質管理

### コード品質チェック
```bash
# ローカル実行
make lint

# CI/CDでの自動実行
golangci-lint run
```

### テスト実行
```bash
# 全テスト実行
make test

# カバレッジレポート
make test-coverage

# 統合テストのみ
make test-integration
```

## 移行手順

### Phase 1: ログインAPI移行

#### ステップ1: 環境構築
```bash
# 1. Goプロジェクト初期化
cd apps/
mkdir api-go
cd api-go
go mod init github.com/your-org/gyulist/api-go

# 2. 依存関係インストール
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/postgres
# ... その他の依存関係
```

#### ステップ2: プロジェクト構造作成
```bash
# ディレクトリ構造作成
mkdir -p cmd/api internal/{application/auth,domain/{models,services},infrastructure/{database,auth,logger},interfaces/{handlers,middleware,repositories}} configs specs/{src,gen} tests/{unit,integration,mocks}
```

#### ステップ3: 設定ファイル作成
- `configs/config.go`: 環境設定
- `Makefile`: ビルドタスク
- `Dockerfile`: コンテナ定義
- `docker-compose.yml`: 開発環境
- `.air.toml`: ホットリロード設定

#### ステップ4: データベース層実装
- GORM設定
- PostgreSQL接続
- マイグレーションファイル

#### ステップ5: 認証基盤実装
- JWTトークン管理
- bcryptパスワードハッシュ
- ログインロジック

#### ステップ6: APIエンドポイント実装
- Ginルーター設定
- ログインハンドラー
- ミドルウェア実装

#### ステップ7: テスト実装
- ユニットテスト
- 統合テスト
- テストコンテナ設定

#### ステップ8: ドキュメント更新
- OpenAPI仕様更新
- APIドキュメント生成

### Phase 2: トラフィック移行

#### ステップ9: 並行稼働テスト
- 新旧APIの並行稼働
- トラフィック分散設定
- 監視・ログ分析

#### ステップ10: 本番デプロイ
- Dockerイメージビルド
- Kubernetesマニフェスト作成
- 段階的トラフィック移行

## 注意点・考慮事項

### セキュリティ
- JWTトークンの安全な管理
- パスワードの適切なハッシュ化
- SQLインジェクション対策
- CORS設定の見直し

### パフォーマンス
- データベース接続プールの最適化
- ログレベルの適切な設定
- メモリ使用量の監視

### 互換性
- APIレスポンス形式の統一
- エラーレスポンスの統一
- ステータスコードの統一

### 運用
- ログフォーマットの統一
- ヘルスチェックエンドポイント
- メトリクス収集

### 移行リスク
- データ移行時の整合性確保
- ダウンタイムの最小化
- ロールバック計画の策定

## 次のステップ

1. **環境構築**: Go開発環境の準備
2. **プロジェクト初期化**: 基本構造の実装
3. **データベース接続**: PostgreSQL設定
4. **認証基盤**: JWT/bcrypt実装
5. **ログインAPI**: エンドポイント実装
6. **テスト**: 包括的なテスト作成
7. **ドキュメント**: OpenAPI仕様更新

---

*最終更新: 2024年12月*

# Go API Makefile

.PHONY: help build run test clean docker-build docker-up docker-down dev lint fmt mod-tidy wire-gen spec-build-gen api-gen

# デフォルトターゲット
help: ## 利用可能なコマンドを表示
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# 開発環境
dev: ## 開発サーバーを起動 (Airホットリロード)
	~/go/bin/air

run: ## 通常のGo実行
	go run cmd/api/main.go

build: ## アプリケーションをビルド
	go build -o bin/api cmd/api/main.go

# テスト
test: ## 全テストを実行
	go test ./...

test-unit: ## ユニットテストのみ実行
	go test ./tests/unit/...

test-integration: ## 統合テストを実行
	go test ./tests/integration/...

test-coverage: ## カバレッジレポート付きテスト
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# 品質管理
lint: ## golangci-lintを実行
	~/go/bin/golangci-lint run

fmt: ## コードフォーマット
	go fmt ./...
	gofmt -s -w .

mod-tidy: ## go.modを整理
	go mod tidy

# コード生成
wire-gen: ## Google Wire依存性注入コード生成
	~/go/bin/wire gen ./internal/...

spec-build-gen: ## OpenAPI仕様をビルド（lint → bundle → codegen）
	@echo "🔍 OpenAPI仕様のlintチェック..."
	redocly lint specs/src/index.yaml
	@echo "📦 OpenAPI仕様のバンドル..."
	redocly bundle specs/src/index.yaml --output specs/bundled.yaml
	@echo "⚙️  OpenAPIコード生成..."
	make api-gen

api-gen: ## OpenAPIコード生成
	~/go/bin/oapi-codegen -config specs/oapi-codegen-config.yaml specs/bundled.yaml

# Docker
docker-build: ## Dockerイメージをビルド
	docker build -t gyulist-api-go .

docker-up: ## Docker Composeで全サービス起動
	docker-compose up -d

docker-down: ## Docker Composeで全サービス停止
	docker-compose down

docker-logs: ## Dockerログを表示
	docker-compose logs -f api

# データベース
db-migrate: ## データベースマイグレーション実行
	go run cmd/migrate/main.go

db-reset: ## データベースをリセット
	docker-compose down -v
	docker-compose up -d db
	sleep 5
	make db-migrate

# クリーンアップ
clean: ## ビルドファイルとキャッシュを削除
	rm -rf bin/
	rm -rf tmp/
	go clean -cache
	go clean -testcache

# CI/CD
ci: mod-tidy fmt lint test ## CIで実行するタスク群

# 環境別実行
run-prod: ## 本番環境で実行
	ENV=production go run cmd/api/main.go

run-staging: ## ステージング環境で実行
	ENV=staging go run cmd/api/main.go

# ヘルスチェック
health: ## ヘルスチェック
	curl -f http://localhost:8080/health || exit 1

# ログ
logs: ## アプリケーションのログを表示
	tail -f logs/app.log

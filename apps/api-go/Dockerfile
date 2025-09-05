# ビルドステージ
FROM golang:1.25-alpine AS builder

# 作業ディレクトリ設定
WORKDIR /app

# Goモジュールファイルのコピー
COPY go.mod go.sum ./

# 依存関係のダウンロード
RUN go mod download

# ソースコードのコピー
COPY . .

# アプリケーションのビルド
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/api/main.go

# 実行ステージ (本番用)
FROM alpine:latest AS production

# タイムゾーン設定
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Tokyo

WORKDIR /root/

# ビルド済みバイナリのコピー
COPY --from=builder /app/main .

# ポート8080を公開
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 実行
CMD ["./main"]

# 開発用ステージ
FROM golang:1.25-alpine AS development

# Airのインストール
RUN go install github.com/air-verse/air@latest

# 作業ディレクトリ設定
WORKDIR /app

# ソースコードのコピー
COPY . .

# Air設定ファイルの存在確認
RUN ls -la .air.toml || echo "Warning: .air.toml not found"

# 開発用コマンド
CMD ["air", "-c", ".air.toml"]

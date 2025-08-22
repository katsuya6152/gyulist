# バッチ処理の使用方法

Gyulist APIのバッチ処理をローカルで実行する方法を説明します。

## 前提条件

1. ローカルでAPIサーバーが起動していること
2. ローカルデータベースが設定されていること

## 起動方法

### 1. ローカル開発サーバーの起動

```bash
pnpm run batch:dev
```

これにより、`http://localhost:8787`でローカルAPIサーバーが起動します。

## バッチ処理の実行

### 2. 全バッチ処理の実行（推奨）

```bash
pnpm run batch:manual
```

または

```bash
pnpm run batch:test
```

**エンドポイント**: `GET /cron/batch`

**説明**: 繁殖状態、繁殖サマリー、アラート更新の全バッチ処理を順次実行します。

### 3. 個別バッチ処理の実行

#### 繁殖状態のバッチ計算

```bash
pnpm run batch:breeding-status
```

**エンドポイント**: `POST /api/v1/batch/breeding-status`

**説明**: 繁殖状態（daysAfterCalving、pregnancyDays等）を更新します。

#### 繁殖サマリーのバッチ計算

```bash
pnpm run batch:breeding-summary
```

**エンドポイント**: `POST /api/v1/batch/breeding-summary`

**説明**: 繁殖統計情報（受胎率、平均妊娠期間等）を計算・更新します。

#### 全バッチ処理（API経由）

```bash
pnpm run batch:all
```

**エンドポイント**: `POST /api/v1/batch/all`

**説明**: 繁殖状態と繁殖サマリーの両方を順次実行します。

## パラメータのカスタマイズ

各バッチ処理は以下のクエリパラメータをサポートしています：

- **limit**: 一度に処理する件数（1-1000、デフォルト: 100）
- **offset**: 処理開始位置（0以上、デフォルト: 0）
- **force**: 強制更新フラグ（true/false、デフォルト: false）

### 例：カスタムパラメータでの実行

```bash
# 1000件ずつ処理、強制更新あり
curl -X POST 'http://localhost:8787/api/v1/batch/breeding-status?limit=1000&force=true'

# 500件ずつ処理、オフセット100から開始
curl -X POST 'http://localhost:8787/api/v1/batch/breeding-summary?limit=500&offset=100'
```

## レスポンス形式

### 成功時のレスポンス

```json
{
  "success": true,
  "message": "Batch calculations completed",
  "breedingStatus": {
    "processedCount": 100,
    "updatedCount": 25,
    "errors": []
  },
  "breedingSummary": {
    "processedCount": 100,
    "updatedCount": 30,
    "errors": []
  },
  "alerts": {
    "processedCount": 5,
    "updatedCount": 2,
    "createdCount": 1,
    "resolvedCount": 0,
    "errors": 0
  },
  "duration": "1250ms",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### エラー時のレスポンス

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 注意事項

1. **データベース接続**: ローカルデータベースが正しく設定されていることを確認してください
2. **処理時間**: データ量に応じて処理時間が変動します
3. **エラーハンドリング**: エラーが発生した場合は、ログを確認して原因を特定してください
4. **強制更新**: `force=true`を使用する場合は、データの整合性に注意してください

## トラブルシューティング

### よくある問題

1. **接続エラー**: ローカルサーバーが起動しているか確認
2. **データベースエラー**: マイグレーションが適用されているか確認
3. **認証エラー**: バッチエンドポイントは認証不要ですが、個別エンドポイントはBasic認証が必要

### ログの確認

```bash
# サーバーログの確認
pnpm run batch:dev

# 個別エンドポイントのテスト
curl -v -X POST 'http://localhost:8787/api/v1/batch/breeding-status'
```

## 本番環境

本番環境では、Cloudflare Workers Cronにより毎日午前2時（JST）に自動実行されます。

**Cron設定**: `0 17 * * *` (UTC 17:00 = JST 02:00)

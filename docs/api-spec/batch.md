# バッチ処理API ビジネスロジック仕様

## 概要

繁殖状態とサマリーの計算をバッチ処理で実行するAPIです。毎日計算が必要な値（daysAfterCalving、pregnancyDays、受胎率等）を自動的に更新します。

## 認証・認可

- **認証方式**: Basic認証（管理者のみ）
- **権限**: 管理者のみアクセス可能
- **エンドポイント**: `/api/v1/batch/*`

## 依存関係

- `BreedingRepoPort`: 繁殖データの管理
- `BatchCalculationDeps`: バッチ計算の依存関係
- `BasicAuthMiddleware`: 管理者認証
- `Logger`: 操作ログ出力

## コアワークフロー

### 1. 繁殖状態のバッチ計算

```typescript
POST /batch/breeding-status
  ↓
  authenticateBasicAuth(request)
  ↓
  validateQueryParameters(query)
  ↓
  logBatchRequest("breeding_status", queryParams)
  ↓
  calculateBreedingStatusBatch(deps)(input)
  ↓
  findCattleNeedingAttention(userId, currentTime)
  ↓
  for each cattle:
    findByCattleId(cattleId)
    ↓
    checkUpdateNeeded(lastUpdated, force)
    ↓
    getBreedingHistory(cattleId)
    ↓
    updateBreedingAggregate(aggregate, currentTime)
    ↓
    save(updatedAggregate)
  ↓
  return {
    processedCount,
    updatedCount,
    errors
  }
```

**ビジネスルール**:
- 管理者認証が必要
- 24時間以内に更新された牛はスキップ（force=trueの場合は除く）
- エラーが発生しても他の牛の処理は継続
- ページネーション対応（limit/offset）

### 2. 繁殖サマリーのバッチ計算

```typescript
POST /batch/breeding-summary
  ↓
  authenticateBasicAuth(request)
  ↓
  validateQueryParameters(query)
  ↓
  logBatchRequest("breeding_summary", queryParams)
  ↓
  calculateBreedingSummaryBatch(deps)(input)
  ↓
  findCattleNeedingAttention(userId, currentTime)
  ↓
  for each cattle:
    findByCattleId(cattleId)
    ↓
    getBreedingHistory(cattleId)
    ↓
    checkUpdateNeeded(lastUpdated, force)
    ↓
    recalculateBreedingSummary(history)
    ↓
    save(updatedAggregate)
  ↓
  return {
    processedCount,
    updatedCount,
    errors
  }
```

**ビジネスルール**:
- 管理者認証が必要
- 繁殖イベント履歴に基づいて統計を再計算
- 24時間以内に更新された牛はスキップ（force=trueの場合は除く）
- エラーが発生しても他の牛の処理は継続

### 3. 全バッチ処理の実行

```typescript
POST /batch/all
  ↓
  authenticateBasicAuth(request)
  ↓
  validateQueryParameters(query)
  ↓
  logBatchRequest("all", queryParams)
  ↓
  calculateBreedingStatusBatch(deps)(input)
  ↓
  calculateBreedingSummaryBatch(deps)(input)
  ↓
  return {
    breedingStatus: { processedCount, updatedCount, errors },
    breedingSummary: { processedCount, updatedCount, errors },
    duration
  }
```

**ビジネスルール**:
- 繁殖状態とサマリーの両方を順次実行
- 実行時間の計測
- 各処理の結果を個別に返却

## クエリパラメータ

### 共通パラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|----|------|-----------|------|
| `limit` | number | 否 | 100 | 一度に処理する牛の数（1-1000） |
| `offset` | number | 否 | 0 | 処理開始位置 |
| `force` | boolean | 否 | false | 強制更新フラグ |

### 使用例

```bash
# 基本実行
curl -X POST "https://api.gyulist.com/api/v1/batch/breeding-status" \
  -H "Authorization: Basic <base64-encoded-credentials>"

# パラメータ指定
curl -X POST "https://api.gyulist.com/api/v1/batch/breeding-status?limit=50&offset=100&force=true" \
  -H "Authorization: Basic <base64-encoded-credentials>"

# 全処理実行
curl -X POST "https://api.gyulist.com/api/v1/batch/all?limit=200" \
  -H "Authorization: Basic <base64-encoded-credentials>"
```

## レスポンス形式

### 成功レスポンス

```json
{
  "data": {
    "message": "Breeding status batch calculation completed",
    "processedCount": 150,
    "updatedCount": 45,
    "errors": [
      {
        "cattleId": 123,
        "error": "Breeding aggregate not found"
      }
    ],
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### 全処理実行のレスポンス

```json
{
  "data": {
    "message": "All batch calculations completed",
    "breedingStatus": {
      "processedCount": 150,
      "updatedCount": 45,
      "errors": []
    },
    "breedingSummary": {
      "processedCount": 150,
      "updatedCount": 32,
      "errors": []
    },
    "duration": "2.5s",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## エラーハンドリング

### バリデーションエラー

```json
{
  "error": "Invalid query parameters"
}
```

### 処理エラー

```json
{
  "error": {
    "type": "InfraError",
    "message": "Failed to calculate breeding status batch",
    "cause": "Database connection failed"
  }
}
```

## 定期実行（Cron）

### Cloudflare Workers Cron設定

```json
{
  "triggers": {
    "crons": [
      "0 2 * * *" // 毎日午前2時に実行
    ]
  }
}
```

### Cronエンドポイント

```typescript
GET /cron/batch
  ↓
  calculateBreedingStatusBatch(deps)({ limit: 100, offset: 0, force: false })
  ↓
  calculateBreedingSummaryBatch(deps)({ limit: 100, offset: 0, force: false })
  ↓
  return success response
```

**特徴**:
- 認証不要（Cloudflare Workers内部からの呼び出し）
- 固定パラメータで実行
- エラー時はログ出力のみ（再試行はCloudflare側で管理）

## パフォーマンス考慮事項

### 処理制限

- **一度に処理する牛の数**: 最大1000頭
- **タイムアウト**: Cloudflare Workers制限（10ms/50ms）
- **メモリ使用量**: 128MB制限

### 最適化戦略

1. **ページネーション**: 大量データを分割処理
2. **スキップ機能**: 24時間以内の更新はスキップ
3. **エラー分離**: 個別エラーで全体処理を停止しない
4. **並列処理**: 将来的に複数Workerでの並列実行を検討

## 監視・ログ

### 構造化ログ

```typescript
logger.info("Breeding status batch calculation started", {
  limit: 100,
  offset: 0,
  force: false,
  endpoint: "/batch/breeding-status"
});

logger.info("Breeding status batch calculation completed", {
  processedCount: 150,
  updatedCount: 45,
  errors: 2,
  endpoint: "/batch/breeding-status"
});
```

### メトリクス

- 処理件数
- 更新件数
- エラー件数
- 実行時間
- 成功率

## セキュリティ

### アクセス制御

- Basic認証による管理者限定アクセス
- 本番環境ではHTTPS必須
- レート制限の適用（将来的に実装）

### データ保護

- 個人情報の適切な取り扱い
- ログでの機密情報出力禁止
- エラー詳細の外部露出防止

## 運用ガイドライン

### 定期実行

1. **毎日午前2時**: 自動実行
2. **手動実行**: 管理者が必要に応じて実行
3. **監視**: ログとメトリクスで正常性確認

### トラブルシューティング

1. **エラー率の監視**: 5%以上でアラート
2. **実行時間の監視**: 30秒以上でアラート
3. **更新件数の監視**: 異常に少ない場合は調査

### メンテナンス

1. **定期的なパフォーマンス確認**
2. **エラーログの分析**
3. **処理件数の調整**

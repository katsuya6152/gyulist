# 管理API ビジネスロジック仕様

## 概要

システム管理者向けの管理機能を提供するAPIです。事前登録データの管理、CSVエクスポート、システム監視などの機能を提供します。

## 認証・認可

- **認証方式**: Basic認証
- **権限**: 管理者のみアクセス可能
- **エンドポイント**: `/api/v1/admin/*`

## 依存関係

- `RegistrationRepoPort`: 事前登録データの管理
- `BasicAuthMiddleware`: 管理者認証
- `CsvBuilder`: CSVデータ生成
- `Logger`: 操作ログ出力

## コアワークフロー

### 1. 事前登録一覧取得

```typescript
GET /admin/registrations
  ↓
  authenticateBasicAuth(request)
  ↓
  validateQueryParameters(query)
  ↓
  logAdminRequest("registrations_list", queryParams)
  ↓
  listRegistrationsUseCase({ repo })(queryParams)
  ↓
  searchRegistrations(queryParams)
  ↓
  applyPagination(results, queryParams)
  ↓
  setJsonHeaders(response)
  ↓
  return {
    items: registrations,
    total: totalCount
  }
```

**ビジネスルール**:
- 管理者認証が必要
- クエリパラメータによる検索・フィルタリング
- ページネーション対応
- JSON形式でのレスポンス

### 2. 事前登録CSVエクスポート

```typescript
GET /admin/registrations.csv
  ↓
  authenticateBasicAuth(request)
  ↓
  validateQueryParameters(query)
  ↓
  logAdminRequest("registrations_csv_export", queryParams)
  ↓
  listRegistrationsUseCase({ repo })(queryParams)
  ↓

  searchRegistrations(queryParams)
  ↓
  transformToCsvFormat(registrations)
  ↓
  setCsvHeaders(response, filename)
  ↓
  return csv_data
```

**ビジネスルール**:
- 管理者認証が必要
- クエリパラメータによる検索・フィルタリング
- CSV形式でのレスポンス
- 適切なファイル名設定

## 管理者認証

### Basic認証処理

```typescript
authenticateBasicAuth: (request: Request) => AdminUser
  ↓
  extractBasicAuthHeader(request)
  ↓
  decodeBase64Credentials(credentials)
  ↓
  validateAdminCredentials(username, password)
  ↓
  if (invalid_credentials) return UnauthorizedError
  ↓
  return adminUser
```

**認証ルール**:
- 環境変数から管理者認証情報を取得
- Base64エンコードされた認証情報をデコード
- ユーザー名とパスワードの検証

### 認証情報の管理

```typescript
// 環境変数からの認証情報取得
const adminCredentials = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
}

// 認証情報の検証
validateAdminCredentials: (username: string, password: string) => boolean
  ↓
  if (!adminCredentials.username || !adminCredentials.password) return false
  ↓
  if (username !== adminCredentials.username) return false
  ↓
  if (password !== adminCredentials.password) return false
  ↓
  return true
```

## データ検索・フィルタリング

### クエリパラメータの検証

```typescript
validateQueryParameters: (query: Record<string, string>) => RegistrationQuery
  ↓
  const parsed = registrationQuerySchema.safeParse(query)
  ↓
  if (!parsed.success) return ValidationError
  ↓
  return parsed.data
```

**検証項目**:
- 日付範囲の妥当性
- ステータス値の妥当性
- ページネーションパラメータの妥当性

### 検索条件の適用

```typescript
searchRegistrations: (query: RegistrationQuery) => RegistrationList
  ↓
  buildSearchQuery(query)
  ↓
  executeSearchQuery(searchQuery)
  ↓
  applyFilters(results, query.filters)
  ↓
  return filteredResults
```

**検索条件**:
- 日付範囲（作成日、更新日）
- ステータス
- メールアドレス（部分一致）
- 紹介元

## CSVエクスポート

### CSVデータ生成

```typescript
transformToCsvFormat: (registrations: Registration[]) => string
  ↓
  const csvBuilder = new CsvBuilder([
    "id",
    "email",
    "referral_source",
    "status",
    "locale",
    "created_at",
    "updated_at"
  ])
  ↓
  for (const registration of registrations) {
    csvBuilder.addRow([
      registration.id,
      registration.email,
      registration.referralSource,
      registration.status,
      registration.locale,
      formatDate(registration.createdAt),
      formatDate(registration.updatedAt)
    ])
  }
  ↓
  return csvBuilder.build()
```

**CSV項目**:
- 登録ID
- メールアドレス
- 紹介元
- ステータス
- ロケール
- 作成日時
- 更新日時

### ファイル名生成

```typescript
generateCsvFilename: (query: RegistrationQuery) => string
  ↓
  const timestamp = formatDateForFilename(new Date())
  ↓
  const filters = buildFilterDescription(query)
  ↓
  return `registrations_${filters}_${timestamp}.csv`
```

**ファイル名形式**:
- `registrations_[フィルタ説明]_[タイムスタンプ].csv`
- 例: `registrations_confirmed_2024-01-15.csv`

## レスポンスヘッダー設定

### JSONレスポンスヘッダー

```typescript
setJsonHeaders: (response: Response) => void
  ↓
  response.headers.set("Content-Type", "application/json")
  response.headers.set("Cache-Control", "no-cache")
  response.headers.set("X-Content-Type-Options", "nosniff")
```

### CSVレスポンスヘッダー

```typescript
setCsvHeaders: (response: Response, filename: string) => void
  ↓
  response.headers.set("Content-Type", "text/csv; charset=utf-8")
  response.headers.set("Content-Disposition", `attachment; filename="${filename}"`)
  response.headers.set("Cache-Control", "no-cache")
  response.headers.set("X-Content-Type-Options", "nosniff")
```

## エラーハンドリング

### 管理APIエラー

```typescript
type AdminApiError = 
  | UnauthorizedError
  | ValidationError
  | NotFoundError
  | InfraError
```

### エラー処理

```typescript
handleAdminError: (error: AdminApiError) => HTTPResponse
  ↓
  switch (error.type)
    case "UnauthorizedError": return 401_Unauthorized
    case "ValidationError": return 400_BadRequest
    case "NotFoundError": return 404_NotFound
    case "InfraError": return 500_InternalServerError
```

### バリデーションエラー処理

```typescript
handleValidationError: (error: ValidationError) => HTTPResponse
  ↓
  return {
    status: 400,
    body: {
      ok: false,
      code: "VALIDATION_FAILED",
      issues: error.issues
    }
  }
```

## 監査・運用

### 管理者操作ログ

```typescript
// 管理者リクエストログ
logAdminRequest: (operation: string, details: Record<string, unknown>) => void
  ↓
  recordAdminEvent({
    timestamp: now(),
    operation,
    details,
    ip: extractClientIP(request),
    userAgent: extractUserAgent(request)
  })
```

**ログ項目**:
- 操作タイプ（一覧取得、CSVエクスポート）
- クエリパラメータ
- リクエスト元IPアドレス
- ユーザーエージェント
- 処理結果

### セキュリティ監視

```typescript
// 管理者認証失敗の監視
monitorAdminAuthFailures: (authAttempt: AuthAttempt) => void
  ↓
  const recentFailures = getRecentAuthFailures(authAttempt.ip)
  ↓
  if (recentFailures.length > threshold) {
    blockIP(authAttempt.ip)
    logSecurityEvent("ADMIN_IP_BLOCKED", authAttempt.ip)
  }
```

### パフォーマンス監視

```typescript
// 管理API処理時間の監視
monitorAdminApiPerformance: (operation: string, startTime: number) => void
  ↓
  const endTime = performance.now()
  const duration = endTime - startTime
  ↓
  recordPerformanceMetric({
    operation: `admin_${operation}`,
    duration,
    timestamp: now()
  })
```

## セキュリティ要件

### アクセス制御

- Basic認証による管理者識別
- 管理者権限の確認
- IPアドレスベースのアクセス制限

### データ保護

- 個人情報の適切な取り扱い
- ログからの機密情報除外
- レスポンスヘッダーのセキュリティ設定

### 監査ログ

- すべての管理者操作の記録
- 認証失敗の記録
- セキュリティイベントの記録

## パフォーマンス・可用性

### 最適化戦略

- データベースクエリの最適化
- インデックスの適切な設定
- ページネーションによる大量データの効率化

### 可用性

- エラー時の適切なフォールバック
- タイムアウト設定
- リトライロジック

### 監視

- 管理者APIの可用性監視
- レスポンス時間の監視
- エラー率の監視



# ユーザー管理API ビジネスロジック仕様

## 概要

認証済みユーザーのプロフィール管理とテーマ設定を提供するAPIです。ユーザー情報の取得、テーマの更新などの機能を提供します。

## 認証・認可

- **認証方式**: JWT
- **権限**: 自分のユーザー情報のみ操作可能
- **エンドポイント**: `/api/v1/users/*`

## 依存関係

- `AuthDeps`: 認証関連の依存関係
- `UserRepository`: ユーザーデータの永続化
- `JWT_SECRET`: JWT署名用シークレット

## コアワークフロー

### 1. ユーザープロフィール取得

```typescript
GET /users/:id
  ↓
  authenticateJWT(request)
  ↓
  extractUserId(jwtPayload)
  ↓
  validateUserIdParam(param.id)
  ↓
  parseUserId(id)
  ↓
  findUserById(targetUserId)
  ↓
  if (not_found) return NotFoundError
  ↓
  return user_profile
```

**ビジネスルール**:
- JWT認証が必要
- 存在するユーザーIDのみ有効
- ユーザーが見つからない場合は404エラー

### 2. ユーザーテーマ更新

```typescript
PATCH /users/:id/theme
  ↓
  authenticateJWT(request)
  ↓
  extractUserId(jwtPayload)
  ↓
  validateUserIdParam(param.id)
  ↓
  validateUpdateThemeSchema(body)
  ↓
  parseUserId(id)
  ↓
  checkSelfUpdatePermission(requestingUserId, targetUserId)
  ↓
  if (not_self) return ForbiddenError
  ↓
  updateThemeUseCase({ repo })({ requestingUserId, targetUserId, theme })
  ↓
  updateUserTheme(userId, theme)
  ↓
  return updated_theme
```

**ビジネスルール**:
- JWT認証が必要
- 自分のテーマのみ更新可能
- 他ユーザーのテーマ更新は403エラー
- テーマ値の妥当性チェック

## ユーザー識別と権限チェック

### JWTペイロードからのユーザーID抽出

```typescript
extractUserId: (jwtPayload: JWTPayload) => UserId
  ↓
  const userId = jwtPayload.userId
  ↓
  if (!userId) throw new Error("User ID not found in JWT")
  ↓
  return userId as UserId
```

### ユーザーIDパラメータの検証

```typescript
validateUserIdParam: (id: string) => void
  ↓
  const parsed = UserIdParamSchema.safeParse({ id })
  ↓
  if (!parsed.success) throw new ValidationError("Invalid user ID parameter")
```

### 自己更新権限のチェック

```typescript
checkSelfUpdatePermission: (requestingUserId: UserId, targetUserId: UserId) => boolean
  ↓
  if (targetUserId !== requestingUserId) {
    logUnauthorizedUpdateAttempt(requestingUserId, targetUserId)
    return false
  }
  ↓
  return true
```

## テーマ管理

### テーマ値の検証

```typescript
validateUpdateThemeSchema: (body: unknown) => UpdateThemeData
  ↓
  const parsed = UpdateThemeSchema.safeParse(body)
  ↓
  if (!parsed.success) throw new ValidationError("Invalid theme data")
  ↓
  return parsed.data
```

**テーマ値**:
- `light`: ライトテーマ
- `dark`: ダークテーマ
- `system`: システム設定に従う

### テーマ更新処理

```typescript
updateUserTheme: (userId: UserId, theme: Theme) => Promise<ThemeUpdateResult>
  ↓
  const now = new Date().toISOString()
  ↓
  const result = await userRepo.updateTheme(userId, {
    theme,
    updatedAt: now
  })
  ↓
  return {
    userId,
    theme,
    updatedAt: now
  }
```

## エラーハンドリング

### ユーザー管理エラー

```typescript
type UserManagementError = 
  | ValidationError
  | NotFoundError
  | ForbiddenError
  | UnauthorizedError
  | InfraError
```

### エラー処理

```typescript
handleUserError: (error: UserManagementError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "NotFoundError": return 404_NotFound
    case "ForbiddenError": return 403_Forbidden
    case "UnauthorizedError": return 401_Unauthorized
    case "InfraError": return 500_InternalServerError
```

### 権限エラーの処理

```typescript
handleForbiddenError: (requestingUserId: UserId, targetUserId: UserId) => HTTPResponse
  ↓
  logUnauthorizedAccess(requestingUserId, targetUserId)
  ↓
  return {
    status: 403,
    body: { error: "Unauthorized" }
  }
```

## 監査・運用

### ユーザーアクセスログ

```typescript
// プロフィール取得ログ
logProfileRequest: (requestingUserId: UserId, targetUserId: UserId) => void
  ↓
  recordUserEvent({
    timestamp: now(),
    eventType: "PROFILE_REQUEST",
    requestingUserId,
    targetUserId,
    endpoint: `/users/${targetUserId}`
  })

// テーマ更新ログ
logThemeUpdate: (userId: UserId, theme: Theme) => void
  ↓
  recordUserEvent({
    timestamp: now(),
    eventType: "THEME_UPDATE",
    userId,
    theme,
    endpoint: `/users/${userId}/theme`
  })
```

### セキュリティ監視

```typescript
// 権限違反の監視
logUnauthorizedUpdateAttempt: (requestingUserId: UserId, targetUserId: UserId) => void
  ↓
  recordSecurityEvent({
    timestamp: now(),
    eventType: "UNAUTHORIZED_UPDATE_ATTEMPT",
    requestingUserId,
    targetUserId,
    endpoint: `/users/${targetUserId}/theme`,
    severity: "medium"
  })
```

### パフォーマンス監視

```typescript
// ユーザー管理API処理時間の監視
monitorUserApiPerformance: (operation: string, startTime: number) => void
  ↓
  const endTime = performance.now()
  const duration = endTime - startTime
  ↓
  recordPerformanceMetric({
    operation: `user_${operation}`,
    duration,
    timestamp: now()
  })
```

## セキュリティ要件

### アクセス制御

- JWT認証によるユーザー識別
- 自己更新権限の確認
- 他ユーザー情報へのアクセス制限

### データ保護

- ユーザー情報の適切な取り扱い
- ログからの機密情報除外
- 入力値の適切な検証

### 監査ログ

- すべてのユーザー操作の記録
- 権限違反の記録
- セキュリティイベントの記録

## パフォーマンス・可用性

### 最適化戦略

- データベースクエリの最適化
- インデックスの適切な設定
- キャッシュの活用

### 可用性

- エラー時の適切なフォールバック
- データベース接続の冗長化
- タイムアウト設定

### 監視

- ユーザー管理APIの可用性監視
- レスポンス時間の監視
- エラー率の監視
- 権限違反の監視



# OAuth認証API ビジネスロジック仕様

## 概要

Google OAuth 2.0を使用したサードパーティ認証を提供するAPIです。セキュアなOAuthフローとセッション管理を実装しています。

## 認証・認可

- **認証方式**: なし（OAuthフロー自体のため）
- **権限**: 公開エンドポイント
- **エンドポイント**: `/api/v1/oauth/*`

## 依存関係

- `GoogleOAuth`: Google OAuth 2.0クライアント
- `SessionManager`: セッション管理
- `UserRepository`: ユーザーデータの永続化
- `Environment`: 環境設定（本番/開発）

## コアワークフロー

### 1. Google OAuth開始

```typescript
GET /oauth/google
  ↓
  createGoogleOAuthClient(environment)
  ↓
  generateState()
  ↓
  generateCodeVerifier()
  ↓
  createAuthorizationURL(state, codeVerifier, scopes)
  ↓
  setSecureCookies(state, codeVerifier)
  ↓
  redirectToGoogle(authorizationURL)
```

**ビジネスルール**:
- 暗号学的に安全なstateとcode_verifierを生成
- セキュアなCookie設定（本番環境ではHTTPS必須）
- 適切なスコープ（openid, profile, email）を要求

### 2. Google OAuthコールバック処理

```typescript
GET /oauth/google/callback
  ↓
  extractCallbackParameters(url)
    ├─ code: authorization_code
    ├─ state: state_parameter
    └─ error: error_parameter
  ↓
  validateCallbackParameters(code, state)
  ↓
  retrieveStoredCredentials()
    ├─ storedState: getCookie("google_oauth_state")
    └─ storedCodeVerifier: getCookie("google_oauth_code_verifier")
  ↓
  validateStoredCredentials(storedState, storedCodeVerifier)
  ↓
  if (invalid_credentials) return OAuthError
  ↓
  exchangeCodeForToken(code, codeVerifier)
  ↓
  getUserInfo(accessToken)
  ↓
  findOrCreateUser(googleUser)
  ↓
  createSession(userId)
  ↓
  clearOAuthCookies()
  ↓
  redirectToSuccessPage(session)
```

**ビジネスルール**:
- stateパラメータの検証によるCSRF攻撃対策
- PKCE（Proof Key for Code Exchange）による認可コード傍受攻撃対策
- 既存ユーザーの場合は更新、新規ユーザーの場合は作成
- セッション作成後のCookieクリア

## セキュリティ要件

### CSRF攻撃対策

```typescript
// Stateパラメータの生成と検証
generateState: () => string
  ↓
  generateCryptographicallySecureRandom(32)
  ↓
  return base64EncodedState

validateState: (receivedState: string, storedState: string) => boolean
  ↓
  if (!receivedState || !storedState) return false
  ↓
  if (receivedState !== storedState) return false
  ↓
  return true
```

### PKCE（Proof Key for Code Exchange）

```typescript
// Code Verifierの生成
generateCodeVerifier: () => string
  ↓
  generateCryptographicallySecureRandom(32)
  ↓
  return base64UrlEncodedVerifier

// Code Challengeの生成
generateCodeChallenge: (codeVerifier: string) => string
  ↓
  hashWithSHA256(codeVerifier)
  ↓
  return base64UrlEncodedChallenge
```

### セキュアなCookie設定

```typescript
setSecureCookies: (state: string, codeVerifier: string) => void
  ↓
  const isProduction = environment === "production"
  ↓
  setCookie("google_oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 600, // 10分
    path: "/"
  })
  ↓
  setCookie("google_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 600, // 10分
    path: "/"
  })
```

## ユーザー管理

### 既存ユーザーの検索

```typescript
findExistingUser: (googleUser: GoogleUser) => User | null
  ↓
  const { email, sub: googleId } = googleUser
  ↓
  // メールアドレスで検索
  const userByEmail = await userRepo.findByEmail(email)
  if (userByEmail) return userByEmail
  ↓
  // Google IDで検索
  const userByGoogleId = await userRepo.findByGoogleId(googleId)
  if (userByGoogleId) return userByGoogleId
  ↓
  return null
```

### 新規ユーザーの作成

```typescript
createNewUser: (googleUser: GoogleUser) => User
  ↓
  const { email, name, picture, sub: googleId } = googleUser
  ↓
  const newUser = {
    email,
    name: name || null,
    avatarUrl: picture || null,
    googleId,
    verified: true, // OAuthユーザーは認証済み
    createdAt: new Date(),
    updatedAt: new Date()
  }
  ↓
  return await userRepo.create(newUser)
```

### 既存ユーザーの更新

```typescript
updateExistingUser: (user: User, googleUser: GoogleUser) => User
  ↓
  const { name, picture, sub: googleId } = googleUser
  ↓
  const updates = {
    name: name || user.name,
    avatarUrl: picture || user.avatarUrl,
    googleId: googleId || user.googleId,
    updatedAt: new Date()
  }
  ↓
  return await userRepo.update(user.id, updates)
```

## セッション管理

### セッション作成

```typescript
createUserSession: (userId: number) => Session
  ↓
  const sessionToken = generateSessionToken()
  ↓
  const session = {
    id: generateUUID(),
    userId,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間
    createdAt: new Date()
  }
  ↓
  await sessionRepo.create(session)
  ↓
  return session
```

### セッショントークン生成

```typescript
generateSessionToken: () => string
  ↓
  const randomBytes = generateCryptographicallySecureRandom(32)
  ↓
  return base64UrlEncode(randomBytes)
```

## エラーハンドリング

### OAuthエラー

```typescript
type OAuthError = 
  | InvalidStateError
  | MissingCredentialsError
  | TokenExchangeError
  | UserInfoError
  | SessionCreationError
```

### エラー処理

```typescript
handleOAuthError: (error: OAuthError) => HTTPResponse
  ↓
  switch (error.type)
    case "InvalidStateError": return 400_BadRequest
    case "MissingCredentialsError": return 400_BadRequest
    case "TokenExchangeError": return 500_InternalServerError
    case "UserInfoError": return 500_InternalServerError
    case "SessionCreationError": return 500_InternalServerError
```

### エラーレスポンス

```typescript
// 本番環境でのエラーレスポンス
createProductionErrorResponse: (error: Error) => HTTPResponse
  ↓
  return {
    error: "OAuth authentication failed",
    status: 500
  }

// 開発環境でのエラーレスポンス
createDevelopmentErrorResponse: (error: Error) => HTTPResponse
  ↓
  return {
    error: "OAuth authentication failed",
    details: error.message,
    status: 500
  }
```

## 監査・運用

### ログ出力

```typescript
// OAuthフロー開始ログ
logOAuthStart: (requestInfo: RequestInfo) => void
  ↓
  recordOAuthEvent({
    timestamp: now(),
    eventType: "OAUTH_STARTED",
    ip: extractClientIP(request),
    userAgent: extractUserAgent(request)
  })

// OAuth成功ログ
logOAuthSuccess: (userId: number, googleUser: GoogleUser) => void
  ↓
  recordOAuthEvent({
    timestamp: now(),
    eventType: "OAUTH_SUCCESS",
    userId,
    googleEmail: googleUser.email,
    ip: extractClientIP(request)
  })

// OAuth失敗ログ
logOAuthFailure: (error: OAuthError, requestInfo: RequestInfo) => void
  ↓
  recordOAuthEvent({
    timestamp: now(),
    eventType: "OAUTH_FAILURE",
    errorType: error.type,
    errorMessage: error.message,
    ip: extractClientIP(request)
  })
```

### セキュリティ監視

```typescript
// 異常なOAuth試行の検出
detectOAuthAnomalies: (oauthAttempt: OAuthAttempt) => void
  ↓
  const recentAttempts = getRecentOAuthAttempts(oauthAttempt.ip)
  ↓
  if (recentAttempts.length > threshold) {
    blockIP(oauthAttempt.ip)
    logSecurityEvent("IP_BLOCKED_OAUTH_SPAM", oauthAttempt.ip)
  }
```

### パフォーマンス監視

```typescript
// OAuth処理時間の監視
monitorOAuthPerformance: (startTime: number) => void
  ↓
  const endTime = performance.now()
  const duration = endTime - startTime
  ↓
  recordPerformanceMetric({
    operation: "oauth_flow",
    duration,
    timestamp: now()
  })
  ↓
  if (duration > threshold) alertSlowOAuth(duration)
```

## 環境別設定

### 開発環境

```typescript
const developmentConfig = {
  cookieSecure: false,
  cookieSameSite: "Lax",
  errorDetails: true,
  redirectUrl: "http://localhost:3000/auth/callback"
}
```

### 本番環境

```typescript
const productionConfig = {
  cookieSecure: true,
  cookieSameSite: "None",
  errorDetails: false,
  redirectUrl: "https://gyulist.com/auth/callback"
}
```

## セキュリティベストプラクティス

### トークン管理

- アクセストークンの最小権限原則
- リフレッシュトークンの適切な管理
- トークンの有効期限設定

### データ保護

- 個人情報の最小化
- 機密データの暗号化
- ログからの個人情報除外

### 攻撃対策

- CSRF攻撃対策（stateパラメータ）
- 認可コード傍受攻撃対策（PKCE）
- リプレイ攻撃対策（nonce）
- ブルートフォース攻撃対策（レート制限）



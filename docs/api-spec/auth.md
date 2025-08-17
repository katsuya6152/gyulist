# 認証API ビジネスロジック仕様

## 概要

ユーザーの登録、認証、ログイン機能を提供するAPIです。セキュアな認証フローとユーザー管理を実装しています。

## 認証・認可

- **認証方式**: なし（認証フロー自体のため）
- **権限**: 公開エンドポイント
- **エンドポイント**: `/api/v1/auth/*`

## 依存関係

- `AuthDeps`: 認証関連の依存関係
  - `repo`: ユーザーデータの永続化
  - `generateVerificationToken`: 認証トークン生成
  - `JWT_SECRET`: JWT署名用シークレット

## コアワークフロー

### 1. ユーザー仮登録

```typescript
POST /auth/register
  ↓
  登録スキーマを検証
  ↓
  リクエスト情報を抽出
  ↓
  APIリクエストをログに記録
  ↓
  登録ユースケースを実行
  ↓
  既存ユーザーの存在をチェック
  ↓
  既存ユーザーの場合は成功メッセージを返す
  ↓
  認証トークンを生成
  ↓
  ユーザーを作成
  ↓
  成功メッセージを返す
```

**ビジネスルール**:
- 既存ユーザーの場合も同じメッセージを返す（セキュリティ上の理由）
- 認証トークンを生成してユーザーに保存
- 常に成功レスポンスを返す

### 2. メール認証（トークン検証）

```typescript
POST /auth/verify
  ↓
  認証スキーマを検証
  ↓
  認証ユースケースを実行
  ↓
  トークンの有効性を検証
  ↓
  トークンでユーザーを検索
  ↓
  ユーザーが見つからない場合は無効トークンエラー
  ↓
  トークンが期限切れの場合は期限切れエラー
  ↓
  認証成功を返す
```

**ビジネスルール**:
- 有効なトークンのみ認証可能
- 期限切れトークンは無効
- 存在しないトークンは無効

### 3. 本登録完了

```typescript
POST /auth/complete
  ↓
  完了スキーマを検証
  ↓
  完了ユースケースを実行
  ↓
  トークンの有効性を検証
  ↓
  トークンでユーザーを検索
  ↓
  ユーザーが見つからない場合は無効トークンエラー
  ↓
  トークンが期限切れの場合は期限切れエラー
  ↓
  パスワードをハッシュ化
  ↓
  ユーザーを認証済み状態に更新
  ↓
  完了成功を返す
```

**ビジネスルール**:
- 有効なトークンが必要
- パスワードはハッシュ化して保存
- 認証完了後はトークンを無効化
- ユーザーを認証済み状態に更新

### 4. ログイン

```typescript
POST /auth/login
  ↓
  ログインスキーマを検証
  ↓
  ログインユースケースを実行
  ↓
  メールアドレスでユーザーを検索
  ↓
  ユーザーが見つからない場合は認証失敗エラー
  ↓
  未認証ユーザーの場合は未認証エラー
  ↓
  パスワードを検証
  ↓
  パスワードが無効の場合は認証失敗エラー
  ↓
  JWTトークンを生成
  ↓
  トークンとユーザー情報を返す
```

**ビジネスルール**:
- 存在しないユーザーは認証失敗
- 未認証ユーザーはログイン不可
- パスワード検証で認証
- JWTトークンを生成して返却

## セキュリティ要件

### パスワード管理

```typescript
// パスワードハッシュ化
hashPassword: (password: string) => string
  ↓
  セキュアなハッシュアルゴリズムを使用
  ↓
  ハッシュにソルトを追加
  ↓
  ハッシュ化されたパスワードを返す

// パスワード検証
verifyPassword: (password: string, hashedPassword: string) => boolean
  ↓
  入力パスワードをハッシュ化
  ↓
  ハッシュ値を比較
  ↓
  一致するかどうかを返す
```

**セキュリティルール**:
- 強力なハッシュアルゴリズム使用
- ソルトの追加
- タイミング攻撃対策

### トークン管理

```typescript
// 認証トークン生成
generateVerificationToken: () => string
  ↓
  暗号学的に安全なトークンを生成
  ↓
  トークンに有効期限を設定
  ↓
  トークンを返す

// JWTトークン生成
generateJWT: (userId: number, email: string) => string
  ↓
  ペイロードを作成
  ↓
  シークレットで署名
  ↓
  JWTトークンを返す
```

**セキュリティルール**:
- 暗号学的に安全なトークン生成
- 適切な有効期限設定
- JWT署名の検証

## エラーハンドリング

### ドメインエラー

```typescript
type AuthDomainError = 
  | ValidationError
  | InvalidTokenError
  | ExpiredTokenError
  | UnauthorizedError
  | UnverifiedUserError
  | InfraError
```

### エラー処理

```typescript
handleAuthError: (error: AuthDomainError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "InvalidTokenError": return 400_BadRequest
    case "ExpiredTokenError": return 400_BadRequest
    case "UnauthorizedError": return 401_Unauthorized
    case "UnverifiedUserError": return 403_Forbidden
    case "InfraError": return 500_InternalServerError
```

### セキュリティエラー

```typescript
// 認証失敗時の処理
handleAuthFailure: (attempt: AuthAttempt) => void
  ↓
  失敗試行をログに記録
  ↓
  失敗回数を増加
  ↓
  失敗回数が閾値を超えた場合はアカウントをロック
  ↓
  レスポンスを遅延（ブルートフォース攻撃対策）
```

## 監査・運用

### ログ出力

```typescript
// APIリクエストログ
logApiRequest: (method: string, endpoint: string, requestId: string) => void
  ↓
  リクエストを記録
    ├─ タイムスタンプ
    ├─ メソッド
    ├─ エンドポイント
    ├─ リクエストID
    └─ クライアントIP

// 認証イベントログ
logAuthEvent: (event: AuthEvent) => void
  ↓
  認証イベントを記録
    ├─ タイムスタンプ
    ├─ ユーザーID
    ├─ イベントタイプ
    ├─ 成功/失敗
    └─ IPアドレス
```

**ログ項目**:
- リクエスト情報（メソッド、エンドポイント、リクエストID）
- 認証イベント（成功/失敗、ユーザーID、IPアドレス）
- セキュリティイベント（ロックアウト、ブルートフォース攻撃）

### セキュリティ監視

```typescript
// アカウントロックアウト
monitorAccountSecurity: (userId: number) => void
  ↓
  失敗試行をチェック
  ↓
  閾値を超えた場合はアカウントをロック
  ↓
  ユーザーにロックアウトを通知
  ↓
  セキュリティイベントをログに記録

// ブルートフォース攻撃検出
detectBruteForce: (ip: string) => void
  ↓
  時間窓内の失敗試行をカウント
  ↓
  閾値を超えた場合はIPをブロック
  ↓
  セキュリティイベントをログに記録
```

## パフォーマンス・可用性

### 最適化戦略

- データベースインデックス最適化
- パスワードハッシュ化の非同期処理
- JWTトークンの効率的な検証

### 可用性

- 認証サービスの冗長化
- データベース接続プール
- エラー時の適切なフォールバック

### 監視

- 認証成功率の監視
- レスポンス時間の監視
- エラー率の監視
- セキュリティイベントの監視



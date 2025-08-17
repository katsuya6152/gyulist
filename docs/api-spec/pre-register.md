# 事前登録API ビジネスロジック仕様

## 概要

新規ユーザーの事前登録処理を提供するAPIです。メールアドレスの登録、Turnstileによるボット対策、完了メールの送信などの機能を提供します。

## 認証・認可

- **認証方式**: なし（公開エンドポイント）
- **権限**: 誰でもアクセス可能
- **エンドポイント**: `/api/v1/pre-register`

## 依存関係

- `RegistrationRepoPort`: 事前登録データの永続化
- `IdPort`: ユニークIDの生成
- `TurnstileService`: ボット対策
- `MailService`: 完了メール送信
- `Environment`: 環境設定

## コアワークフロー

### 1. 事前登録処理

```typescript
POST /pre-register
  ↓
  parseRequestBody(body)
  ↓
  validatePreRegisterSchema(body)
  ↓
  preRegisterUseCase(deps)(registrationData)
  ↓
  validateTurnstileToken(turnstileToken)
  ↓
  if (invalid) return TurnstileFailedError
  ↓
  checkExistingRegistration(email)
  ↓
  if (exists) return AlreadyRegisteredResult
  ↓
  generateRegistrationId()
  ↓
  createRegistrationRecord(email, referralSource)
  ↓
  sendCompletionEmail(email, referralSource)
  ↓
  logEmailResult(email, result)
  ↓
  return success_result
```

**ビジネスルール**:
- Turnstileトークンの検証が必須
- 既存登録の場合は重複登録を防止
- 登録完了メールの送信
- メール送信結果のログ記録

## 入力値検証

### スキーマ検証

```typescript
validatePreRegisterSchema: (body: unknown) => PreRegisterData
  ↓
  const parsed = preRegisterSchema.safeParse(body)
  ↓
  if (!parsed.success) return ValidationError
  ↓
  return parsed.data
```

**検証項目**:
- メールアドレスの形式
- 紹介元の長さ制限
- Turnstileトークンの必須性

### メールアドレス検証

```typescript
validateEmail: (email: string) => boolean
  ↓
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  ↓
  if (!emailRegex.test(email)) return false
  ↓
  if (email.length > 254) return false
  ↓
  return true
```

## ボット対策（Turnstile）

### Turnstileトークン検証

```typescript
validateTurnstileToken: (token: string, secretKey: string) => Promise<boolean>
  ↓
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`
    })
    ↓
    const result = await response.json()
    ↓
    return result.success === true
  } catch (error) {
    logTurnstileError(error)
    return false
  }
```

**検証ルール**:
- Cloudflare Turnstile APIへの問い合わせ
- レスポンスのsuccessフィールドの確認
- エラー時の適切な処理

## 重複登録チェック

### 既存登録の検索

```typescript
checkExistingRegistration: (email: string) => Registration | null
  ↓
  const existing = await registrationRepo.findByEmail(email)
  ↓
  if (existing) {
    logDuplicateRegistrationAttempt(email)
    return existing
  }
  ↓
  return null
```

**重複チェックルール**:
- メールアドレスによる一意性チェック
- 既存登録の場合は重複登録を許可しない
- 重複試行のログ記録

## 登録データの作成

### 登録レコードの生成

```typescript
createRegistrationRecord: (email: string, referralSource?: string) => Registration
  ↓
  const now = Math.floor(Date.now() / 1000)
  ↓
  const registration = {
    id: generateUUID(),
    email,
    referralSource: referralSource || null,
    status: "confirmed",
    locale: "ja",
    createdAt: now,
    updatedAt: now
  }
  ↓
  return await registrationRepo.insert(registration)
```

**登録データ項目**:
- ユニークID（UUID）
- メールアドレス
- 紹介元（オプション）
- ステータス（confirmed）
- ロケール（ja）
- 作成・更新日時

## 完了メール送信

### メール送信処理

```typescript
sendCompletionEmail: (email: string, referralSource?: string) => Promise<MailResult>
  ↓
  try {
    const result = await mailService.sendCompleted(
      apiKey,
      fromAddress,
      email,
      referralSource
    )
    ↓
    logEmailSuccess(email, result.id)
    ↓
    return result
  } catch (error) {
    logEmailFailure(email, error)
    throw error
  }
```

**メール送信ルール**:
- Resend APIを使用したメール送信
- 紹介元情報の含め
- 送信結果のログ記録

### メールログ記録

```typescript
logEmailResult: (email: string, result: MailResult) => void
  ↓
  const now = Math.floor(Date.now() / 1000)
  ↓
  if (result.success) {
    await registrationRepo.insertEmailLog({
      id: generateUUID(),
      email,
      type: "completed",
      httpStatus: 200,
      resendId: result.id,
      error: null,
      createdAt: now
    })
  } else {
    await registrationRepo.insertEmailLog({
      id: generateUUID(),
      email,
      type: "completed",
      resendId: null,
      error: result.error,
      createdAt: now
    })
  }
```

## エラーハンドリング

### 事前登録エラー

```typescript
type PreRegisterError = 
  | ValidationError
  | TurnstileFailedError
  | EmailSendError
  | InfraError
```

### エラー処理

```typescript
handlePreRegisterError: (error: PreRegisterError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "TurnstileFailedError": return 400_BadRequest
    case "EmailSendError": return 502_BadGateway
    case "InfraError": return 500_InternalServerError
```

### エラーレスポンス

```typescript
// Turnstile失敗時のレスポンス
createTurnstileFailedResponse: () => HTTPResponse
  ↓
  return {
    status: 400,
    body: {
      ok: false,
      code: "TURNSTILE_FAILED",
      message: "Turnstile failed"
    }
  }

// メール送信失敗時のレスポンス
createEmailSendFailedResponse: () => HTTPResponse
  ↓
  return {
    status: 502,
    body: {
      ok: false,
      code: "RESEND_FAILED",
      message: "Resend failed"
    }
  }
```

## 成功レスポンス

### 新規登録成功

```typescript
createNewRegistrationResponse: () => HTTPResponse
  ↓
  return {
    status: 200,
    body: {
      ok: true,
      message: "Registration completed successfully"
    }
  }
```

### 既存登録の場合

```typescript
createAlreadyRegisteredResponse: () => HTTPResponse
  ↓
  return {
    status: 200,
    body: {
      ok: true,
      alreadyRegistered: true,
      message: "Email already registered"
    }
  }
```

## 監査・運用

### 登録イベントログ

```typescript
// 事前登録成功ログ
logPreRegisterSuccess: (email: string, referralSource?: string) => void
  ↓
  recordRegistrationEvent({
    timestamp: now(),
    eventType: "PRE_REGISTER_SUCCESS",
    email,
    referralSource,
    ip: extractClientIP(request)
  })

// 重複登録試行ログ
logDuplicateRegistrationAttempt: (email: string) => void
  ↓
  recordRegistrationEvent({
    timestamp: now(),
    eventType: "DUPLICATE_REGISTRATION_ATTEMPT",
    email,
    ip: extractClientIP(request)
  })
```

### メール送信ログ

```typescript
// メール送信成功ログ
logEmailSuccess: (email: string, resendId: string) => void
  ↓
  recordEmailEvent({
    timestamp: now(),
    eventType: "EMAIL_SENT_SUCCESS",
    email,
    resendId,
    status: "success"
  })

// メール送信失敗ログ
logEmailFailure: (email: string, error: Error) => void
  ↓
  recordEmailEvent({
    timestamp: now(),
    eventType: "EMAIL_SENT_FAILURE",
    email,
    error: error.message,
    status: "failure"
  })
```

## セキュリティ要件

### ボット対策

- Turnstileによる人間性確認
- レート制限の実装
- 異常な登録パターンの検出

### データ保護

- メールアドレスの適切な取り扱い
- ログからの個人情報除外
- 紹介元情報の検証

### 入力値検証

- メールアドレスの形式チェック
- 紹介元の長さ制限
- 特殊文字の適切な処理

## パフォーマンス・可用性

### 最適化戦略

- 非同期メール送信処理
- データベース接続の効率化
- エラー時の適切なフォールバック

### 可用性

- メール送信失敗時の適切な処理
- データベース接続の冗長化
- 外部API（Turnstile、Resend）の障害対応

### 監視

- 事前登録成功率の監視
- メール送信成功率の監視
- Turnstile検証成功率の監視
- エラー率の監視



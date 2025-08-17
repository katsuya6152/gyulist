### Pre-Register API

- 概要: 事前登録と完了通知メール送信
- 認証: なし
- 依存関係: `makeRegistrationRepo(DB)`, `createCryptoIdPort`, `verifyTurnstile`, `sendCompletionEmail`

#### コアフロー要件
- POST /: Zod `safeParse` → 失敗は `handleValidationError`。成功時は依存を束ねて UC へ。
- メール送信の From は環境の `MAIL_FROM`（なければ `no-reply@gyulist.com`）。

#### 副作用・エラーマッピング
- Turnstile とメール送信が副作用。失敗はドメインエラー準拠。

#### 監査・運用
- 主要イベントのみを記録（PII は出力しない）。

OpenAPI に I/O（型/例）を委譲。



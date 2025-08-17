### Auth API

- 概要: 認証フロー（仮登録/検証/本登録/ログイン）
- 認証: なし
- 依存関係: `makeAuthDeps(DB, JWT_SECRET)`（repo/token/mail 等）

#### コアフロー要件
- /register: 成否に関わらず既存契約で `success: true` を返却。詳細な失敗は外部へ露出しない。
- /verify: トークン検証はユースケースで完結。ルートは変換のみ。
- /complete: 本登録の副作用（ユーザー有効化/認証確定）はユースケース責務。
- /login: `Unauthorized` のみ 401、その他は共通マッピング。

#### 副作用・エラーマッピング
- エラー: 共通 `executeUseCase`/`handleResult`。

#### 監査・運用
- `getRequestInfo`/`getLogger` によりリクエストを記録。PII は出力しない。

OpenAPI に I/O（型/例）を委譲。



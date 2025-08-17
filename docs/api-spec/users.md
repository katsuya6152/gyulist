### Users API

- 概要: プロファイル取得とテーマ更新
- 認証: JWT
- 依存関係: `makeAuthDeps(DB, JWT_SECRET)`

#### コアフロー要件
- GET :id: 存在しない場合は `NotFound` → 404。
- PATCH :id/theme: 自分自身のみ更新可。JWTの `userId` と `:id` が不一致なら即 403（UseCase 呼び出しなし）。

#### 副作用・エラーマッピング
- `Forbidden` は 403 へ明示。その他は共通マッピング。

#### 監査・運用
- `requestingUserId/targetUserId` を記録。テーマ更新の不正試行は WARN。

OpenAPI に I/O（型/例）を委譲。



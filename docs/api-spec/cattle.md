### Cattle API

- 概要: 牛の検索/詳細/作成/更新/削除と関連集約
- 認証: JWT
- 依存関係: `makeDeps(DB, { now })`（`cattleRepo/eventsRepo/breedingRepo/bloodlineRepo/motherInfoRepo/clock`）

#### コアフロー要件
- GET /: 無効な `cursor` は無視。`limit+1` でページング判定し `next_cursor` を算出（`days_old/id/name`）。
- GET /status-counts: 既知ステータスを 0 初期化 → 集計結果で上書き（常に全キーが存在）。
- GET /:id: イベント/血統/母情報/繁殖状態/統計を含む詳細を返す（生成は UseCase）。
- POST /: 作成成功後、入力に `breedingStatus` がある場合のみ繁殖集約を初期化。
- PATCH /:id: 属性＋繁殖関連の付帯更新は UseCase/Port に集約。
- PATCH /:id/status: ステータスと理由を更新。`clock` を利用。
- DELETE /:id: 関連集約含めて一括削除し 204。

#### 副作用・エラーマッピング
- POST 作成直後の繁殖初期化はベストエフォート（失敗をルートで阻害しない）。
- 共通のエラーマッピングへ委譲。
- 監査/ログ: 認証ユーザーID、ID、ページング指標などを記録。

OpenAPI に I/O（型/例）を委譲。



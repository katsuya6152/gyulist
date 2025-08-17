### Admin API (Registrations)

- 概要: 管理者向けの登録一覧取得/CSV出力
- 認証: BasicAuth
- 依存関係: `makeRegistrationRepo(DB)`, `CsvBuilder`, `formatDateForFilename`

#### コアフロー要件
- GET /registrations: Repo から一覧を取得し `items/total` に整形。
- GET /registrations.csv: 一覧を取得し CSV を生成。BOM付与、`setCsvHeaders` でダウンロード向けに設定。

#### 副作用・エラーマッピング
- エラー時は 500（本番は詳細非表示）。

#### 監査・運用
- クエリ/レコード数/ファイル名を記録。

OpenAPI に I/O（型/例）を委譲。



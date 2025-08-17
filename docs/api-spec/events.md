### Events API

- 概要: 牛イベントの検索/参照/作成/更新/削除
- 認証: JWT
- 依存関係: `makeDeps(DB, { now })`（`eventsRepo/cattleRepo`）

#### コアフロー要件
- GET /: 検索は UseCase に委譲（`hasNext/nextCursor` を返却）。
- GET /cattle/:cattleId: `cattleId` 検証 NG は `ValidationError` で即終了。
- GET /:id: ID検証 NG は `ValidationError`。存在しない場合はドメインエラー準拠。
- POST /: 作成後の副作用で、`SHIPMENT → SHIPPED` / `CALVING → RESTING` に牛ステータスを更新。
- PATCH /:id: ドメイン層で更新。戻り値は安全に整形。
- DELETE /:id: 成功時は 204。

#### 副作用・エラーマッピング
- POST の副作用（ステータス更新）に失敗した場合はエラーを返す。
- 共通のエラーマッピングに委譲。

#### 監査・運用
- 作成/更新/削除と副作用の発火を記録。

OpenAPI に I/O（型/例）を委譲。



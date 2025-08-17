### Gyulist API 仕様（v1 概要）

- **Base URL**: `/api/v1`
- **認証方式**:
  - **JWT**: 多くのユーザー向けエンドポイント（`/alerts`, `/cattle`, `/events`, `/kpi`, `/users`）
  - **BasicAuth**: 管理系（`/admin`）
  - **No Auth**: 認証フロー（`/auth`, `/oauth`）と一部公開エンドポイント（`/pre-register`, `/health`）

#### このドキュメントの目的
- I/Oの詳細は OpenAPI に任せ、ここでは「内部処理要件（副作用・依存・境界・エラーマッピング・監査/ログ）」を簡潔に共有します。
- 実装・運用の観点で、挙動の前提や非機能（認可・監査・安定性）を素早く把握できることを目指します。

#### 読み方と記法
- 各ドメインのページは、以下のセクションで要点のみを列挙します。
  - 概要 / 認証 / 依存関係 / コアフローの要件 / 副作用・エラーマッピング / 監査・運用
- I/O 仕様（request/response 型、例示）は OpenAPI を参照してください（CIでの検証・公開を推奨）。

#### 共通ポリシー
- バリデーションエラーは原則 `400` で `{ ok: false, code: "VALIDATION_FAILED", issues?: Array<{ path: string, message: string }> }` を返します。
- ドメインエラーは `error.type` に応じて `401/403/404/409/500` のいずれかになります。
- いくつかのエンドポイントではレスポンスが `{ data: ... }` でラップされます（詳細は各ドキュメント参照）。

#### ドメイン別ドキュメント
- [Auth](/docs/api/auth.md)
- [OAuth](/docs/api/oauth.md)
- [Users](/docs/api/users.md)
- [Alerts](/docs/api/alerts.md)
- [Cattle](/docs/api/cattle.md)
- [Events](/docs/api/events.md)
- [KPI](/docs/api/kpi.md)
- [Admin (Registrations)](/docs/api/admin.md)
- [Pre-Register](/docs/api/pre-register.md)
- [Health](/docs/api/health.md)

OpenAPI（例）: `docs/openapi.yaml`（導入・運用は別途）



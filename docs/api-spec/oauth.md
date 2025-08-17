### OAuth API

- 概要: Google OAuth による外部認証連携
- 認証: なし
- 依存関係: 環境変数/Google API/DB/セッション

#### コアフロー要件
- /google: `state`/`code_verifier` を httpOnly Cookie に保存（TTL 600s、Secure/SameSite は環境で切替）し、認可URLへ 302。
- /google/callback: `state` 検証 → token 取得 → UserInfo 取得/検証（`verified_email` 必須） → ユーザー作成/更新 → セッション作成 → 簡易JWT生成 → Cookie 削除 → FE へ 302。

#### 副作用・エラーマッピング
- 本番では内部詳細を隠蔽（500 の簡易メッセージ）。

#### 監査・運用
- 主要ステップとバリデーション失敗を記録（開始/CB/検証NG/例外）。

OpenAPI に I/O（型/例）を委譲。



### KPI API

- 概要: 繁殖関連KPIの集計・系列
- 認証: JWT
- 依存関係: `makeKpiRepo(DB)`（`userId` スコープ）

#### コアフロー要件
- /breeding: 期間（from/to）に従い集計。null 許容はドメイン規約。
- /breeding/delta: 指定月基準の差分。月未指定時の既定は UseCase 規約。
- /breeding/trends: 期間または `months` 指定で系列/デルタを返却。

#### 副作用・エラーマッピング
- 副作用なし。共通エラーマッピング。

#### 監査・運用
- 期間・月指定を含め記録。

OpenAPI に I/O（型/例）を委譲。



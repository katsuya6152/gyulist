# アラート生成API ビジネスロジック仕様

## 概要

牛群の健康状態や繁殖管理に関する重要なアラートを自動生成するAPIです。適切なタイミングで適切なアラートを提供し、畜産農家の意思決定を支援します。

## 認証・認可

- **認証方式**: JWT
- **権限**: 自分の牛群のアラートのみ取得可能
- **エンドポイント**: `/api/v1/alerts/*`

## 依存関係

- `AlertsRepoPort`: アラートデータの取得・計算
- `ClockPort`: 現在時刻の取得

## コアワークフロー

### 1. アラート一覧取得

```typescript
GET /alerts
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  アラート取得ユースケースを実行
  ↓
  アラートデータを取得
    ├─ 空胎日数超過60日: 最終分娩から60日以上で人工授精未実施の牛を検索
    ├─ 分娩予定日60日以内: 分娩予定日まで60日以内の牛を検索
    ├─ 分娩予定日超過: 分娩予定日を超過した牛を検索
    └─ 発情20日経過: 発情から20日経過で妊娠していない牛を検索
  ↓
  アラートに変換
  ↓
  重要度と期限でソート
  ↓
  上位50件に制限
  ↓
  ソートされたアラートを返す
```

**ビジネスルール**:
- 自分の牛群のアラートのみ取得
- 現在時刻を基準にアラート条件を評価
- 重要度と期限でソート
- 最大50件まで返却

## アラートタイプと生成ロジック

### 1. 空胎日数超過アラート（OPEN_DAYS_OVER60_NO_AI）

```typescript
generateOpenDaysOver60NoAIAlert: (cattle: Cattle, currentTime: Date) => Alert
  ↓
  最終分娩を検索
  ↓
  分娩記録がない場合はnullを返す
  ↓
  分娩からの経過日数を計算
  ↓
  経過日数が60日未満の場合はnullを返す
  ↓
  分娩後の人工授精を検索
  ↓
  人工授精がある場合はnullを返す
  ↓
  アラートを生成して返す
```

**生成条件**:
- 最終分娩から60日以上経過
- 分娩後に人工授精が実施されていない
- 繁殖可能な状態の牛

**重要度**: medium

### 2. 分娩予定日接近アラート（CALVING_WITHIN_60）

```typescript
generateCalvingWithin60Alert: (cattle: Cattle, currentTime: Date) => Alert
  ↓
  最終人工授精を検索
  ↓
  人工授精がない場合はnullを返す
  ↓
  分娩予定日を計算
  ↓
  分娩予定日までの日数を計算
  ↓
  60日を超える場合はnullを返す
  ↓
  アラートを生成して返す
```

**生成条件**:
- 分娩予定日まで60日以内
- 妊娠中の牛
- 適切な栄養管理が必要

**重要度**: medium

### 3. 分娩予定日超過アラート（CALVING_OVERDUE）

```typescript
generateCalvingOverdueAlert: (cattle: Cattle, currentTime: Date) => Alert
  ↓
  最終人工授精を検索
  ↓
  人工授精がない場合はnullを返す
  ↓
  分娩予定日を計算
  ↓
  現在時刻が予定日以前の場合はnullを返す
  ↓
  超過日数を計算
  ↓
  アラートを生成して返す
```

**生成条件**:
- 分娩予定日を超過
- 妊娠中の牛
- 緊急対応が必要

**重要度**: high

### 4. 発情経過アラート（ESTRUS_OVER20_NOT_PREGNANT）

```typescript
generateEstrusOver20NotPregnantAlert: (cattle: Cattle, currentTime: Date) => Alert
  ↓
  最終発情を検索
  ↓
  発情がない場合はnullを返す
  ↓
  発情からの経過日数を計算
  ↓
  20日未満の場合はnullを返す
  ↓
  妊娠状態をチェック
  ↓
  妊娠中の場合はnullを返す
  ↓
  アラートを生成して返す
```

**生成条件**:
- 発情から20日以上経過
- 妊娠していない
- 次の発情サイクルの確認が必要

**重要度**: low

## アラート重要度とソート

### 重要度定義

```typescript
type AlertSeverity = "high" | "medium" | "low"

const severityOrder: Record<AlertSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1
}
```

### ソートロジック

```typescript
sortAlertsByPriority: (alerts: Alert[]) => Alert[]
  ↓
  アラートを重要度でソート（高い順）
  ↓
  重要度が同じ場合は期限でソート（早い順）
  ↓
  ソートされたアラートを返す
```

## アラート計算ロジック

### 日数計算

```typescript
calculateDaysBetween: (startDate: Date, endDate: Date) => number
  ↓
  開始日と終了日の時間差を計算
  ↓
  日数に変換して返す
```

### 分娩予定日計算

```typescript
calculateExpectedCalvingDate: (inseminationDate: Date) => Date
  ↓
  人工授精から280日後を計算（標準的な妊娠期間）
  ↓
  分娩予定日を返す
```

### 最適人工授精日計算

```typescript
calculateOptimalInseminationDate: (calvingDate: Date) => Date
  ↓
  分娩から60日後を計算（繁殖再開の推奨時期）
  ↓
  最適人工授精日を返す
```

### 次回発情予定日計算

```typescript
calculateNextEstrusDate: (lastEstrusDate: Date) => Date
  ↓
  発情から21日後を計算（標準的な発情周期）
  ↓
  次回発情予定日を返す
```

## データベースクエリ最適化

### 効率的なアラートデータ取得

```typescript
// 空胎日数超過の牛を一括取得
findOpenDaysOver60NoAI: (userId: number, currentTime: string) => RawAlertRow[]
  ↓
  複雑なSQLクエリを実行
  ↓
  空胎日数超過の牛のデータを返す
```

## エラーハンドリング

### ドメインエラー

```typescript
type AlertDomainError = 
  | ValidationError
  | InsufficientDataError
  | CalculationError
  | InfraError
```

### エラー処理

```typescript
handleAlertError: (error: AlertDomainError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "InsufficientDataError": return 422_UnprocessableEntity
    case "CalculationError": return 500_InternalServerError
    case "InfraError": return 500_InternalServerError
```

## 監査・運用

### ログ出力

```typescript
// アラート生成ログ
logAlertGeneration: (userId: number, alertCount: number) => void
  ↓
  アラート生成イベントを記録
    ├─ タイムスタンプ
    ├─ ユーザーID
    ├─ 生成されたアラート数
    └─ クライアントIP
```

**ログ項目**:
- アラート生成リクエスト
- 生成されたアラート数
- 各アラートタイプの件数
- 処理時間

### パフォーマンス監視

```typescript
// アラート生成時間の監視
monitorAlertGenerationTime: (startTime: number) => void
  ↓
  処理時間を計算
  ↓
  パフォーマンスメトリクスを記録
  ↓
  処理時間が閾値を超えた場合はアラート
```

### アラート品質管理

```typescript
// アラートの妥当性チェック
validateAlertQuality: (alerts: Alert[]) => AlertQualityReport
  ↓
  アラート品質レポートを生成
    ├─ 総アラート数
    ├─ 高重要度の件数
    ├─ 中重要度の件数
    ├─ 低重要度の件数
    └─ 期限超過アラート数
  ↓
  品質レポートを返す
```

### セキュリティ

- JWT認証によるユーザー識別
- 所有権チェックによるデータ分離
- 入力値検証によるインジェクション対策

### 可用性

- アラート生成の非同期処理
- エラー時の適切なフォールバック
- データベース接続の冗長化



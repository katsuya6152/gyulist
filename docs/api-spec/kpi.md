# KPI計算API ビジネスロジック仕様

## 概要

繁殖効率や牛群の生産性を測定するためのKPI（重要業績評価指標）を計算するAPIです。繁殖KPI、差分分析、トレンド分析などの機能を提供します。

## 認証・認可

- **認証方式**: JWT
- **権限**: 自分の牛群のKPIのみ取得可能
- **エンドポイント**: `/api/v1/kpi/*`

## 依存関係

- `KpiRepoPort`: KPIデータの取得・計算
- `ClockPort`: 現在時刻の取得

## コアワークフロー

### 1. 繁殖KPI取得

```typescript
GET /kpi/breeding
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  クエリパラメータを検証
  ↓
  繁殖KPI取得ユースケースを実行
  ↓
  デフォルトの日付範囲を設定
  ↓
  繁殖関連イベントを取得
  ↓
  牛ごとにイベントをグループ化
  ↓
  メトリクスを計算
    ├─ 受胎率: 成功した受胎数 / 総人工授精回数
    ├─ 平均空胎日数: 分娩から受胎までの日数の平均
    ├─ 平均分娩間隔: 連続する分娩間の日数の平均
    └─ 受胎あたり人工授精回数: 総人工授精回数 / 成功した受胎数
  ↓
  計算されたKPIを返す
```

**ビジネスルール**:
- デフォルト期間は過去1年
- イベントタイプで繁殖関連を特定
- 牛ごとにイベントをグループ化
- 統計計算でKPIを算出

### 2. 繁殖KPI差分計算

```typescript
GET /kpi/breeding/delta
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  月パラメータを抽出
  ↓
  繁殖KPI差分取得ユースケースを実行
  ↓
  月の範囲を決定
  ↓
  現在月のKPIを取得
  ↓
  前月のKPIを取得
  ↓
  差分を計算
    ├─ 受胎率の差分: 現在 - 前月
    ├─ 平均空胎日数の差分: 現在 - 前月
    ├─ 平均分娩間隔の差分: 現在 - 前月
    └─ 受胎あたり人工授精回数の差分: 現在 - 前月
  ↓
  差分メトリクスを返す
```

**ビジネスルール**:
- 月パラメータが指定されない場合は現在月
- 前月との差分を計算
- トレンド（改善/悪化/変化なし）を判定

### 3. 繁殖KPIトレンド分析

```typescript
GET /kpi/breeding/trends
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  トレンドパラメータを抽出
  ↓
  繁殖KPIトレンド取得ユースケースを実行
  ↓
  日付範囲を検証
  ↓
  日付範囲のKPIを取得
  ↓
  トレンドを計算
    ├─ 受胎率の線形回帰
    ├─ 平均空胎日数の移動平均
    └─ 分娩間隔の季節性パターン
  ↓
  トレンド分析を返す
```

**ビジネスルール**:
- 日付範囲の妥当性チェック
- 線形回帰による傾向分析
- 移動平均による平滑化
- 季節性パターンの検出

## KPI計算ロジック

### 受胎率（Conception Rate）

```typescript
calculateConceptionRate: (events: BreedingEvent[]) => number
  ↓
  人工授精イベントをフィルタリング
  ↓
  分娩イベントをフィルタリング
  ↓
  人工授精と分娩をマッチング
  ↓
  成功した受胎数をカウント
  ↓
  受胎率を計算して返す
```

**計算ルール**:
- 人工授精から分娩までの期間が260-300日
- 同一牛の連続する分娩間で人工授精回数をカウント
- 受胎率 = 成功した受胎数 / 総人工授精回数

### 平均空胎日数（Average Days Open）

```typescript
calculateAverageDaysOpen: (events: BreedingEvent[]) => number
  ↓
  分娩イベントを検索
  ↓
  次の人工授精イベントを検索
  ↓
  分娩と人工授精の間の日数を計算
  ↓
  有効期間をフィルタリング
  ↓
  平均値を計算して返す
```

**計算ルール**:
- 分娩から次の人工授精までの日数
- 有効期間のみを対象（異常値除外）
- 平均値を算出

### 平均分娩間隔（Average Calving Interval）

```typescript
calculateAverageCalvingInterval: (events: BreedingEvent[]) => number
  ↓
  連続する分娩を検索
  ↓
  分娩間の日数を計算
  ↓
  有効な間隔をフィルタリング
  ↓
  平均値を計算して返す
```

**計算ルール**:
- 連続する分娩間の日数
- 有効な間隔のみを対象
- 平均値を算出

### 受胎あたり人工授精回数（AI per Conception）

```typescript
calculateAiPerConception: (events: BreedingEvent[]) => number
  ↓
  分娩イベントを検索
  ↓
  分娩前の人工授精を検索
  ↓
  分娩あたりの人工授精回数をカウント
  ↓
  平均値を計算して返す
```

**計算ルール**:
- 分娩前の人工授精回数をカウント
- 前回分娩後の人工授精のみ対象
- 平均値を算出

## データフィルタリング

### 期間フィルタリング

```typescript
filterEventsByPeriod: (events: Event[], from: Date, to: Date) => Event[]
  ↓
  イベントを期間でフィルタリング
  ↓
  フィルタリングされたイベントを返す
```

### イベントタイプフィルタリング

```typescript
filterBreedingEvents: (events: Event[]) => BreedingEvent[]
  ↓
  繁殖関連イベントタイプを定義
  ↓
  繁殖関連イベントのみをフィルタリング
  ↓
  繁殖関連イベントを返す
```

### 牛ごとのグループ化

```typescript
groupEventsByCattle: (events: Event[]) => Map<number, Event[]>
  ↓
  牛のIDごとにイベントをグループ化
  ↓
  グループ化されたイベントを返す
```

## 統計計算

### 線形回帰分析

```typescript
calculateLinearRegression: (data: TimeSeriesData) => TrendData
  ↓
  データの基本統計を計算
  ↓
  線形回帰の係数を計算
  ↓
  トレンドデータを返す
```

### 移動平均計算

```typescript
calculateMovingAverage: (data: number[], window: number) => number[]
  ↓
  指定されたウィンドウサイズで移動平均を計算
  ↓
  移動平均の結果を返す
```

## エラーハンドリング

### ドメインエラー

```typescript
type KpiDomainError = 
  | ValidationError
  | InsufficientDataError
  | CalculationError
  | InfraError
```

### エラー処理

```typescript
handleKpiError: (error: KpiDomainError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "InsufficientDataError": return 422_UnprocessableEntity
    case "CalculationError": return 500_InternalServerError
    case "InfraError": return 500_InternalServerError
```

## 監査・運用

### ログ出力

- KPI計算リクエスト
- 計算結果の統計情報
- エラー発生時の詳細情報

### パフォーマンス

- データベースクエリの最適化
- 計算結果のキャッシュ
- 大量データの効率的な処理

### データ品質

- 不完全データの検出
- 異常値の除外
- 統計的有意性の確認

### 監視

- KPI計算時間の監視
- データ取得量の監視
- エラー率の監視



# イベント管理API ビジネスロジック仕様

## 概要

牛の繁殖・健康管理に関するイベント（人工授精、分娩、発情、治療など）を管理するAPIです。イベントの作成、検索、更新、削除機能を提供します。

## 認証・認可

- **認証方式**: JWT
- **権限**: 自分の牛のイベントのみ操作可能（所有権チェック）
- **エンドポイント**: `/api/v1/events/*`

## 依存関係

- `EventsRepoPort`: イベントデータの永続化・検索
- `CattleRepoPort`: 牛の所有権チェック
- `ClockPort`: 現在時刻の取得

## コアワークフロー

### 1. イベント一覧・検索

```typescript
GET /events
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  イベント検索スキーマを検証
  ↓
  イベント検索ユースケースを実行
  ↓
  リポジトリでイベントを検索
  ↓
  結果にフィルターを適用
  ↓
  フィルタリングされたイベントを返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ検索可能
- 日付範囲、イベントタイプ、牛IDでフィルタリング
- ページネーション対応

### 2. 特定の牛のイベント一覧

```typescript
GET /events/cattle/:cattleId
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  牛のIDパラメータを解析
  ↓
  牛のイベント一覧ユースケースを実行
  ↓
  牛のIDを検証
  ↓
  牛の所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  牛のIDでイベントを検索
  ↓
  イベントリストを返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ取得可能
- 無効な牛IDは400エラー
- 所有権チェックで403エラー

### 3. イベント詳細取得

```typescript
GET /events/:id
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  イベントのIDパラメータを解析
  ↓
  イベント詳細取得ユースケースを実行
  ↓
  イベントのIDを検証
  ↓
  イベントをIDで検索
  ↓
  イベントが見つからない場合は見つからないエラー
  ↓
  イベントの所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  イベントの詳細を返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ取得可能
- 無効なイベントIDは400エラー
- 所有権チェックで403エラー

### 4. イベント作成

```typescript
POST /events
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  イベント作成スキーマを検証
  ↓
  イベント作成ユースケースを実行
  ↓
  イベントデータを検証
  ↓
  牛の所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  イベントタイプと牛のステータスの整合性を検証
  ↓
  リポジトリにイベントを作成
  ↓
  イベントタイプが牛のステータスに影響する場合は牛のステータスを更新
  ↓
  作成されたイベントを返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ作成可能
- イベントタイプと牛のステータスの整合性チェック
- イベント作成時刻は現在時刻
- 牛のステータスに影響するイベントの場合は自動更新

### 5. イベント更新

```typescript
PUT /events/:id
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  イベントのIDパラメータを解析
  ↓
  イベント更新スキーマを検証
  ↓
  イベント更新ユースケースを実行
  ↓
  イベントのIDを検証
  ↓
  イベントをIDで検索
  ↓
  イベントが見つからない場合は見つからないエラー
  ↓
  イベントの所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  イベントの更新を検証
  ↓
  リポジトリでイベントを更新
  ↓
  更新されたイベントを返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ更新可能
- イベントの存在確認
- 所有権チェック
- 更新可能なフィールドの制限

### 6. イベント削除

```typescript
DELETE /events/:id
  ↓
  JWTでリクエストを認証
  ↓
  JWTペイロードからユーザーIDを抽出
  ↓
  イベントのIDパラメータを解析
  ↓
  イベント削除ユースケースを実行
  ↓
  イベントのIDを検証
  ↓
  イベントをIDで検索
  ↓
  イベントが見つからない場合は見つからないエラー
  ↓
  イベントの所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  リポジトリからイベントを削除
  ↓
  削除成功を返す
```

**ビジネスルール**:
- 自分の牛のイベントのみ削除可能
- イベントの存在確認
- 所有権チェック

## イベントタイプとビジネスルール

### 繁殖関連イベント

```typescript
type BreedingEventType = 
  | "INSEMINATION"      // 人工授精
  | "ESTRUS"            // 発情
  | "PREGNANCY_CHECK"   // 妊娠検査
  | "CALVING"           // 分娩
  | "ABORTION"          // 流産
  | "DRY_OFF"           // 乾乳
```

**ビジネスルール**:
- `INSEMINATION`: 牛が健康状態で発情中の場合のみ作成可能
- `CALVING`: 妊娠中の牛のみ作成可能
- `DRY_OFF`: 分娩予定日の60日前から作成可能

### 健康管理イベント

```typescript
type HealthEventType = 
  | "VACCINATION"       // 予防接種
  | "TREATMENT"         // 治療
  | "HEALTH_CHECK"      // 健康診断
  | "HOOF_TRIMMING"     // 蹄切り
  | "DEWORMING"         // 駆虫
```

**ビジネスルール**:
- `TREATMENT`: 治療中の牛のみ作成可能
- `VACCINATION`: 健康な牛のみ作成可能

### 管理イベント

```typescript
type ManagementEventType = 
  | "MOVEMENT"          // 移動
  | "FEEDING_CHANGE"    // 飼料変更
  | "BREEDING_PAUSE"    // 繁殖休止
  | "REACTIVATION"      // 再開
```

**ビジネスルール**:
- `MOVEMENT`: 移動先の情報が必須
- `BREEDING_PAUSE`: 繁殖可能な牛のみ作成可能

## 副作用・エラーマッピング

### ドメインエラー

```typescript
type EventDomainError = 
  | ValidationError
  | NotFoundError
  | ForbiddenError
  | InfraError
  | BusinessRuleViolationError
```

### エラー処理

```typescript
handleEventError: (error: EventDomainError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "NotFoundError": return 404_NotFound
    case "ForbiddenError": return 403_Forbidden
    case "InfraError": return 500_InternalServerError
    case "BusinessRuleViolationError": return 422_UnprocessableEntity
```

### 副作用

- データベースの永続化
- 牛のステータス自動更新
- 繁殖データの連動更新
- アラート条件の評価

## 監査・運用

### ログ出力

- イベントの作成・更新・削除操作
- 所有権チェック失敗
- ビジネスルール違反

### パフォーマンス

- インデックス最適化
- 関連データの効率的な取得
- ページネーション対応

### セキュリティ

- JWT認証
- 所有権チェック
- 入力値検証
- イベントタイプの制限

### データ整合性

- 牛のステータスとの整合性
- 繁殖サイクルの妥当性
- 日付の論理チェック



# Gyulist API ビジネスロジック仕様

## 概要

Gyulistは畜産業界向けの牛群管理システムです。このドキュメントでは、関数型ドメインモデリングの記法に基づいて、各APIエンドポイントのビジネスロジックとワークフローを定義します。

## アーキテクチャ原則

- **関数型ドメインモデリング**: 純粋関数としてユースケースを実装
- **Result型**: 成功/失敗を型安全に表現
- **依存性注入**: 外部依存をインターフェースで抽象化
- **エラーハンドリング**: ドメインエラーを適切に分類・処理

## 認証・認可フロー

### 1. ユーザー登録ワークフロー

```typescript
// 仮登録
register: (email: string) => Result<RegisterResult, DomainError>
  ↓
  メールアドレスの形式を検証
  ↓
  既存ユーザーの存在をチェック
  ↓
  既存ユーザーの場合は成功メッセージを返す
  ↓
  認証トークンを生成
  ↓
  ユーザーを作成
  ↓
  成功メッセージを返す

// メール認証
verify: (token: string) => Result<VerifyResult, DomainError>
  ↓
  トークンの有効性を検証
  ↓
  トークンでユーザーを検索
  ↓
  ユーザーが見つからない場合は無効トークンエラー
  ↓
  トークンが期限切れの場合は期限切れエラー
  ↓
  認証成功を返す

// 本登録完了
complete: (token: string, password: string) => Result<CompleteResult, DomainError>
  ↓
  トークンの有効性を検証
  ↓
  トークンでユーザーを検索
  ↓
  パスワードをハッシュ化
  ↓
  ユーザーを認証済み状態に更新
  ↓
  完了成功を返す
```

### 2. ログインワークフロー

```typescript
login: (email: string, password: string) => Result<LoginResult, DomainError>
  ↓
  メールアドレスでユーザーを検索
  ↓
  ユーザーが見つからない場合は認証失敗エラー
  ↓
  未認証ユーザーの場合は未認証エラー
  ↓
  パスワードを検証
  ↓
  パスワードが無効の場合は認証失敗エラー
  ↓
  JWTトークンを生成
  ↓
  トークンとユーザー情報を返す
```

### 3. OAuth認証ワークフロー

```typescript
// Google OAuth開始
startGoogleOAuth: () => Result<OAuthUrl, DomainError>
  ↓
  セキュリティ用のstate値を生成
  ↓
  PKCE用のcode_verifierを生成
  ↓
  認可URLを作成
  ↓
  セキュアなCookieにstateとcode_verifierを保存
  ↓
  リダイレクトURLを返す

// OAuthコールバック処理
handleOAuthCallback: (code: string, state: string) => Result<Session, DomainError>
  ↓
  stateパラメータを検証
  ↓
  認可コードをアクセストークンと交換
  ↓
  アクセストークンでユーザー情報を取得
  ↓
  既存ユーザーを検索または新規作成
  ↓
  セッションを作成
  ↓
  セッションデータを返す
```

## 牛群管理ワークフロー

### 1. 牛の登録ワークフロー

```typescript
createCattle: (cattleData: NewCattleProps) => Result<Cattle, DomainError>
  ↓
  牛の登録データを検証
  ↓
  識別番号の重複をチェック
  ↓
  重複がある場合は競合エラー
  ↓
  牛のドメインオブジェクトを作成
  ↓
  リポジトリに永続化
  ↓
  繁殖ステータスが提供されている場合は繁殖データを初期化
  ↓
  作成された牛を返す
```

### 2. 牛の検索ワークフロー

```typescript
searchCattle: (searchParams: SearchParams) => Result<CattleList, DomainError>
  ↓
  検索パラメータを検証
  ↓
  カーソルをデコード
  ↓
  リポジトリで牛を検索
  ↓
  結果にページネーションを適用
  ↓
  次のカーソルをエンコード
  ↓
  結果、次のカーソル、次のページ有無を返す
```

### 3. 牛の詳細取得ワークフロー

```typescript
getCattleDetail: (cattleId: CattleId, requesterUserId: UserId) => Result<CattleDetail, DomainError>
  ↓
  牛のIDを検証
  ↓
  牛をIDで検索
  ↓
  牛の所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  関連データを取得
    ├─ イベント: 牛のIDでイベントを検索
    ├─ 繁殖: 牛のIDで繁殖データを検索
    └─ 血統: 牛のIDで血統データを検索
  ↓
  牛の詳細情報を構成
  ↓
  牛の詳細を返す
```

### 4. 牛の更新ワークフロー

```typescript
updateCattle: (cattleId: CattleId, updateData: UpdateCattleData) => Result<Cattle, DomainError>
  ↓
  更新データを検証
  ↓
  牛をIDで検索
  ↓
  牛の所有権をチェック
  ↓
  所有者でない場合は禁止エラー
  ↓
  ビジネスルールを検証
  ↓
  リポジトリで牛を更新
  ↓
  更新された牛を返す
```

### 5. 牛のステータス更新ワークフロー

```typescript
updateCattleStatus: (cattleId: CattleId, newStatus: CattleStatus) => Result<Cattle, DomainError>
  ↓
  現在のステータスから新しいステータスへの遷移を検証
  ↓
  無効な遷移の場合は無効ステータス遷移エラー
  ↓
  リポジトリでステータスを更新
  ↓
  ステータスが出荷または死亡に変更された場合は繁殖ステータスを非アクティブに更新
  ↓
  更新された牛を返す
```

## イベント管理ワークフロー

### 1. イベント作成ワークフロー

```typescript
createEvent: (eventData: CreateEventInput) => Result<Event, DomainError>
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

### 2. イベント検索ワークフロー

```typescript
searchEvents: (searchParams: SearchEventParams) => Result<EventList, DomainError>
  ↓
  検索パラメータを検証
  ↓
  リポジトリでイベントを検索
  ↓
  結果にフィルターを適用
  ↓
  フィルタリングされたイベントを返す
```

### 3. イベント更新ワークフロー

```typescript
updateEvent: (eventId: EventId, updateData: UpdateEventData) => Result<Event, DomainError>
  ↓
  更新データを検証
  ↓
  イベントをIDで検索
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

## KPI計算ワークフロー

### 1. 繁殖KPI計算ワークフロー

```typescript
getBreedingKpi: (userId: UserId, fromDate?: Date, toDate?: Date) => Result<BreedingKpi, DomainError>
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

### 2. KPI差分計算ワークフロー

```typescript
getBreedingKpiDelta: (userId: UserId, month?: string) => Result<BreedingKpiDelta, DomainError>
  ↓
  月の範囲を決定
  ↓
  現在月のKPIを取得
  ↓
  前月のKPIを取得
  ↓
  差分を計算
  ↓
  差分メトリクスを返す
```

### 3. KPIトレンド計算ワークフロー

```typescript
getBreedingKpiTrends: (userId: UserId, dateRange: DateRange) => Result<BreedingKpiTrends, DomainError>
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

## アラート生成ワークフロー

### 1. アラート取得ワークフロー

```typescript
getAlerts: (userId: UserId, currentTime: Date) => Result<AlertList, DomainError>
  ↓
  アラートデータを取得
    ├─ 空胎日数超過60日: 最終分娩から60日以上で人工授精未実施の牛を検索
    ├─ 分娩予定日60日以内: 分娩予定日まで60日以内の牛を検索
    ├─ 分娩予定日超過: 分娩予定日を超過した牛を検索
    └─ 発情20日経過: 発情から20日経過で妊娠していない牛を検索
  ↓
  アラートに変換
    ├─ 空胎日数超過60日: 重要度「中」
    ├─ 分娩予定日60日以内: 重要度「中」
    ├─ 分娩予定日超過: 重要度「高」
    └─ 発情20日経過: 重要度「低」
  ↓
  重要度と期限でソート
  ↓
  上位50件に制限
  ↓
  ソートされたアラートを返す
```

## 管理機能ワークフロー

### 1. 事前登録管理ワークフロー

```typescript
listRegistrations: (queryParams: RegistrationQuery) => Result<RegistrationList, DomainError>
  ↓
  クエリパラメータを検証
  ↓
  管理者ユーザーを認証
  ↓
  管理者でない場合は認証失敗エラー
  ↓
  事前登録を検索
  ↓
  結果にページネーションを適用
  ↓
  事前登録リストを返す
```

### 2. CSVエクスポートワークフロー

```typescript
exportRegistrationsCsv: (queryParams: RegistrationQuery) => Result<CSVData, DomainError>
  ↓
  クエリパラメータを検証
  ↓
  管理者ユーザーを認証
  ↓
  管理者でない場合は認証失敗エラー
  ↓
  事前登録を取得
  ↓
  CSV形式に変換
  ↓
  CSVヘッダーを設定
  ↓
  CSVデータを返す
```

## 事前登録ワークフロー

### 1. 事前登録処理ワークフロー

```typescript
preRegister: (email: string, referralSource?: string, turnstileToken: string) => Result<PreRegisterResult, DomainError>
  ↓
  Turnstileトークンを検証
  ↓
  無効な場合はTurnstile失敗エラー
  ↓
  既存の事前登録をチェック
  ↓
  既存の場合は既に登録済み結果
  ↓
  登録IDを生成
  ↓
  事前登録レコードを作成
  ↓
  完了メールを送信
  ↓
  メール結果をログに記録
  ↓
  成功結果を返す
```

## エラーハンドリング

### ドメインエラータイプ

```typescript
type DomainError = 
  | ValidationError
  | ConflictError
  | NotFoundError
  | ForbiddenError
  | UnauthorizedError
  | InfraError
  | BusinessRuleViolationError
```

### エラー処理フロー

```typescript
handleError: (error: DomainError) => HTTPResponse
  ↓
  switch (error.type)
    case "ValidationError": return 400_BadRequest
    case "ConflictError": return 409_Conflict
    case "NotFoundError": return 404_NotFound
    case "ForbiddenError": return 403_Forbidden
    case "UnauthorizedError": return 401_Unauthorized
    case "InfraError": return 500_InternalServerError
    case "BusinessRuleViolationError": return 422_UnprocessableEntity
```

## セキュリティ

### 認証・認可フロー

- JWTトークンによる認証
- ユーザー所有権チェック
- 管理者権限チェック
- Turnstileによるボット対策

### データ保護

- ユーザー間データ分離
- 入力値検証
- SQLインジェクション対策
- XSS対策

## パフォーマンス

### 最適化戦略

- カーソルベースページネーション
- インデックス最適化
- クエリ結果キャッシュ
- 非同期処理

### 監視・ログ

- リクエストログ
- エラーログ
- パフォーマンスメトリクス
- セキュリティイベント



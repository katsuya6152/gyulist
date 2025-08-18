# Gyulist プロジェクト シーケンス図

## 牛の作成処理フロー

```mermaid
sequenceDiagram
  participant C as Client
  participant H as Hono(Route)
  participant D as DTO(zod)
  participant U as UseCase(createCattle)
  participant DOM as Domain(型/関数)
  participant P as Port(CattleRepository)
  participant I as Infra(RepoImpl/Drizzle)
  participant DB as SQLite_DB

  C->>H: POST /cattle (JSON)
  Note over C,H: { identificationNumber: 12345, name: "花子", gender: "雌", ... }
  
  H->>D: 受信DTOを検証(zod)
  Note over H,D: createCattleSchema.parse(data)
  D-->>H: OK or エラー(400)
  
  alt バリデーション成功
    H->>U: 入力をユースケースに委譲
    Note over H,U: createCattleUseCase(deps)(cmd)
    
    U->>DOM: DTO→ドメイン値組立
    Note over U,DOM: createCattle(props, currentTime)
    
    DOM->>DOM: ドメインルール適用
    Note over DOM: - 個体識別番号は正の整数
    Note over DOM: - 誕生日は未来の日付ではない
    Note over DOM: - 体重は正の値（提供時）
    Note over DOM: - 評価スコアは0-100の範囲
    
    DOM-->>U: 純粋な Cattle 値 or DomainError
    
    alt ドメインルール成功
      U->>P: create(cattle) を要求
      Note over U,P: cattleRepo.create(props)
      
      P->>I: 具象リポジトリに委譲
      Note over P,I: makeCattleRepo(db).create()
      
      I->>DB: トランザクションで書き込み
      Note over I,DB: INSERT INTO cattle (...)
      DB-->>I: OK (cattleId生成)
      
      I-->>P: 作成されたCattle
      P-->>U: 作成されたCattle
      
      U-->>H: Result<Cattle, DomainError>（成功）
      Note over U,H: ok(createdCattle)
      
      H-->>C: 201 Created + JSON
      Note over H,C: { data: { cattleId: 1, name: "花子", ... } }
      
    else ドメインルール失敗
      U-->>H: Result<Cattle, DomainError>（失敗）
      Note over U,H: err({ type: "ValidationError", ... })
      
      H-->>C: 400 Bad Request + JSON
      Note over H,C: { error: { type: "ValidationError", ... } }
    end
    
  else バリデーション失敗
    H-->>C: 400 Bad Request + JSON
    Note over H,C: { error: { code: "VALIDATION_FAILED", issues: [...] } }
  end
```

## エラーハンドリングフロー

```mermaid
sequenceDiagram
  participant C as Client
  participant H as Hono(Route)
  participant U as UseCase
  participant P as Port
  participant I as Infra
  participant DB as SQLite_DB

  C->>H: POST /cattle (不正なデータ)
  
  alt 予期しないエラー
    H->>U: ユースケース実行
    U->>P: リポジトリ呼び出し
    P->>I: 実装呼び出し
    I->>DB: データベース操作
    DB-->>I: エラー（例：制約違反）
    I-->>P: 例外スロー
    P-->>U: 例外スロー
    U-->>H: 例外スロー
    
    H->>H: handleUnexpectedError
    Note over H: ログ出力 + 500エラー
    H-->>C: 500 Internal Server Error
    Note over H,C: { message: "Internal Server Error" }
  end
```

## 認証・認可フロー

```mermaid
sequenceDiagram
  participant C as Client
  participant H as Hono(Route)
  participant M as JWT_Middleware
  participant U as UseCase
  participant P as Port

  C->>H: POST /cattle (Authorization: Bearer token)
  
  H->>M: JWT認証チェック
  Note over H,M: jwtMiddleware
  
  alt 認証成功
    M-->>H: 認証済みユーザー情報
    Note over M,H: { userId: 123, ... }
    
    H->>U: ユースケース実行（ユーザー情報付き）
    Note over H,U: ownerUserId: userId
    
    U->>P: リポジトリ呼び出し
    Note over U,P: 所有者IDでフィルタリング
    
    P-->>U: 結果
    U-->>H: 成功レスポンス
    H-->>C: 201 Created
    
  else 認証失敗
    M-->>H: 認証エラー
    H-->>C: 401 Unauthorized
    Note over H,C: { error: "Invalid token" }
  end
```

## 依存性注入フロー

```mermaid
sequenceDiagram
  participant H as Hono(Route)
  participant DI as DI_Container
  participant U as UseCase
  participant P as Port
  participant I as Infra

  H->>DI: makeDeps(db, clock)
  Note over H,DI: 依存関係の構築
  
  DI->>I: makeCattleRepo(db)
  Note over DI,I: リポジトリ実装の作成
  
  DI-->>H: 依存関係オブジェクト
  Note over DI,H: { cattleRepo, clock, ... }
  
  H->>U: ユースケース実行（依存関係注入）
  Note over H,U: createUC({ cattleRepo, clock })(cmd)
  
  U->>P: ポート経由でリポジトリ使用
  Note over U,P: deps.cattleRepo.create()
  
  P->>I: 実装呼び出し
  I-->>P: 結果
  P-->>U: 結果
  U-->>H: 結果
```

## 主要な特徴

### 1. **Hexagonal Architecture**
- **Interfaces層**: Hono、zodバリデーション、JWT認証
- **Application層**: ユースケース、ポート定義
- **Domain層**: 純粋なビジネスロジック、エンティティ
- **Infrastructure層**: Drizzle ORM、SQLite

### 2. **エラーハンドリング**
- **Result型**: 成功/失敗を型安全に表現
- **統一エラーレスポンス**: HTTPステータスとJSON形式
- **ログ出力**: 予期しないエラーの記録

### 3. **依存性注入**
- **makeDeps**: 依存関係の一元管理
- **ポート**: インターフェースによる結合度の低下
- **テスト容易性**: モック可能な設計

### 4. **ドメイン駆動設計**
- **エンティティ**: Cattle（牛）
- **値オブジェクト**: CattleId、UserId、Status
- **ドメインルール**: ビジネスロジックの集約
- **集約**: Cattleをルートとする境界

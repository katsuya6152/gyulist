# 出荷管理機能 要件定義書

## 1. 概要

### 1.1 目的
母牛ごとの出荷実績、出荷予定管理（月単位）、出荷価格の記録に特化した出荷管理機能を提供し、繁殖成績の評価と収益性の把握を支援する。

### 1.2 対象ユーザー
- 畜産農家
- 畜産管理者

### 1.3 前提条件
- 既存の牛管理システム（gyulist）に統合
- 既存の牛データ（cattle テーブル）を活用
- 最小限の機能で短期間での実装

## 2. 機能要件

### 2.1 母牛ごとの出荷実績管理

#### 2.1.1 出荷実績記録
- **機能**: 母牛から生まれた子牛の出荷実績を記録
- **入力項目**:
  - 牛ID（必須）
  - 出荷日（必須）
  - 出荷価格（必須）
  - 出荷重量（任意）
  - 出荷時日齢（任意、自動計算も可能）
  - 購買者（任意）
  - 備考（任意）
- **制約**:
  - 出荷日は過去の日付のみ
  - 出荷価格は正の整数
  - 出荷重量は正の数
  - 出荷時日齢は正の整数（生年月日から自動計算可能）

#### 2.1.2 出荷実績表示
- **機能**: 母牛別の出荷実績詳細テーブル表示
- **表示項目**:
  - 母牛情報（名前、耳標番号）
  - 血統情報（父、母の父、母の祖父、母の母の祖父）
  - 繁殖情報（種付け年月日、分娩予定日、分娩日）
  - 出荷情報（体重、日齢、性別、価格、購買者、備考）
  - 集計情報（総収益、平均価格、出荷頭数、平均体重、平均日齢）

#### 2.1.3 収益分析
- **機能**: 母牛別の出荷収益の集計
- **分析項目**:
  - 母牛別総収益
  - 母牛別平均価格
  - 母牛別出荷頭数

### 2.2 出荷予定管理（シンプル版）

#### 2.2.1 出荷予定設定
- **機能**: 牛の出荷予定月を設定
- **入力項目**:
  - 牛ID（必須）
  - 出荷予定月（必須、YYYY-MM形式）
- **制約**:
  - 出荷予定月は未来の月のみ
  - 1頭につき1つの予定月のみ設定可能

#### 2.2.2 出荷予定一覧
- **機能**: 月別の出荷予定表示
- **表示項目**:
  - 月（YYYY-MM）
  - 予定出荷頭数
  - 予定出荷牛一覧（牛名、耳標番号、状態）

#### 2.2.3 出荷予定更新
- **機能**: 予定の変更・削除
- **操作**:
  - 予定月の変更
  - 予定の削除

### 2.3 出荷価格管理

#### 2.3.1 出荷価格記録
- **機能**: 実際の出荷価格を記録
- **記録項目**:
  - 出荷日
  - 出荷価格
  - 出荷重量（任意）

#### 2.3.2 価格履歴
- **機能**: 過去の出荷価格履歴表示
- **表示項目**:
  - 出荷日
  - 出荷価格
  - 出荷重量
  - 備考

#### 2.3.3 価格統計
- **機能**: 価格統計の表示
- **統計項目**:
  - 平均価格
  - 最高価格
  - 最低価格
  - 総出荷頭数
  - 月別統計

## 3. 非機能要件

### 3.1 性能要件
- 出荷実績一覧の表示: 3秒以内
- 出荷予定一覧の表示: 2秒以内
- 価格統計の計算: 5秒以内

### 3.2 可用性要件
- システム稼働率: 99%以上
- データバックアップ: 日次

### 3.3 セキュリティ要件
- 認証済みユーザーのみアクセス可能
- データの整合性チェック

## 4. データモデル

### 4.1 既存テーブルの拡張

#### 4.1.1 cattle テーブル
```sql
-- 既存テーブルに追加するカラム
ALTER TABLE cattle ADD COLUMN shipment_date TEXT;
ALTER TABLE cattle ADD COLUMN shipment_price INTEGER;
ALTER TABLE cattle ADD COLUMN shipment_weight REAL;
ALTER TABLE cattle ADD COLUMN planned_shipment_month TEXT; -- YYYY-MM形式
```

### 4.2 新規テーブル

#### 4.2.1 shipments テーブル
```sql
CREATE TABLE shipments (
    id TEXT PRIMARY KEY,
    cattle_id INTEGER NOT NULL,
    shipment_date TEXT NOT NULL,
    price INTEGER NOT NULL,
    weight REAL,
    age_at_shipment INTEGER, -- 出荷時日齢
    buyer TEXT, -- 購買者
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (cattle_id) REFERENCES cattle(cattle_id)
);
```

#### 4.2.2 血統情報の管理
**既存 cattle テーブルの血統関連カラム活用**
- `father_id`: 父牛のID
- `mother_id`: 母牛のID

**血統情報取得のためのビュー（推奨）**
```sql
-- 母牛別出荷実績ビュー
CREATE VIEW mother_shipment_summary AS
SELECT 
    m.cattle_id as mother_id,
    m.name as mother_name,
    m.ear_tag as mother_ear_tag,
    c.cattle_id as calf_id,
    c.name as calf_name,
    c.sex as calf_sex,
    c.birth_date as birth_date,
    c.breeding_date as breeding_date,
    c.expected_birth_date as expected_birth_date,
    s.shipment_date,
    s.price,
    s.weight as shipment_weight,
    s.age_at_shipment,
    s.buyer,
    s.notes,
    -- 血統情報
    f.name as father_name,
    mf.name as mother_father_name,
    mgf.name as mother_grandfather_name,
    mmgf.name as mother_mother_grandfather_name
FROM cattle m
LEFT JOIN cattle c ON c.mother_id = m.cattle_id
LEFT JOIN shipments s ON s.cattle_id = c.cattle_id
LEFT JOIN cattle f ON f.cattle_id = c.father_id
LEFT JOIN cattle mf ON mf.cattle_id = m.father_id
LEFT JOIN cattle mgf ON mgf.cattle_id = (SELECT father_id FROM cattle WHERE cattle_id = m.mother_id)
LEFT JOIN cattle mmgf ON mmgf.cattle_id = (SELECT father_id FROM cattle WHERE cattle_id = (SELECT mother_id FROM cattle WHERE cattle_id = m.mother_id))
WHERE m.sex = 'female' AND m.is_mother = 1;
```

## 5. API設計

### 5.1 出荷実績API

#### 5.1.1 出荷実績の記録
```
POST /api/v1/shipments
Content-Type: application/json
Authorization: Bearer {token}

{
  "cattleId": 123,
  "shipmentDate": "2024-12-15",
  "price": 150000,
  "weight": 450.5,
  "ageAtShipment": 300,
  "buyer": "JA○○",
  "notes": "市場Aで販売"
}
```

#### 5.1.2 出荷実績一覧の取得
```
GET /api/v1/shipments?from=2024-01-01&to=2024-12-31
Authorization: Bearer {token}
```

#### 5.1.3 母牛別出荷実績の詳細取得
```
GET /api/v1/shipments/mothers/{motherId}/details
Authorization: Bearer {token}

Response:
{
  "motherId": 123,
  "motherName": "さくら",
  "motherEarTag": "001",
  "calves": [
    {
      "calfId": 456,
      "calfName": "太郎",
      "sex": "male",
      "pedigree": {
        "father": "種雄A",
        "motherFather": "種雄B",
        "motherGrandfather": "種雄C",
        "motherMotherGrandfather": "種雄D"
      },
      "breedingDate": "2023-03-15",
      "expectedBirthDate": "2023-12-20",
      "birthDate": "2023-12-18",
      "shipment": {
        "shipmentDate": "2024-10-15",
        "weight": 450.5,
        "ageAtShipment": 301,
        "price": 150000,
        "buyer": "JA○○",
        "notes": "市場Aで販売"
      }
    }
  ]
}
```

#### 5.1.4 全母牛の出荷実績一覧取得（テーブル表示用）
```
GET /api/v1/shipments/mothers/list?page=1&limit=50&sortBy=motherName&sortOrder=asc&filterBy=year&filterValue=2024
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "motherId": 123,
      "motherName": "さくら",
      "motherEarTag": "001",
      "calfName": "太郎",
      "sex": "male",
      "pedigree": {
        "father": "種雄A",
        "motherFather": "種雄B", 
        "motherGrandfather": "種雄C",
        "motherMotherGrandfather": "種雄D"
      },
      "breedingDate": "2023-03-15",
      "expectedBirthDate": "2023-12-20",
      "birthDate": "2023-12-18",
      "shipmentDate": "2024-10-15",
      "shipmentWeight": 450.5,
      "ageAtShipment": 301,
      "price": 150000,
      "buyer": "JA○○",
      "notes": "市場Aで販売"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  },
  "summary": {
    "totalShipments": 150,
    "totalRevenue": 22500000,
    "averagePrice": 150000,
    "averageWeight": 445.2,
    "averageAge": 295
  }
}
```

### 5.2 出荷予定API

#### 5.2.1 出荷予定の設定
```
POST /api/v1/shipments/plans
Content-Type: application/json
Authorization: Bearer {token}

{
  "cattleId": 123,
  "plannedShipmentMonth": "2024-12"
}
```

#### 5.2.2 出荷予定一覧の取得
```
GET /api/v1/shipments/plans?month=2024-12
Authorization: Bearer {token}
```

#### 5.2.3 出荷予定の更新
```
PUT /api/v1/shipments/plans/{cattleId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "plannedShipmentMonth": "2025-01"
}
```

#### 5.2.4 出荷予定の削除
```
DELETE /api/v1/shipments/plans/{cattleId}
Authorization: Bearer {token}
```

### 5.3 価格統計API

#### 5.3.1 価格統計の取得
```
GET /api/v1/shipments/price-stats?period=monthly
Authorization: Bearer {token}
```

## 6. 画面設計

### 6.1 出荷管理画面

#### 6.1.1 画面構成
- **機能**: 出荷実績記録、出荷予定管理、価格統計を1画面で完結
- **レイアウト**: 3カラムレイアウト

#### 6.1.2 表示項目
**左カラム（出荷実績記録）**
- 出荷実績記録フォーム
- 最近の出荷実績一覧（最新10件）

**中央カラム（出荷予定管理）**
- 出荷予定設定フォーム
- 今月の出荷予定一覧
- 来月の出荷予定一覧

**右カラム（価格統計）**
- 価格統計サマリー
- 月別価格推移グラフ

### 6.2 母牛別出荷実績一覧画面

#### 6.2.1 画面構成
- **機能**: 母牛ごとの出荷実績を詳細テーブル形式で表示
- **レイアウト**: シングルページレイアウト（PC版）、アコーディオン形式（モバイル版）

#### 6.2.2 PC版テーブル表示項目
**母牛別出荷実績一覧テーブル**
- **母牛情報**:
  - 母牛名
  - 母牛耳標番号
- **血統情報**:
  - 父
  - 母の父
  - 母の祖父
  - 母の母の祖父
- **繁殖情報**:
  - 種付け年月日
  - 分娩予定日
  - 分娩日
- **出荷情報**:
  - 出荷時体重（kg）
  - 出荷時日齢（日）
  - 性別（雄/雌）
  - 価格（円）
  - 購買者
  - 備考

#### 6.2.3 テーブル機能
- **ソート機能**: 各カラムでのソート（昇順/降順）
- **フィルター機能**:
  - 母牛名での絞り込み
  - 出荷年での絞り込み
  - 価格範囲での絞り込み
  - 性別での絞り込み
- **エクスポート機能**: CSV形式でのデータエクスポート
- **ページネーション**: 50件/100件/200件表示切り替え

#### 6.2.4 サマリー情報
**画面上部に表示**
- 総出荷頭数
- 総収益
- 平均価格
- 平均出荷時体重
- 平均出荷時日齢

#### 6.2.5 モバイル版表示
**アコーディオン形式**
- 母牛名をヘッダーとしたカード表示
- 展開時に子牛の出荷実績詳細を表示
- 重要項目（価格、出荷日、性別）を優先表示

## 7. 実装計画

### 7.1 Phase 1: データベース拡張（1日）
- cattle テーブルの拡張
- shipments テーブルの作成
- マイグレーションスクリプトの作成

### 7.2 Phase 2: バックエンド実装（3-4日）
- 出荷ドメインの作成
- 出荷リポジトリの実装
- 出荷ユースケースの実装
- 出荷APIの実装
- 単体テストの作成

### 7.3 Phase 3: フロントエンド実装（2-3日）
- 出荷サービスの作成
- 出荷管理画面の作成
- 母牛別出荷実績画面の作成
- 統合テストの実行

### 7.4 Phase 4: テスト・デプロイ（1日）
- 結合テスト
- ユーザビリティテスト
- 本番環境へのデプロイ

## 8. 技術仕様

### 8.1 バックエンド技術
- **言語**: TypeScript
- **フレームワーク**: Hono
- **データベース**: Drizzle ORM
- **認証**: JWT

### 8.2 フロントエンド技術
- **言語**: TypeScript
- **フレームワーク**: Next.js 14
- **UIライブラリ**: shadcn/ui
- **状態管理**: React Server Components

### 8.3 データベース
- **エンジン**: SQLite (Cloudflare D1)
- **マイグレーション**: Drizzle Kit

## 9. 制約事項

### 9.1 機能制限
- 価格予測機能は含まない（過去実績のみ）
- 詳細な分析機能は含まない（基本的な集計のみ）
- 出荷予定は月単位のみ（日単位の予定は含まない）

### 9.2 技術制限
- 既存システムへの影響を最小限に抑制
- 既存の認証・認可システムを活用
- 既存のデータベース構造を最大限活用

## 10. 成功指標

### 10.1 機能指標
- 出荷実績の記録精度: 100%
- 出荷予定の管理精度: 95%以上
- 価格統計の計算精度: 100%

### 10.2 性能指標
- 画面表示速度: 3秒以内
- API応答時間: 1秒以内
- データ整合性: 100%

### 10.3 ユーザビリティ指標
- 操作の直感性: ユーザーテストで80%以上の満足度
- エラー発生率: 5%以下
- 学習コスト: 新機能の習得に30分以内

## 11. リスク管理

### 11.1 技術リスク
- **リスク**: 既存システムとの統合問題
- **対策**: 段階的な実装と十分なテスト

### 11.2 スケジュールリスク
- **リスク**: 実装期間の延長
- **対策**: 優先度の低い機能の後回し

### 11.3 データリスク
- **リスク**: データの不整合
- **対策**: データバリデーションの強化

## 12. 保守・運用

### 12.1 監視項目
- API応答時間
- エラー発生率
- データベース性能

### 12.2 バックアップ
- 日次データバックアップ
- 設定ファイルのバックアップ

### 12.3 アップデート
- 月次セキュリティアップデート
- 四半期機能アップデート

---

**文書作成日**: 2024年12月
**版数**: 1.0
**承認者**: 開発チーム

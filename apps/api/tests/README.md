# Test Suite - New Architecture

新アーキテクチャ用の包括的テストスイート

## 📁 テスト構成

```
tests/
├── unit/                    # ユニットテスト
│   ├── domain/             # ドメイン層テスト
│   │   ├── cattle.test.ts  # 牛管理ドメインロジック
│   │   └── kpi.test.ts     # KPI計算ロジック
│   ├── application/        # アプリケーション層テスト
│   │   └── cattle-usecases.test.ts # ユースケーステスト
│   ├── lib/                # ライブラリテスト
│   └── middleware/         # ミドルウェアテスト
├── integration/            # 統合テスト
│   ├── cattle/             # 牛管理API統合テスト
│   ├── events/             # イベント管理API統合テスト
│   ├── kpi/                # KPI API統合テスト
│   ├── alerts/             # アラート管理API統合テスト
│   └── auth/               # 認証API統合テスト
├── e2e/                    # エンドツーエンドテスト
│   └── api-workflow.test.ts # 全APIワークフローテスト
└── performance/            # パフォーマンステスト
    ├── api-benchmark.test.ts # APIベンチマーク
    └── benchmarks.ts       # パフォーマンス設定
```

## 🚀 テスト実行コマンド

### 基本テスト
```bash
# 全テスト実行
pnpm test:run

# ユニットテストのみ
pnpm test:run tests/unit/

# 統合テストのみ
pnpm test:run tests/integration/

# E2Eテストのみ
pnpm test:run tests/e2e/

# パフォーマンステストのみ
pnpm test:run tests/performance/
```

### 特定ドメインテスト
```bash
# 牛管理関連テスト
pnpm test:run tests/unit/domain/cattle.test.ts
pnpm test:run tests/integration/cattle/

# KPI関連テスト
pnpm test:run tests/unit/domain/kpi.test.ts
pnpm test:run tests/integration/kpi/

# 認証関連テスト
pnpm test:run tests/integration/auth/
```

### カバレッジレポート
```bash
# カバレッジ付きテスト実行
pnpm test:coverage

# HTMLレポート生成
pnpm test:coverage --reporter=html
```

## 📊 テスト種別

### 1. ユニットテスト
- **ドメイン関数**: 純粋関数のロジックテスト
- **ユースケース**: ビジネスロジックのテスト
- **バリデーション**: 入力検証のテスト

### 2. 統合テスト
- **API エンドポイント**: HTTPリクエスト/レスポンステスト
- **認証フロー**: JWT認証のテスト
- **データベース連携**: リポジトリ実装のテスト

### 3. エンドツーエンドテスト
- **完全ワークフロー**: 牛管理の全ライフサイクル
- **クロスドメイン**: 複数ドメインにまたがる処理
- **エラーハンドリング**: 異常系の動作確認

### 4. パフォーマンステスト
- **レスポンス時間**: 各APIの応答速度
- **メモリ使用量**: メモリリーク検出
- **同時実行**: 並行リクエスト処理
- **スケーラビリティ**: 大量データ処理

## 🎯 パフォーマンス目標

| 項目 | 目標値 |
|------|--------|
| ヘルスチェック | < 50ms |
| 単純GET操作 | < 200ms |
| 複雑計算処理 | < 500ms |
| データベース操作 | < 1000ms |
| メモリ増加量 | < 10MB |
| 同時実行数 | 50リクエスト |

## 🔧 テスト設定

### Mock設定
- **drizzle-orm/d1**: データベースモック
- **JWT認証**: トークン検証モック
- **外部API**: サービス呼び出しモック

### 環境変数
```bash
NODE_ENV=test
JWT_SECRET=test-secret
```

## 📈 テスト品質指標

### カバレッジ目標
- **ドメイン層**: 80%以上
- **アプリケーション層**: 70%以上
- **インフラ層**: 60%以上
- **インターフェース層**: 50%以上

### テスト実行時間
- **ユニットテスト**: < 500ms
- **統合テスト**: < 2000ms
- **E2Eテスト**: < 5000ms
- **パフォーマンステスト**: < 10000ms

## 🐛 トラブルシューティング

### よくある問題
1. **モジュール解決エラー**: パスエイリアス設定を確認
2. **型エラー**: Brand型の適切なキャスト
3. **モックエラー**: vi.mock()の設定確認

### デバッグ方法
```bash
# 詳細ログ付きテスト
pnpm test:run --reporter=verbose

# 特定テストのみ実行
pnpm test:run -t "should create cattle"

# ウォッチモード
pnpm test:watch
```

---

**新アーキテクチャ用の包括的テストスイートが完成しました！**

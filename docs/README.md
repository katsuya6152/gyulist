# GyuList ドキュメント

GyuList（牛の個体管理システム）の技術ドキュメント集です。

## 🔗 API 仕様（Swagger UI）

- 公開URL: [Gyulist Swagger UI](https://katsuya6152.github.io/gyulist/swagger/) 〔GitHub Pages〕

## 📋 ドキュメント一覧

### 🏗️ アーキテクチャ・設計

- **[API アーキテクチャガイド](./api-architecture.md)** - FDMアーキテクチャの詳細解説
  - 関数型ドメインモデリング（FDM）の原則
  - ヘキサゴナルアーキテクチャ（ポート&アダプタ）
  - ディレクトリ構造と実装パターン
  - 型安全性とエラーハンドリング戦略

- **[API 実装ガイド](./api-implementation-guide.md)** - 新機能開発の実践的ガイド
  - 新機能開発フロー（コンテキスト作成から実装まで）
  - 実装ベストプラクティス
  - パフォーマンス最適化とセキュリティ
  - テスト戦略とデバッグ方法

- **[アーキテクチャ判断記録](./architecture-decisions.md)** - 技術選定と設計判断の記録
  - 技術スタック選定理由
  - FDM移行完了記録
  - 将来の変更予定・検討事項

### 📂 用途別ドキュメント

- アーキテクチャ系: [docs/architecture/](./architecture/)
- 実装ガイド・規約: [docs/guides/](./guides/)
- データベース仕様: [docs/db/](./db/)
- API仕様（内部処理要件）: [docs/api-spec/](./api-spec/)

### 📊 データベース・スキーマ（従来の配置）

- **[コードベースガイド](./codebase-guide.md)** - プロジェクト全体の構造とガイド
- **[計算カラム](./calculated_columns.md)** - データベースの計算カラム仕様
- **[スキーマカラム](./schema_columns.md)** - データベーススキーマ詳細

## 🎯 ドキュメントの使い分け

### 新しく参加する開発者向け
1. **[アーキテクチャ判断記録](./architecture-decisions.md)** - なぜこの技術構成にしたのかを理解
2. **[API アーキテクチャガイド](./api-architecture.md)** - FDMアーキテクチャの全体像を把握
3. **[コードベースガイド](./codebase-guide.md)** - プロジェクト構造を理解

### 新機能を開発する開発者向け
1. **[API 実装ガイド](./api-implementation-guide.md)** - 実装手順とベストプラクティス
2. **[API アーキテクチャガイド](./api-architecture.md)** - パターンとサンプルコード
3. **[計算カラム](./calculated_columns.md)** / **[スキーマカラム](./schema_columns.md)** - DB設計時

### アーキテクチャを理解したい人向け
1. **[API アーキテクチャガイド](./api-architecture.md)** - 詳細なアーキテクチャ解説
2. **[アーキテクチャ判断記録](./architecture-decisions.md)** - 設計判断の背景

## 🔄 ドキュメント更新方針

- **新機能追加時**: `api-implementation-guide.md`にパターンを追加
- **技術選定変更時**: `architecture-decisions.md`に判断理由を記録
- **アーキテクチャ変更時**: `api-architecture.md`を更新
- **DB変更時**: `calculated_columns.md`や`schema_columns.md`を更新

## 📚 関連リソース

### 外部ドキュメント
- [Hono Documentation](https://hono.dev/) - APIフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - データベースORM
- [Zod](https://zod.dev/) - スキーマバリデーション
- [Vitest](https://vitest.dev/) - テストフレームワーク
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - ランタイム環境

### 学習リソース
- [関数型プログラミング](https://mostly-adequate.gitbook.io/mostly-adequate-guide/) - FDMの基礎
- [ヘキサゴナルアーキテクチャ](https://alistair.cockburn.us/hexagonal-architecture/) - ポート&アダプタパターン
- [Domain-Driven Design](https://domainlanguage.com/ddd/) - ドメイン駆動設計

---

**最終更新**: 2025年8月  
**プロジェクト**: GyuList v1.0  
**アーキテクチャ**: Functional Domain Modeling (FDM) + Hexagonal Architecture

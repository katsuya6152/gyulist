# 🐄 Gyulist - 牛群管理システム

URL: https://gyulist.com

Gyulistは、畜産農家向けの包括的な牛群管理システムです。個体識別、血統管理、繁殖情報の追跡、健康状態の記録など、牛の一生をデジタルで管理できます。

## ✨ 主な機能

### 🐮 牛群管理
- **個体登録・編集**: 個体識別番号、耳標番号、名号などの基本情報管理
- **血統情報**: 父牛、母の父牛、母の祖父牛、母の曾祖父牛の血統追跡
- **成長段階管理**: 仔牛、育成牛、肥育牛、初産牛、経産牛の段階別管理
- **年齢自動計算**: 生年月日から年齢、月齢、日齢を自動計算

### 🔄 繁殖管理
- **繁殖状態追跡**: 産次、分娩予定日、妊娠鑑定予定日の自動計算
- **繁殖統計**: 累計種付回数、受胎率、難産回数などの統計情報
- **繁殖メモ**: 繁殖に関する詳細なメモ記録
- **難産判定**: 前回出産の難産・安産判定

### 📊 データ分析
- **自動計算機能**: 生年月日、イベントデータに基づく自動計算
- **統計情報**: 繁殖成績、健康状態の統計分析
- **検索・フィルタ**: 成長段階、性別、年齢による検索機能

## 🏗️ アーキテクチャ(技術スタック)

### フロントエンド (Web)
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Form**: Conform + Zod (型安全なフォーム管理)
- **State**: React Server Actions
- **Deployment**: Cloudflare Pages

### バックエンド (API)
- **Framework**: Hono (軽量Webフレームワーク)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: JWT
- **Deployment**: Cloudflare Workers

### インフラストラクチャ
- **Hosting**: Cloudflare Pages (フロントエンド)
- **API**: Cloudflare Workers (バックエンド)
- **Database**: Cloudflare D1 (SQLite)
- **CI/CD**: GitHub Actions

## 🚀 クイックスタート

### 前提条件
- Node.js 20以上
- pnpm
- Cloudflareアカウント
- Wrangler CLI

### 1. リポジトリのクローン
```bash
git clone
cd gyulist
```

### 2. 依存関係のインストール
```bash
pnpm install
```

### 3. 環境変数の設定

#### API (apps/api)
```bash
cd apps/api
cp .env.example .env.local
```

必要な環境変数:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `JWT_SECRET`

#### Web (apps/web)
```bash
cd apps/web
cp .env.example .env.local
```

必要な環境変数:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### 4. データベースのセットアップ
```bash
cd apps/api
pnpm run migrate:local  # ローカル開発用
pnpm run migrate:remote # 本番環境用
```

### 5. 開発サーバーの起動

#### API
```bash
cd apps/api
pnpm run dev
```

#### Web
```bash
cd apps/web
pnpm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

### 事前登録フォームと管理画面

トップページの「正式開始の先行案内」フォームから事前登録できます。Cloudflare Turnstile を利用するため `NEXT_PUBLIC_TURNSTILE_SITE_KEY` を設定してください。

登録内容は `/pre-registers` で確認できます。ユーザー名とパスワードを入力して Basic 認証を通過すると一覧が表示され、検索・期間指定・流入元フィルタ・CSV ダウンロードが利用できます。

## 📁 プロジェクト構造

```
gyulist/
├── apps/
│   ├── api/                 # バックエンド (Hono + Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── routes/      # APIルート
│   │   │   ├── services/    # ビジネスロジック
│   │   │   ├── repositories/# データアクセス層
│   │   │   ├── validators/  # バリデーション
│   │   │   └── db/         # データベース設定
│   │   └── drizzle/        # マイグレーションファイル
│   └── web/                # フロントエンド (Next.js)
│       ├── src/
│       │   ├── app/        # Next.js App Router
│       │   ├── features/   # 機能別コンポーネント
│       │   ├── components/ # 共通UIコンポーネント
│       │   └── lib/        # ユーティリティ
│       └── public/         # 静的ファイル
├── docs/                   # ドキュメント
└── .github/workflows/      # CI/CD設定
```

## 🛠️ 開発

### 利用可能なスクリプト

#### ルート
```bash
pnpm format        # コードフォーマット
pnpm lint          # リント
pnpm web           # Webアプリのスクリプト実行
pnpm api           # APIのスクリプト実行
```

#### API
```bash
pnpm run dev              # 開発サーバー起動
pnpm run build            # ビルド
pnpm run deploy           # Cloudflare Workersにデプロイ
pnpm run migrate:local    # ローカルDBマイグレーション
pnpm run migrate:remote   # 本番DBマイグレーション
```

#### Web
```bash
pnpm run dev              # 開発サーバー起動
pnpm run build            # ビルド
pnpm run deploy           # Cloudflare Pagesにデプロイ
pnpm run preview          # 本番環境のプレビュー
```

### データベース操作

#### マイグレーション生成
```bash
cd apps/api
pnpm run generate
```

#### ダミーデータ作成
```bash
cd apps/api
pnpm run create-dummy-data:local   # ローカル用
pnpm run create-dummy-data:remote  # 本番用
```

## 🚀 デプロイメント

### 自動デプロイ
GitHubのmainブランチにプッシュすると、GitHub Actionsが自動的にデプロイを実行します。

### 手動デプロイ

#### API
```bash
cd apps/api
pnpm run deploy
```

#### Web
```bash
cd apps/web
pnpm run deploy
```

## 📊 データベース設計

### 主要テーブル
- **cattle**: 牛の基本情報
- **bloodline**: 血統情報
- **breeding_status**: 繁殖状態
- **breeding_summary**: 繁殖統計
- **events**: イベント記録

詳細なスキーマは [docs/schema_columns.md](docs/schema_columns.md) を参照してください。

---

**Gyulist** - デジタルで牛群を管理し、酪農の未来を創造する 🐄✨

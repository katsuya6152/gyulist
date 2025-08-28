# Gyulist Media

牛の管理・飼育に関する情報を発信するメディアサイトです。

## 技術スタック

- **Framework**: Next.js 15
- **Content Management**: Contentlayer + MDX
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Deployment**: Cloudflare Pages

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

開発サーバーは http://localhost:3002 で起動します。

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── posts/             # 記事関連ページ
│   ├── categories/        # カテゴリページ
│   ├── contact/           # お問い合わせページ
│   ├── privacy/           # プライバシーポリシー
│   └── terms/             # 利用規約
├── components/            # UIコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── article-card.tsx  # 記事カード
│   ├── breadcrumbs.tsx   # パンくずリスト
│   ├── header.tsx        # ヘッダー
│   ├── footer.tsx        # フッター
│   ├── share-buttons.tsx # シェアボタン
│   └── cta-section.tsx   # CTAセクション
├── lib/                  # ユーティリティ
│   └── utils.ts          # 共通関数
└── styles/               # スタイル
    └── globals.css       # グローバルCSS

content/
├── posts/                # 記事コンテンツ（MDX）
└── pages/                # 固定ページコンテンツ（MDX）
```

## 記事の作成

記事は `content/posts/` ディレクトリにMDXファイルとして作成します。

### フロントマター

```yaml
---
title: "記事のタイトル"
description: "記事の概要"
publishedAt: "2024-01-15"
category: "カテゴリ名"
tags: ["タグ1", "タグ2"]
image: "/images/article-image.jpg"
author: "著者名"
featured: true  # 注目記事フラグ
draft: false    # 下書きフラグ
---
```

## デプロイ

### Cloudflare Pagesへのデプロイ

```bash
# ビルド
pnpm run pages:build

# プレビュー
pnpm run preview

# デプロイ
pnpm run deploy
```

## SEO対策

- メタタグの適切な設定
- JSON-LD構造化データ
- サイトマップの自動生成
- robots.txtの設定
- Open Graphタグ
- Twitter Cardタグ

## アナリティクス

- Google Analytics 4 対応
- Google Search Console 連携
- CVイベント追跡（LINE登録、Gyulist遷移）

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。



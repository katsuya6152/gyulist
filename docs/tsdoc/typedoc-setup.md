# TypeDoc Documentation Setup

このドキュメントでは、TypeDocによるAPIドキュメント生成とGitHub Pagesへの自動デプロイについて説明します。

## 📋 概要

- **目的**: APIコードの変更時に自動でTypeDocドキュメントを生成し、GitHub Pagesにデプロイ
- **対象**: `apps/api/` 配下のTypeScriptファイル
- **デプロイ先**: https://katsuya6152.github.io/gyulist/typedoc/
- **トリガー**: `apps/api/**` への変更（PR・mainブランチへのpush）

## 🏗️ 構成

### 1. TypeDoc設定
- **設定ファイル**: `apps/api/typedoc.json`
- **出力先**: `docs/tsdoc/api/`
- **対象ファイル**: ルート、ドメインモデル、ポート、共有型など

### 2. CI/CDワークフロー
- **ファイル**: `.github/workflows/typedoc-deploy.yml`
- **実行条件**: 
  - PR: ドキュメント生成 + アーティファクト保存
  - main push: ドキュメント生成 + GitHub Pagesデプロイ

### 3. スクリプト
```bash
# ローカルでの生成
pnpm -F api run docs:gen

# ローカルでのサーブ
pnpm -F api run docs:serve
```

## 🔧 セットアップ手順

### 1. GitHub Pages設定
リポジトリの Settings > Pages で以下を設定：

- **Source**: "GitHub Actions"
- **Branch**: 自動設定（ワークフローが管理）

### 2. 権限設定
ワークフローに必要な権限：
- `contents: read`
- `pages: write`
- `id-token: write`

### 3. 環境設定
- **Environment**: `github-pages`
- **URL**: 自動設定（デプロイ後に表示）

## 📁 ファイル構成

```
.github/workflows/
  └── typedoc-deploy.yml    # CI/CDワークフロー

apps/api/
  ├── typedoc.json          # TypeDoc設定
  ├── package.json          # スクリプト定義
  └── src/
      ├── routes/           # APIルート
      ├── contexts/         # ドメインロジック
      └── shared/           # 共有型・ユーティリティ

docs/
  └── tsdoc/
      └── api/              # 生成されたドキュメント
```

## 🚀 ワークフロー詳細

### PR時
1. `apps/api/**` の変更を検知
2. TypeDocドキュメントを生成
3. アーティファクトとして保存
4. PRにコメントで生成状況を通知

### mainブランチpush時
1. `apps/api/**` の変更を検知
2. TypeDocドキュメントを生成
3. GitHub Pagesにデプロイ
4. デプロイURLを環境出力として提供

## 📝 カスタマイズ

### 新しいファイルを追加
`apps/api/typedoc.json` の `entryPoints` に追加：

```json
{
  "entryPoints": [
    "./src/routes/cattle.ts",
    "./src/contexts/cattle/domain/model/newFile.ts",  // 追加
    // ...
  ]
}
```

### 出力先変更
`apps/api/typedoc.json` の `out` を変更：

```json
{
  "out": "../../docs/tsdoc/custom-path"
}
```

### デプロイパス変更
`.github/workflows/typedoc-deploy.yml` の `path` を変更：

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: docs/tsdoc/custom-path/  # 変更
```

## 🔍 トラブルシューティング

### ドキュメントが生成されない
1. `apps/api/` 配下の変更か確認
2. TypeDoc設定ファイルの構文チェック
3. ローカルで `pnpm run docs:gen` を実行してエラー確認

### GitHub Pagesにデプロイされない
1. リポジトリの Pages 設定を確認
2. ワークフローの権限設定を確認
3. 環境変数 `GITHUB_TOKEN` が正しく設定されているか確認

### リンクが切れている
1. `entryPoints` に必要なファイルが含まれているか確認
2. 相対パスが正しいか確認
3. TypeDocの警告メッセージを確認

## 📚 参考リンク

- [TypeDoc公式ドキュメント](https://typedoc.org/)
- [GitHub Pages公式ドキュメント](https://docs.github.com/en/pages)
- [GitHub Actions公式ドキュメント](https://docs.github.com/en/actions)

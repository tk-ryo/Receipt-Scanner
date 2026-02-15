---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# React + TypeScript コーディング規約

## コンポーネント設計

- `components/ui/` — shadcn/ui が自動生成。手動編集しない
- `components/layout/` — ページ共通のレイアウト部品
- `components/receipt/` — レシート業務に関する部品
- ページコンポーネントは `pages/` に配置し、ルーティングと状態管理を担当

## 状態管理

- サーバー状態は各 `hooks/` のカスタムフックで管理
- グローバル状態管理ライブラリは使わない（Phase 1 スコープ）
- フォーム状態はコンポーネントローカルの `useState` で管理

## API呼び出し

- `api/client.ts` の Axios インスタンスを経由する。`fetch()` を直接使わない
- API関数は `api/receipts.ts` にまとめる。コンポーネントから直接 Axios を呼ばない

## 型定義

- API レスポンスの型は `types/receipt.ts` に定義
- コンポーネント Props の型はコンポーネントファイル内に定義

## 命名規則

| 対象 | 規則 |
|---|---|
| ファイル名 | PascalCase (コンポーネント), camelCase (その他) |
| 関数 | camelCase |
| 型 | PascalCase |
| 定数 | UPPER_SNAKE_CASE |

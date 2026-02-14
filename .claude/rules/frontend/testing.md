---
paths:
  - "frontend/**/*.test.ts"
  - "frontend/**/*.test.tsx"
  - "frontend/**/__tests__/**/*"
  - "frontend/vitest.config.*"
---

# React + TypeScript テストルール

フレームワーク: Vitest + React Testing Library / 実行: `cd frontend && npx vitest run`

## ディレクトリ構成

```
frontend/src/
├── components/receipt/__tests__/ReceiptForm.test.tsx
├── hooks/__tests__/useReceipts.test.ts
└── api/__tests__/receipts.test.ts
```

## 規約

- ファイル名: `<対象ファイル名>.test.ts(x)`
- テストファイルは対象ファイルと同階層の `__tests__/` に配置
- `components/ui/` (shadcn/ui) のテストは書かない
- API呼び出しは `vi.mock()` でモックする
- コンポーネントテストは `render` + `screen` + `userEvent` を使用

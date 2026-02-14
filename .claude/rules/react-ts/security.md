---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# React + TypeScript セキュリティルール

認証不要・シングルユーザー・クローズ環境前提。ただし基本的な対策は実装する。

## XSS 防止

- ユーザー入力やAPIレスポンスを `dangerouslySetInnerHTML` で描画しない

## API 呼び出し

- `api/client.ts` の Axios インスタンス経由で行い、baseURL を一元管理する

## 依存パッケージ

- 既知の脆弱性があるパッケージを放置しない
- パッケージ追加時はメンテナンス状況と脆弱性情報を確認する

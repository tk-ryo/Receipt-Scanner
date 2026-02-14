# テストルール

## テストフレームワーク

| レイヤー | フレームワーク | 実行コマンド |
|---|---|---|
| Backend | pytest | `cd backend && python -m pytest` |
| Frontend | Vitest + React Testing Library | `cd frontend && npx vitest run` |

## Backend テスト

### ディレクトリ構成

```
backend/
└── tests/
    ├── conftest.py          # 共通フィクスチャ (テスト用DBセッション等)
    ├── test_receipt_service.py
    ├── test_vision_service.py
    └── test_routers/
        └── test_receipts.py
```

### 規約

- ファイル名: `test_<対象モジュール名>.py`
- 関数名: `test_<テスト対象の振る舞い>` (日本語コメントで補足可)
- テスト用DBは SQLite インメモリ (`:memory:`) を使用し、本番DBに影響を与えない
- FastAPI エンドポイントのテストは `TestClient` を使用する
- 外部API (Claude Vision API) はモックする。実際のAPI呼び出しをテストに含めない
- フィクスチャは `conftest.py` に集約する

### テストの書き方

- Arrange-Act-Assert パターンに従う
- 1テスト関数につき1つの振る舞いを検証する
- テストデータはフィクスチャまたはファクトリ関数で生成する

## Frontend テスト

### ディレクトリ構成

```
frontend/
└── src/
    ├── components/
    │   └── receipt/
    │       └── __tests__/
    │           └── ReceiptForm.test.tsx
    ├── hooks/
    │   └── __tests__/
    │       └── useReceipts.test.ts
    └── api/
        └── __tests__/
            └── receipts.test.ts
```

### 規約

- ファイル名: `<対象ファイル名>.test.ts(x)`
- テストファイルは対象ファイルと同階層の `__tests__/` ディレクトリに配置する
- `components/ui/` (shadcn/ui) のテストは書かない
- API呼び出しは `vi.mock()` でモックする
- コンポーネントテストは `render` + `screen` + `userEvent` を使用する

## 共通

- テストは副作用を残さない (DB、ファイル、環境変数)
- CI で全テストが通ることを前提にコードを変更する
- 新機能追加・バグ修正時は対応するテストも追加する

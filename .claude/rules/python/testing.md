---
paths:
  - "backend/tests/**/*.py"
  - "backend/conftest.py"
---

# Python テストルール

フレームワーク: pytest / 実行: `cd backend && python -m pytest`

## ディレクトリ構成

```
backend/tests/
├── conftest.py          # 共通フィクスチャ (テスト用DBセッション等)
├── test_receipt_service.py
├── test_vision_service.py
└── test_routers/
    └── test_receipts.py
```

## 規約

- ファイル名: `test_<対象モジュール名>.py`
- 関数名: `test_<テスト対象の振る舞い>` (日本語コメントで補足可)
- テスト用DBは SQLite インメモリ (`:memory:`) を使用
- FastAPI エンドポイントのテストは `TestClient` を使用
- 外部API (Claude Vision API) はモックする
- フィクスチャは `conftest.py` に集約する

## テストの書き方

- Arrange-Act-Assert パターンに従う
- 1テスト関数につき1つの振る舞いを検証する
- テストデータはフィクスチャまたはファクトリ関数で生成する

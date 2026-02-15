---
paths:
  - "backend/app/**/*.py"
---

# Python コーディング規約

## ディレクトリ責務

| ディレクトリ | 責務 | 置かないもの |
|---|---|---|
| `routers/` | HTTPリクエスト受付・レスポンス返却 | ビジネスロジック、DB操作 |
| `services/` | ビジネスロジック・外部API呼出 | HTTPレスポンス生成 |
| `models/` | SQLAlchemy ORMモデル定義 | バリデーションロジック |
| `schemas/` | Pydantic リクエスト/レスポンススキーマ | DB操作 |

## パターン

- DB セッションは `database.py` の `get_db` を FastAPI の `Depends()` で注入する
- Router → Service → Model の単方向依存。Service が Router を import しない
- 非同期関数は `async def` で定義。DB操作は同期SQLAlchemyのため `def` でも可
- 環境変数は `config.py` で一元管理。各ファイルで直接 `os.getenv()` しない

## エラーハンドリング

- Router層で `HTTPException` を raise する
- Service層は Python例外 (`ValueError`, `FileNotFoundError` 等) を使い、HTTP概念を持ち込まない

## API設計

- エンドポイントのパスは `/api/` プレフィックス付き
- レスポンスモデルは `response_model` パラメータで明示する
- 一覧系は `{"items": [...], "total": N}` 形式で返す

## 命名規則

| 対象 | 規則 |
|---|---|
| ファイル名 | snake_case |
| 関数 | snake_case |
| クラス | PascalCase |
| 定数 | UPPER_SNAKE_CASE |

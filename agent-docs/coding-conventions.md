# コーディング規約

## Backend (Python / FastAPI)

### ディレクトリ責務

| ディレクトリ | 責務 | 置かないもの |
|---|---|---|
| `routers/` | HTTPリクエスト受付・レスポンス返却 | ビジネスロジック、DB操作 |
| `services/` | ビジネスロジック・外部API呼出 | HTTPレスポンス生成 |
| `models/` | SQLAlchemy ORMモデル定義 | バリデーションロジック |
| `schemas/` | Pydantic リクエスト/レスポンススキーマ | DB操作 |

### パターン

- DB セッションは `database.py` の `get_db` を FastAPI の `Depends()` で注入する
- Router → Service → Model の単方向依存。Service が Router を import しない
- 非同期関数は `async def` で定義。DB操作は同期SQLAlchemyのため `def` でも可
- 環境変数は `config.py` で一元管理。各ファイルで直接 `os.getenv()` しない

### エラーハンドリング

- Router層で `HTTPException` を raise する
- Service層は Python例外 (`ValueError`, `FileNotFoundError` 等) を使い、HTTP概念を持ち込まない

### API設計

- エンドポイントのパスは `/api/` プレフィックス付き
- レスポンスモデルは `response_model` パラメータで明示する
- 一覧系は `{"items": [...], "total": N}` 形式で返す

## Frontend (React + TypeScript)

### コンポーネント設計

- `components/ui/` — shadcn/ui が自動生成。手動編集しない
- `components/layout/` — ページ共通のレイアウト部品
- `components/receipt/` — レシート業務に関する部品
- ページコンポーネントは `pages/` に配置し、ルーティングと状態管理を担当

### 状態管理

- サーバー状態は各 `hooks/` のカスタムフックで管理
- グローバル状態管理ライブラリは使わない（Phase 1 スコープ）
- フォーム状態はコンポーネントローカルの `useState` で管理

### API呼び出し

- `api/client.ts` の Axios インスタンスを経由する。`fetch()` を直接使わない
- API関数は `api/receipts.ts` にまとめる。コンポーネントから直接 Axios を呼ばない

### 型定義

- API レスポンスの型は `types/receipt.ts` に定義
- コンポーネント Props の型はコンポーネントファイル内に定義

## 共通

### 命名規則

| 対象 | Backend (Python) | Frontend (TypeScript) |
|---|---|---|
| ファイル名 | snake_case | PascalCase (コンポーネント), camelCase (その他) |
| 関数 | snake_case | camelCase |
| クラス / 型 | PascalCase | PascalCase |
| 定数 | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE |

### コミットメッセージ

`<type>: <summary>` 形式。type は feat / fix / refactor / docs / chore から選択。

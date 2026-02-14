# Receipt Scanner

## WHY — プロジェクト概要

マイクロ法人の経費精算に使うパーソナル経費管理Webアプリ。
レシート画像をアップロードすると Claude Vision API が内容を解析し、
構造化データ（日付・店名・金額・品目など）として自動抽出・保存する。
認証不要・シングルユーザー・クローズ環境前提。日本語のみ対応。

## WHAT — 技術スタックと構造

| レイヤー | 技術 |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS v4 |
| Backend | FastAPI + Python |
| AI | Claude Vision API (claude-sonnet-4-20250514) |
| DB | SQLite + SQLAlchemy |
| HTTP Client | Axios |
| 画像処理 | Pillow（サムネイル生成） |
| チャート | recharts（月次サマリー） |

```
Receipt-Scanner/
├── backend/
│   ├── app/
│   │   ├── main.py              # エントリポイント + CORS + グローバル例外ハンドラ
│   │   ├── config.py            # 環境変数・定数管理
│   │   ├── database.py          # SQLAlchemy エンジン・セッション
│   │   ├── models/              # ORM モデル (Receipt, ReceiptItem)
│   │   ├── schemas/             # Pydantic スキーマ (receipt, summary)
│   │   ├── routers/             # APIエンドポイント (receipts, summary)
│   │   └── services/            # ビジネスロジック
│   │       ├── vision_service.py     # Claude Vision API 連携
│   │       ├── receipt_service.py    # CRUD + フィルタ/ソート
│   │       ├── image_service.py      # 画像バリデーション・保存・サムネイル生成
│   │       ├── export_service.py     # CSV生成
│   │       ├── category_service.py   # 品目→カテゴリ補助分類
│   │       └── summary_service.py    # 月次集計
│   └── uploads/                 # アップロード画像 + thumbs/
├── frontend/
│   └── src/
│       ├── api/                 # Axios クライアント・API関数 (receipts, summary)
│       ├── components/
│       │   ├── ui/              # shadcn/ui (自動生成・編集不可)
│       │   ├── layout/          # Header, PageContainer
│       │   └── receipt/         # 業務コンポーネント群
│       ├── pages/               # ScanPage, HistoryPage, ReceiptDetailPage, DashboardPage
│       ├── hooks/               # カスタムフック
│       └── types/               # 型定義 (receipt, summary)
└── CLAUDE.md
```

## HOW — 開発ワークフロー

### 起動

```bash
# Backend (port 8000)
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (port 5173)
cd frontend && npm install && npm run dev
```

### テスト

```bash
cd backend && python -m pytest
cd frontend && npx vitest run
```

### 環境変数

`backend/.env` に `ANTHROPIC_API_KEY` を設定（`.env.example` 参照）。

### API確認

Backend起動後 http://localhost:8000/docs で Swagger UI を確認。

### ビルド

```bash
cd frontend && npm run build
```

## 設計上の注意事項

- Backend API のベースパスは `/api`。画像配信は `/uploads/{filename}` (StaticFiles)
- DB全フィールド NULLABLE — Vision API が読み取れない項目を null で返す設計
- フロントの状態遷移: idle → uploading → analyzing → done / error
- フロントのルーティング: `/` (スキャン), `/history` (履歴), `/receipts/:id` (詳細), `/dashboard` (月次サマリー)
- CSVエクスポートは BOM付きUTF-8（Excel互換）
- 一括アップロード時は Vision API を順次呼出（レート制限考慮）
- サムネイルは `uploads/thumbs/` に保存、Receipt テーブルの `thumbnail_path` で参照

## 詳細ドキュメント

関連する作業を行う際に必要に応じて参照すること（常時読み込み不要）。

| ファイル | 参照タイミング |
|---|---|
| `docs/rules/code-style.md` | コード追加・変更時 |
| `docs/rules/testing.md` | テスト追加・変更時 |
| `docs/rules/security.md` | セキュリティに関わる変更時 |

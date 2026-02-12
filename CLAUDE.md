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

```
Receipt-Scanner/
├── backend/          # FastAPI アプリケーション
│   ├── app/
│   │   ├── main.py           # エントリポイント + CORS
│   │   ├── config.py         # 環境変数管理
│   │   ├── database.py       # SQLAlchemy エンジン・セッション
│   │   ├── models/           # ORM モデル (Receipt, ReceiptItem)
│   │   ├── schemas/          # Pydantic スキーマ
│   │   ├── routers/          # APIエンドポイント
│   │   └── services/         # ビジネスロジック
│   │       ├── vision_service.py   # Claude Vision API 連携
│   │       ├── receipt_service.py  # CRUD操作
│   │       └── image_service.py    # 画像バリデーション・保存
│   └── uploads/              # アップロード画像保存先
├── frontend/         # React SPA
│   └── src/
│       ├── api/              # Axios クライアント・API関数
│       ├── components/
│       │   ├── ui/           # shadcn/ui (自動生成)
│       │   ├── layout/       # Header, PageContainer
│       │   └── receipt/      # 業務コンポーネント群
│       ├── pages/            # ScanPage, HistoryPage, ReceiptDetailPage
│       ├── hooks/            # カスタムフック
│       └── types/            # 型定義
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

### 環境変数

`backend/.env` に `ANTHROPIC_API_KEY` を設定（`.env.example` 参照）。

### API確認

Backend起動後 http://localhost:8000/docs で Swagger UI を確認。

### ビルド

```bash
cd frontend && npm run build
```

## 詳細ドキュメント

タスク開始前に、関連するドキュメントを読んでから作業すること。

| ファイル | 内容 |
|---|---|
| `agent-docs/coding-conventions.md` | コーディング規約 — レイヤー責務・命名規則・API設計パターン |

## 設計上の注意事項

- Backend API のベースパスは `/api`。画像配信は `/uploads/{filename}` (StaticFiles)
- DB全フィールド NULLABLE — Vision API が読み取れない項目を null で返す設計
- フロントの状態遷移: idle → uploading → analyzing → done / error

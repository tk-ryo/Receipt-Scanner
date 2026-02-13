# Receipt Scanner — Phase 1 作業リスト

## 1. プロジェクト初期セットアップ

- [x] Backend: FastAPI プロジェクト作成 (`backend/app/main.py`, `requirements.txt`)
- [x] Backend: `.env.example` 作成、`config.py` で環境変数管理
- [x] Backend: CORS設定（localhost:5173 許可）
- [x] Frontend: Vite + React + TypeScript プロジェクト作成
- [x] Frontend: Tailwind CSS v4 導入
- [x] Frontend: shadcn/ui 導入・初期コンポーネント追加
- [x] Frontend: Axios インスタンス作成 (`api/client.ts`)
- [x] Frontend: React Router 設定 (`App.tsx`)
- [x] `.gitignore` 作成
- [x] GiTにコミット

## 2. DB設計・モデル定義

- [x] `database.py`: SQLAlchemy エンジン・セッション・`get_db` 定義
- [x] `models/receipt.py`: Receipt, ReceiptItem ORM モデル定義
- [x] `schemas/receipt.py`: Pydantic リクエスト/レスポンススキーマ定義
- [x] GiTにコミット（コメントは日本語）

## 3. 画像アップロードAPI

- [ ] `services/image_service.py`: MIMEタイプ検証・UUID名生成・保存
- [ ] `routers/receipts.py`: `POST /api/receipts/scan` エンドポイント（ファイル受付部分）
- [ ] `main.py`: `/uploads` StaticFiles マウント
- [ ] `uploads/` ディレクトリ作成
- [ ] GiTにコミット（コメントは日本語）

## 4. Claude Vision API 連携

- [ ] `services/vision_service.py`: base64エンコード → API呼出 → JSONパース
- [ ] レシート解析プロンプト作成（日付・店名・金額・税額・品目・支払方法・カテゴリ）
- [ ] パース失敗時の正規表現フォールバック実装
- [ ] GiTにコミット（コメントは日本語）

## 5. スキャンAPI完成（結合）

- [ ] `POST /api/receipts/scan`: 画像保存 + Vision解析 + DB保存を結合
- [ ] `services/receipt_service.py`: create 操作実装
- [ ] Swagger UI で動作確認
- [ ] GiTにコミット（コメントは日本語）

## 6. CRUD API

- [ ] `GET /api/receipts`: 一覧取得（ページネーション対応）
- [ ] `GET /api/receipts/{id}`: 詳細取得
- [ ] `PUT /api/receipts/{id}`: 更新（品目の追加・削除・変更含む）
- [ ] `DELETE /api/receipts/{id}`: 削除（画像ファイルも削除）
- [ ] GiTにコミット（コメントは日本語）

## 7. Frontend: 画像アップロード

- [ ] `types/receipt.ts`: TypeScript 型定義
- [ ] `api/receipts.ts`: API呼び出し関数群
- [ ] `components/receipt/ImageUploader.tsx`: D&D + ファイル選択 UI
- [ ] `components/receipt/ReceiptPreview.tsx`: 画像プレビュー表示
- [ ] `hooks/useReceiptUpload.ts`: アップロード状態管理フック
- [ ] GiTにコミット（コメントは日本語）

## 8. Frontend: 解析結果表示

- [ ] `components/receipt/AnalysisLoading.tsx`: スケルトンUI
- [ ] `components/receipt/AnalysisResult.tsx`: カード形式の結果表示
- [ ] `components/layout/Header.tsx`: アプリヘッダー
- [ ] `components/layout/PageContainer.tsx`: ページコンテナ
- [ ] `pages/ScanPage.tsx`: メイン画面（アップロード→解析→結果表示）
- [ ] GiTにコミット（コメントは日本語）

## 9. Frontend: 編集フォーム・保存

- [ ] `components/receipt/ReceiptEditForm.tsx`: 各フィールド編集フォーム
- [ ] `components/receipt/ItemsTable.tsx`: 品目テーブル（行追加・削除・編集）
- [ ] `hooks/useReceiptEdit.ts`: 編集状態管理・保存フック
- [ ] Toast通知（保存成功・エラー）
- [ ] GiTにコミット（コメントは日本語）

## 10. Frontend: 履歴・詳細画面

- [ ] `hooks/useReceipts.ts`: レシート一覧取得フック
- [ ] `pages/HistoryPage.tsx`: 過去レシート一覧
- [ ] `pages/ReceiptDetailPage.tsx`: レシート詳細・再編集画面
- [ ] GiTにコミット（コメントは日本語）

## 11. chrome-devtools-mcp の設定

- [ ] chrome-devtools-mcp をプロジェクトの MCP設定に追加
- [ ] 接続確認（ブラウザ操作・スクリーンショット取得が動作すること）
- [ ] GiTにコミット（コメントは日本語）

## 12. Agent Skill「browser-verify」の作成

- [ ] `.claude/skills/browser-verify/SKILL.md` を作成
- [ ] Skill内容の定義:
  - [ ] chrome-devtools-mcp でブラウザを自動操作する手順
  - [ ] 正常系テストシナリオ（アップロード→解析→編集→保存→履歴確認）
  - [ ] 異常系テストシナリオ（不正ファイル形式・サイズ超過・存在しないID等）
  - [ ] スクリーンショットを `docs/evidence/` に保存する手順
  - [ ] 検証レポート `docs/evidence/REPORT.md` の生成フォーマット定義
- [ ] GiTにコミット（コメントは日本語）

## 13. 自動検証の実行

- [ ] Backend + Frontend を起動
- [ ] `/browser-verify` Skill を実行
- [ ] 検証レポート (`docs/evidence/REPORT.md`) の確認
- [ ] 不具合があれば修正し再検証

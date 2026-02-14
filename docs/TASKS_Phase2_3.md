# Receipt Scanner — Phase 2 / Phase 3 作業リスト

## Phase 2：実用化

### 2-1. エラーハンドリング強化

- [x] `feature/phase2-error-handling` ブランチを main から作成
- [x] `backend/app/main.py`: `RequestValidationError` + 汎用 `Exception` グローバルハンドラ追加
- [x] `frontend/src/api/client.ts`: Axios レスポンスインターセプター追加（ステータスコード別メッセージ変換、ネットワークエラー判定）
- [x] `frontend/src/hooks/useReceiptUpload.ts`: catch ブロックで API エラー詳細メッセージ取得
- [x] `frontend/src/hooks/useReceipts.ts`: 同上
- [x] `frontend/src/pages/HistoryPage.tsx`: エラー表示にリトライボタン追加
- [x] `frontend/src/pages/ReceiptDetailPage.tsx`: エラー表示にリトライボタン追加
- [x] Backend テスト: エラーハンドラの動作確認テスト追加
- [ ] 動作確認（Swagger UI + ブラウザ）※Python環境未構築のため実行保留
- [x] Git にコミット

### 2-2. 履歴ソート・フィルタ

- [x] `backend/app/services/receipt_service.py`: `get_receipts` にフィルタ/ソートパラメータ追加（sort_by, sort_order, date_from, date_to, category, amount_min, amount_max, search）
- [x] `backend/app/routers/receipts.py`: `list_receipts` にクエリパラメータ追加
- [x] `frontend/src/types/receipt.ts`: `ReceiptFilterParams` 型追加
- [x] `frontend/src/api/receipts.ts`: `getReceipts` にフィルタパラメータ引数追加
- [x] `frontend/src/hooks/useReceipts.ts`: フィルタ状態管理・`setFilters` 公開・フィルタ変更時に page=1 リセット
- [x] `frontend/src/components/receipt/ReceiptFilters.tsx`: 新規作成 — 折りたたみ式フィルタパネル（日付範囲、カテゴリ、金額範囲、店名検索、ソート）
- [x] `frontend/src/pages/HistoryPage.tsx`: `ReceiptFilters` コンポーネント配置
- [x] Backend テスト: フィルタ/ソートのクエリテスト追加
- [ ] 動作確認（Swagger UI + ブラウザ）
- [x] Git にコミット

### 2-3. サムネイル表示

- [x] `backend/requirements.txt`: `Pillow` 追加
- [x] `backend/app/config.py`: `THUMBNAIL_DIR` 定数追加
- [x] `backend/app/models/receipt.py`: `thumbnail_path` カラム追加（Text, nullable）
- [x] `backend/app/schemas/receipt.py`: `ReceiptResponse` に `thumbnail_path` 追加
- [x] `backend/app/services/image_service.py`: `generate_thumbnail` 関数追加（Pillow で 200x200 リサイズ、JPEG 保存）
- [x] `backend/app/services/receipt_service.py`: `create_receipt` に `thumbnail_path` パラメータ追加
- [x] `backend/app/routers/receipts.py`: `scan_receipt` でサムネイル生成を呼出
- [x] DB スキーマ更新（開発段階では DB 再作成で対応）
- [x] `frontend/src/types/receipt.ts`: `Receipt` に `thumbnail_path` 追加
- [x] `frontend/src/pages/HistoryPage.tsx`: `ReceiptCard` にサムネイル画像表示
- [x] `frontend/src/components/receipt/ImageLightbox.tsx`: 新規作成 — shadcn/ui Dialog ベースのフルサイズ画像プレビュー
- [x] `frontend/src/pages/ReceiptDetailPage.tsx`: 画像クリックでライトボックス表示
- [ ] 動作確認（Swagger UI + ブラウザ）
- [ ] Git にコミット

### 2-4. CSVエクスポート

- [ ] `backend/app/services/export_service.py`: 新規作成 — `generate_csv(receipts)` BOM付きUTF-8（カラム: ID/日付/店名/合計金額/税額/支払方法/カテゴリ/品目）
- [ ] `backend/app/routers/receipts.py`: `GET /api/receipts/export/csv` 追加（`/{receipt_id}` より前に定義、フィルタパラメータ対応、`StreamingResponse`）
- [ ] `frontend/src/api/receipts.ts`: `exportCsv(filters)` 関数追加（`responseType: "blob"` → ダウンロードリンク動的生成）
- [ ] `frontend/src/pages/HistoryPage.tsx`: 「CSVエクスポート」ボタン追加（現在のフィルタ条件を適用）
- [ ] Backend テスト: CSV 生成ロジックのテスト追加
- [ ] 動作確認（CSV ダウンロード → Excel で開いて文字化けなし確認）
- [ ] Git にコミット

### Phase 2 完了チェック

- [ ] `/browser-verify` Skill で Phase 2 機能の E2E 検証
- [ ] 検証レポート更新
- [ ] Git にコミット

---

## Phase 3：発展

### 3-1. カテゴリ自動分類強化

- [ ] `backend/app/config.py`: `CATEGORIES` 定数リスト追加
- [ ] `backend/app/services/vision_service.py`: プロンプト改善（カテゴリ判定基準を詳細に指示）
- [ ] `backend/app/services/category_service.py`: 新規作成 — `classify_by_items(items)` キーワード辞書による品目→カテゴリ補助分類
- [ ] `backend/app/routers/receipts.py`: `scan_receipt` で Vision API が `category=null` の場合に `category_service` で補完
- [ ] Backend テスト: カテゴリ分類ロジックのテスト追加
- [ ] 動作確認（カテゴリ null のレシートで補完が動作すること）
- [ ] Git にコミット

### 3-2. 月次サマリーダッシュボード

- [ ] `backend/app/schemas/summary.py`: 新規作成 — `MonthlySummaryResponse`, `CategorySummary`, `MonthOption`, `MonthlyListResponse`
- [ ] `backend/app/services/summary_service.py`: 新規作成 — `get_monthly_summary(db, year, month)` GROUP BY category + SUM
- [ ] `backend/app/routers/summary.py`: 新規作成 — `GET /api/summary/monthly`, `GET /api/summary/monthly-list`
- [ ] `backend/app/main.py`: `summary` ルーター追加
- [ ] `frontend/package.json`: `recharts` 追加
- [ ] `frontend/src/types/summary.ts`: 新規作成 — `MonthlySummary`, `CategorySummary`, `MonthOption`
- [ ] `frontend/src/api/summary.ts`: 新規作成 — `getMonthlySummary`, `getMonthlyList`
- [ ] `frontend/src/hooks/useMonthlySummary.ts`: 新規作成 — サマリーデータ取得フック
- [ ] `frontend/src/components/receipt/MonthlySummaryCard.tsx`: 新規作成 — 合計金額・件数表示カード
- [ ] `frontend/src/components/receipt/CategoryPieChart.tsx`: 新規作成 — recharts PieChart ラッパー
- [ ] `frontend/src/pages/DashboardPage.tsx`: 新規作成 — 年月セレクター + サマリーカード + 円グラフ
- [ ] `frontend/src/App.tsx`: `/dashboard` ルート追加
- [ ] `frontend/src/components/layout/Header.tsx`: 「ダッシュボード」ナビリンク追加
- [ ] Backend テスト: 集計ロジックのテスト追加
- [ ] 動作確認（Swagger UI + ブラウザ）
- [ ] Git にコミット

### 3-3. 複数画像一括アップロード

- [ ] `backend/app/schemas/receipt.py`: `BatchScanResultItem`, `BatchScanResponse` 追加
- [ ] `backend/app/routers/receipts.py`: `POST /api/receipts/scan/batch` 追加（`files: list[UploadFile]` 順次処理、個別の成功/失敗を記録）
- [ ] `frontend/src/types/receipt.ts`: `BatchScanResult`, `BatchScanResultItem` 型追加
- [ ] `frontend/src/api/receipts.ts`: `batchScanReceipts(files: File[])` 追加
- [ ] `frontend/src/hooks/useBatchUpload.ts`: 新規作成 — 一括アップロード専用フック（files, results, progress, status）
- [ ] `frontend/src/components/receipt/BatchUploadProgress.tsx`: 新規作成 — 各ファイルの処理状態リスト表示
- [ ] `frontend/src/components/receipt/ImageUploader.tsx`: `multiple` 属性追加、`onFilesSelect` コールバック対応
- [ ] `frontend/src/pages/ScanPage.tsx`: 単一/一括モード切替UI追加
- [ ] Backend テスト: バッチスキャンのテスト追加
- [ ] 動作確認（複数画像アップロード → 全件処理確認）
- [ ] Git にコミット

### Phase 3 完了チェック

- [ ] `/browser-verify` Skill で Phase 3 機能の E2E 検証
- [ ] 検証レポート更新
- [ ] CLAUDE.md の最終確認・更新
- [ ] Git にコミット

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import AnalysisLoading from "@/components/receipt/AnalysisLoading";
import AnalysisResult from "@/components/receipt/AnalysisResult";
import BatchUploadProgress from "@/components/receipt/BatchUploadProgress";
import ImageUploader from "@/components/receipt/ImageUploader";
import ReceiptEditForm from "@/components/receipt/ReceiptEditForm";
import ReceiptPreview from "@/components/receipt/ReceiptPreview";
import { useBatchUpload } from "@/hooks/useBatchUpload";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
import type { Receipt } from "@/types/receipt";
import { Files, Loader2, Pencil, RotateCcw, ScanLine } from "lucide-react";

export default function ScanPage() {
  const [batchMode, setBatchMode] = useState(false);

  // 単一アップロード
  const { status, receipt, error, file, previewUrl, selectFile, upload, reset } =
    useReceiptUpload();
  const [editing, setEditing] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);

  // 一括アップロード
  const batch = useBatchUpload();

  const displayReceipt = currentReceipt ?? receipt;
  const isProcessing = status === "uploading" || status === "analyzing";

  const handleScanReset = () => {
    reset();
    setEditing(false);
    setCurrentReceipt(null);
  };

  const handleSaved = (updated: Receipt) => {
    setCurrentReceipt(updated);
    setEditing(false);
  };

  const handleModeToggle = () => {
    setBatchMode(!batchMode);
    handleScanReset();
    batch.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
        {/* モード切替 */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant={batchMode ? "outline" : "default"}
            size="sm"
            onClick={() => batchMode && handleModeToggle()}
          >
            <ScanLine className="h-4 w-4" />
            単一スキャン
          </Button>
          <Button
            variant={batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => !batchMode && handleModeToggle()}
          >
            <Files className="h-4 w-4" />
            一括スキャン
          </Button>
        </div>

        {!batchMode ? (
          /* 単一モード */
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左カラム: 画像 */}
            <div className="space-y-4">
              {previewUrl ? (
                <ReceiptPreview src={previewUrl} />
              ) : (
                <ImageUploader
                  onFileSelect={selectFile}
                  disabled={isProcessing}
                />
              )}

              {/* アクションボタン */}
              {file && status === "idle" && (
                <div className="flex gap-2">
                  <Button onClick={upload} className="flex-1">
                    <ScanLine className="h-4 w-4" />
                    スキャン開始
                  </Button>
                  <Button variant="outline" onClick={handleScanReset}>
                    <RotateCcw className="h-4 w-4" />
                    やり直す
                  </Button>
                </div>
              )}

              {isProcessing && (
                <Button disabled className="w-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status === "uploading" ? "アップロード中..." : "AI解析中..."}
                </Button>
              )}

              {status === "done" && (
                <div className="flex gap-2">
                  {!editing && (
                    <Button
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4" />
                      編集
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleScanReset} className="flex-1">
                    <RotateCcw className="h-4 w-4" />
                    新しいレシートをスキャン
                  </Button>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* 右カラム: 解析結果 / 編集フォーム */}
            <div>
              {isProcessing && <AnalysisLoading />}
              {status === "done" && displayReceipt && !editing && (
                <AnalysisResult receipt={displayReceipt} />
              )}
              {status === "done" && displayReceipt && editing && (
                <ReceiptEditForm
                  receipt={displayReceipt}
                  onSaved={handleSaved}
                />
              )}
              {status === "idle" && !file && (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
                  <p className="text-sm text-muted-foreground">
                    レシート画像をアップロードすると、ここに解析結果が表示されます
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 一括モード */
          <div className="space-y-4">
            {batch.status === "idle" && (
              <>
                <ImageUploader
                  multiple
                  onFilesSelect={batch.selectFiles}
                  disabled={false}
                />
                {batch.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {batch.files.length}件のファイルが選択されています
                    </p>
                    <ul className="text-sm space-y-1">
                      {batch.files.map((f, i) => (
                        <li key={i} className="text-muted-foreground">
                          {f.name}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button onClick={batch.upload} className="flex-1">
                        <ScanLine className="h-4 w-4" />
                        一括スキャン開始（{batch.files.length}件）
                      </Button>
                      <Button variant="outline" onClick={batch.reset}>
                        <RotateCcw className="h-4 w-4" />
                        クリア
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {batch.status === "uploading" && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  一括処理中... {batch.files.length}件のレシートを解析しています
                </span>
              </div>
            )}

            {batch.status === "done" && batch.result && (
              <div className="space-y-4">
                <BatchUploadProgress result={batch.result} />
                <Button variant="outline" onClick={batch.reset}>
                  <RotateCcw className="h-4 w-4" />
                  新しい一括スキャン
                </Button>
              </div>
            )}

            {batch.error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {batch.error}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

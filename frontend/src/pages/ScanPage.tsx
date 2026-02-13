import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import AnalysisLoading from "@/components/receipt/AnalysisLoading";
import AnalysisResult from "@/components/receipt/AnalysisResult";
import ImageUploader from "@/components/receipt/ImageUploader";
import ReceiptPreview from "@/components/receipt/ReceiptPreview";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
import { Loader2, RotateCcw, ScanLine } from "lucide-react";

export default function ScanPage() {
  const { status, receipt, error, file, previewUrl, selectFile, upload, reset } =
    useReceiptUpload();

  const isProcessing = status === "uploading" || status === "analyzing";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
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
                <Button variant="outline" onClick={reset}>
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
              <Button variant="outline" onClick={reset} className="w-full">
                <RotateCcw className="h-4 w-4" />
                新しいレシートをスキャン
              </Button>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* 右カラム: 解析結果 */}
          <div>
            {isProcessing && <AnalysisLoading />}
            {status === "done" && receipt && (
              <AnalysisResult receipt={receipt} />
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
      </PageContainer>
    </div>
  );
}

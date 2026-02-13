import { useCallback, useState } from "react";
import { scanReceipt } from "@/api/receipts";
import type { Receipt } from "@/types/receipt";

export type UploadStatus = "idle" | "uploading" | "analyzing" | "done" | "error";

interface UseReceiptUploadReturn {
  status: UploadStatus;
  receipt: Receipt | null;
  error: string | null;
  file: File | null;
  previewUrl: string | null;
  selectFile: (file: File) => void;
  upload: () => Promise<void>;
  reset: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function useReceiptUpload(): UseReceiptUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectFile = useCallback((selected: File) => {
    // クライアントバリデーション
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("対応していないファイル形式です（JPEG/PNG/WebPのみ対応）");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("ファイルサイズが10MBを超えています");
      return;
    }

    // 前のプレビューURLを解放
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
    setReceipt(null);
    setStatus("idle");
  }, [previewUrl]);

  const upload = useCallback(async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      setStatus("analyzing");
      const result = await scanReceipt(file);
      setReceipt(result);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "アップロード中にエラーが発生しました";
      setError(message);
      setStatus("error");
    }
  }, [file]);

  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setStatus("idle");
    setReceipt(null);
    setError(null);
    setFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  return { status, receipt, error, file, previewUrl, selectFile, upload, reset };
}

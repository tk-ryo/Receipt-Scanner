import { useCallback, useState } from "react";
import { batchScanReceipts } from "@/api/receipts";
import type { BatchScanResult } from "@/types/receipt";

export type BatchUploadStatus = "idle" | "uploading" | "done" | "error";

interface UseBatchUploadReturn {
  status: BatchUploadStatus;
  files: File[];
  result: BatchScanResult | null;
  error: string | null;
  progress: number; // 0-100
  selectFiles: (files: File[]) => void;
  upload: () => Promise<void>;
  reset: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function useBatchUpload(): UseBatchUploadReturn {
  const [status, setStatus] = useState<BatchUploadStatus>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<BatchScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const selectFiles = useCallback((selected: File[]) => {
    const valid = selected.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_SIZE) return false;
      return true;
    });

    if (valid.length === 0) {
      setError("対応していないファイル形式またはサイズ超過です");
      return;
    }

    if (valid.length < selected.length) {
      setError(`${selected.length - valid.length}件のファイルがスキップされました（形式/サイズ不正）`);
    } else {
      setError(null);
    }

    setFiles(valid);
    setResult(null);
    setStatus("idle");
    setProgress(0);
  }, []);

  const upload = useCallback(async () => {
    if (files.length === 0) return;

    setStatus("uploading");
    setError(null);
    setProgress(10);

    try {
      const data = await batchScanReceipts(files);
      setResult(data);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "一括アップロード中にエラーが発生しました";
      setError(message);
      setStatus("error");
    }
  }, [files]);

  const reset = useCallback(() => {
    setStatus("idle");
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { status, files, result, error, progress, selectFiles, upload, reset };
}

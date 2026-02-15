import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BatchScanResult } from "@/types/receipt";

interface BatchUploadProgressProps {
  result: BatchScanResult;
}

export default function BatchUploadProgress({ result }: BatchUploadProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          一括アップロード結果（成功: {result.success_count}件 / 失敗: {result.error_count}件）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {result.results.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm"
            >
              {item.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              )}
              <div>
                <span className="font-medium">{item.filename}</span>
                {item.success && item.receipt && (
                  <span className="text-muted-foreground ml-2">
                    — {item.receipt.store_name ?? "店名不明"}
                    {item.receipt.total_amount != null &&
                      ` / ${item.receipt.total_amount.toLocaleString()}円`}
                  </span>
                )}
                {!item.success && item.error && (
                  <span className="text-destructive ml-2">— {item.error}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Receipt } from "@/types/receipt";

interface AnalysisResultProps {
  receipt: Receipt;
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "-";
  return `\u00a5${amount.toLocaleString()}`;
}

export default function AnalysisResult({ receipt }: AnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {receipt.store_name ?? "店名不明"}
        </CardTitle>
        <CardDescription>{receipt.date ?? "日付不明"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 金額情報 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">合計金額</p>
            <p className="text-xl font-bold">{formatAmount(receipt.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">税額</p>
            <p className="text-lg">{formatAmount(receipt.tax)}</p>
          </div>
        </div>

        {/* バッジ */}
        <div className="flex flex-wrap gap-2">
          {receipt.payment_method && (
            <Badge variant="secondary">{receipt.payment_method}</Badge>
          )}
          {receipt.category && (
            <Badge variant="outline">{receipt.category}</Badge>
          )}
        </div>

        <Separator />

        {/* 品目一覧 */}
        {receipt.items.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">品目</p>
            <div className="space-y-1">
              {receipt.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">
                    {item.name ?? "品名不明"}
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-muted-foreground ml-1">
                        x{item.quantity}
                      </span>
                    )}
                  </span>
                  <span className="font-medium ml-2 shrink-0">
                    {formatAmount(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

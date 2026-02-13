import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import { useReceipts } from "@/hooks/useReceipts";
import type { Receipt } from "@/types/receipt";
import { ChevronLeft, ChevronRight, Receipt as ReceiptIcon } from "lucide-react";

function formatAmount(amount: number | null): string {
  if (amount == null) return "-";
  return `\u00a5${amount.toLocaleString()}`;
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <Link to={`/receipts/${receipt.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">
              {receipt.store_name ?? "店名不明"}
            </p>
            <p className="text-sm text-muted-foreground">
              {receipt.date ?? "日付不明"}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {receipt.payment_method && (
                <Badge variant="secondary" className="text-xs">
                  {receipt.payment_method}
                </Badge>
              )}
              {receipt.category && (
                <Badge variant="outline" className="text-xs">
                  {receipt.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="ml-4 text-right shrink-0">
            <p className="text-lg font-bold">{formatAmount(receipt.total_amount)}</p>
            <p className="text-xs text-muted-foreground">
              {receipt.items.length > 0 && `${receipt.items.length}品目`}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const PER_PAGE = 20;

export default function HistoryPage() {
  const { items, total, loading, error, page, setPage } = useReceipts();
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">レシート履歴</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground">{total}件</p>
            )}
          </div>

          {/* ローディング */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* レシート一覧 */}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-2">
              {items.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} />
              ))}
            </div>
          )}

          {/* 空状態 */}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ReceiptIcon className="h-12 w-12 mb-4" />
              <p className="text-sm">レシートがまだありません</p>
              <Link to="/">
                <Button variant="outline" className="mt-4">
                  スキャンする
                </Button>
              </Link>
            </div>
          )}

          {/* ページネーション */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

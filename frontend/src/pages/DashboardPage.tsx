import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import CategoryPieChart from "@/components/receipt/CategoryPieChart";
import MonthlySummaryCard from "@/components/receipt/MonthlySummaryCard";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { months, selectedYear, selectedMonth, summary, loading, error, selectMonth } =
    useMonthlySummary();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">月次ダッシュボード</h1>

          {/* 年月セレクター */}
          {months.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mr-2">
                対象月:
              </label>
              <select
                className="rounded-md border px-3 py-1.5 text-sm bg-background"
                value={selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : ""}
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-").map(Number);
                  selectMonth(y, m);
                }}
              >
                {months.map((m) => (
                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                    {m.year}年{m.month}月（{m.count}件）
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && summary && selectedYear && selectedMonth && (
            <>
              <MonthlySummaryCard
                totalAmount={summary.total_amount}
                totalCount={summary.total_count}
                year={selectedYear}
                month={selectedMonth}
              />
              <CategoryPieChart categories={summary.categories} />
            </>
          )}

          {!loading && !error && months.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
              <p className="text-sm text-muted-foreground">
                レシートデータがありません。レシートをスキャンするとダッシュボードが表示されます。
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

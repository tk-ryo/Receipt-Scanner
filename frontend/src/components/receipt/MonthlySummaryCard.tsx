import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, FileText } from "lucide-react";

interface MonthlySummaryCardProps {
  totalAmount: number;
  totalCount: number;
  year: number;
  month: number;
}

export default function MonthlySummaryCard({
  totalAmount,
  totalCount,
  year,
  month,
}: MonthlySummaryCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {year}年{month}月 合計金額
          </CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {totalAmount.toLocaleString()}円
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            レシート件数
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalCount}件</p>
        </CardContent>
      </Card>
    </div>
  );
}

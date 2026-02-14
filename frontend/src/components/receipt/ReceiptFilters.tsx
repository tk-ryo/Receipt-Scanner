import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReceiptFilterParams } from "@/types/receipt";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";

interface ReceiptFiltersProps {
  filters: ReceiptFilterParams;
  onFiltersChange: (filters: ReceiptFilterParams) => void;
}

const CATEGORIES = [
  "食費",
  "交通費",
  "日用品",
  "医療費",
  "通信費",
  "光熱費",
  "交際費",
  "衣服・美容",
  "教育・書籍",
  "娯楽・趣味",
  "住居費",
  "保険",
  "税金",
  "雑費",
  "その他",
];

const SORT_OPTIONS = [
  { value: "created_at", label: "登録日" },
  { value: "date", label: "レシート日付" },
  { value: "total_amount", label: "合計金額" },
  { value: "store_name", label: "店名" },
];

export default function ReceiptFilters({ filters, onFiltersChange }: ReceiptFiltersProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.date_from ||
    filters.date_to ||
    filters.category ||
    filters.amount_min !== undefined ||
    filters.amount_max !== undefined ||
    filters.search;

  const handleChange = (key: keyof ReceiptFilterParams, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFiltersChange({
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    });
  };

  return (
    <div className="space-y-2">
      {/* ヘッダー: ソート + 折りたたみトグル */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select
            value={filters.sort_by ?? "created_at"}
            onValueChange={(v) => handleChange("sort_by", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sort_order ?? "desc"}
            onValueChange={(v) => handleChange("sort_order", v)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">新しい順</SelectItem>
              <SelectItem value="asc">古い順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4 mr-1" />
          フィルタ
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              !
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      {/* フィルタパネル */}
      {open && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 店名検索 */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-search">店名検索</Label>
              <Input
                id="filter-search"
                placeholder="店名で検索..."
                value={filters.search ?? ""}
                onChange={(e) => handleChange("search", e.target.value || undefined)}
              />
            </div>

            {/* カテゴリ */}
            <div className="space-y-1.5">
              <Label>カテゴリ</Label>
              <Select
                value={filters.category ?? "__all__"}
                onValueChange={(v) => handleChange("category", v === "__all__" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 日付範囲 */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-date-from">日付（開始）</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={filters.date_from ?? ""}
                onChange={(e) => handleChange("date_from", e.target.value || undefined)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-date-to">日付（終了）</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={filters.date_to ?? ""}
                onChange={(e) => handleChange("date_to", e.target.value || undefined)}
              />
            </div>

            {/* 金額範囲 */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-amount-min">金額（下限）</Label>
              <Input
                id="filter-amount-min"
                type="number"
                placeholder="0"
                value={filters.amount_min ?? ""}
                onChange={(e) =>
                  handleChange("amount_min", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-amount-max">金額（上限）</Label>
              <Input
                id="filter-amount-max"
                type="number"
                placeholder="上限なし"
                value={filters.amount_max ?? ""}
                onChange={(e) =>
                  handleChange("amount_max", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* フィルタクリア */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                フィルタをクリア
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

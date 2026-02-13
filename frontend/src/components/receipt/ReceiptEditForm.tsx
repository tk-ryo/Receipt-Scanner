import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ItemsTable from "@/components/receipt/ItemsTable";
import { useReceiptEdit } from "@/hooks/useReceiptEdit";
import type { Receipt } from "@/types/receipt";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ReceiptEditFormProps {
  receipt: Receipt;
  onSaved: (updated: Receipt) => void;
}

const PAYMENT_METHODS = ["現金", "クレジットカード", "電子マネー", "QRコード決済", "不明"];
const CATEGORIES = ["食費", "日用品", "交通費", "通信費", "交際費", "医療費", "その他"];

export default function ReceiptEditForm({ receipt, onSaved }: ReceiptEditFormProps) {
  const { form, saving, setField, setItem, addItem, removeItem, save } =
    useReceiptEdit(receipt);

  const handleSave = async () => {
    try {
      const updated = await save();
      toast.success("保存しました");
      onSaved(updated);
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">レシート編集</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 店名 */}
        <div className="space-y-1">
          <Label htmlFor="store_name">店名</Label>
          <Input
            id="store_name"
            value={form.store_name ?? ""}
            onChange={(e) => setField("store_name", e.target.value || null)}
            disabled={saving}
          />
        </div>

        {/* 日付・金額 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={form.date ?? ""}
              onChange={(e) => setField("date", e.target.value || null)}
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="total_amount">合計金額</Label>
            <Input
              id="total_amount"
              type="number"
              min={0}
              value={form.total_amount ?? ""}
              onChange={(e) =>
                setField("total_amount", e.target.value ? parseFloat(e.target.value) : null)
              }
              disabled={saving}
            />
          </div>
        </div>

        {/* 税額 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tax">税額</Label>
            <Input
              id="tax"
              type="number"
              min={0}
              value={form.tax ?? ""}
              onChange={(e) =>
                setField("tax", e.target.value ? parseFloat(e.target.value) : null)
              }
              disabled={saving}
            />
          </div>
        </div>

        {/* 支払方法・カテゴリ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>支払方法</Label>
            <Select
              value={form.payment_method ?? ""}
              onValueChange={(v) => setField("payment_method", v || null)}
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>カテゴリ</Label>
            <Select
              value={form.category ?? ""}
              onValueChange={(v) => setField("category", v || null)}
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* 品目テーブル */}
        <ItemsTable
          items={form.items}
          onItemChange={setItem}
          onAdd={addItem}
          onRemove={removeItem}
          disabled={saving}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "保存中..." : "保存"}
        </Button>
      </CardFooter>
    </Card>
  );
}

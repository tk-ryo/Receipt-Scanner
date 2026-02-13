import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReceiptItemCreate } from "@/types/receipt";
import { Plus, Trash2 } from "lucide-react";

interface ItemsTableProps {
  items: ReceiptItemCreate[];
  onItemChange: (index: number, field: keyof ReceiptItemCreate, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function ItemsTable({
  items,
  onItemChange,
  onAdd,
  onRemove,
  disabled,
}: ItemsTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">品目</p>
        <Button
          variant="outline"
          size="xs"
          onClick={onAdd}
          disabled={disabled}
          type="button"
        >
          <Plus className="h-3 w-3" />
          追加
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>品名</TableHead>
            <TableHead className="w-20">数量</TableHead>
            <TableHead className="w-24">単価</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={item.name ?? ""}
                  onChange={(e) => onItemChange(index, "name", e.target.value)}
                  placeholder="品名"
                  disabled={disabled}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity ?? ""}
                  onChange={(e) => onItemChange(index, "quantity", e.target.value)}
                  disabled={disabled}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={item.price ?? ""}
                  onChange={(e) => onItemChange(index, "price", e.target.value)}
                  disabled={disabled}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  type="button"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                品目がありません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { useCallback, useState } from "react";
import { updateReceipt } from "@/api/receipts";
import type { Receipt, ReceiptItemCreate, ReceiptUpdate } from "@/types/receipt";

interface UseReceiptEditReturn {
  form: ReceiptUpdate;
  saving: boolean;
  setField: <K extends keyof ReceiptUpdate>(key: K, value: ReceiptUpdate[K]) => void;
  setItem: (index: number, field: keyof ReceiptItemCreate, value: string) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  save: () => Promise<Receipt>;
}

function receiptToForm(receipt: Receipt): ReceiptUpdate {
  return {
    store_name: receipt.store_name,
    date: receipt.date,
    total_amount: receipt.total_amount,
    tax: receipt.tax,
    payment_method: receipt.payment_method,
    category: receipt.category,
    items: receipt.items.map(({ name, quantity, price }) => ({
      name,
      quantity,
      price,
    })),
  };
}

export function useReceiptEdit(receipt: Receipt): UseReceiptEditReturn {
  const [form, setForm] = useState<ReceiptUpdate>(() => receiptToForm(receipt));
  const [saving, setSaving] = useState(false);

  const setField = useCallback(
    <K extends keyof ReceiptUpdate>(key: K, value: ReceiptUpdate[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setItem = useCallback(
    (index: number, field: keyof ReceiptItemCreate, value: string) => {
      setForm((prev) => {
        const items = [...prev.items];
        const item = { ...items[index] };
        if (field === "name") {
          item.name = value || null;
        } else if (field === "quantity") {
          item.quantity = value ? parseFloat(value) : null;
        } else if (field === "price") {
          item.price = value ? parseFloat(value) : null;
        }
        items[index] = item;
        return { ...prev, items };
      });
    },
    [],
  );

  const addItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: null, quantity: 1, price: null }],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      return await updateReceipt(receipt.id, form);
    } finally {
      setSaving(false);
    }
  }, [receipt.id, form]);

  return { form, saving, setField, setItem, addItem, removeItem, save };
}

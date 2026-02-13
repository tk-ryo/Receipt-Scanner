import { useCallback, useEffect, useState } from "react";
import { getReceipts } from "@/api/receipts";
import type { Receipt } from "@/types/receipt";

interface UseReceiptsReturn {
  items: Receipt[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

const PER_PAGE = 20;

export function useReceipts(): UseReceiptsReturn {
  const [items, setItems] = useState<Receipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * PER_PAGE;
      const res = await getReceipts(skip, PER_PAGE);
      setItems(res.items);
      setTotal(res.total);
    } catch {
      setError("レシート一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, total, loading, error, page, setPage, refresh: fetch };
}

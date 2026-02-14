import { useCallback, useEffect, useState } from "react";
import { getMonthlySummary, getMonthlyList } from "@/api/summary";
import type { MonthlySummary, MonthOption } from "@/types/summary";

interface UseMonthlySummaryReturn {
  months: MonthOption[];
  selectedYear: number | null;
  selectedMonth: number | null;
  summary: MonthlySummary | null;
  loading: boolean;
  error: string | null;
  selectMonth: (year: number, month: number) => void;
}

export function useMonthlySummary(): UseMonthlySummaryReturn {
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 利用可能な月リストを取得
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getMonthlyList();
        if (cancelled) return;
        setMonths(list);
        // 最新月を自動選択
        if (list.length > 0) {
          setSelectedYear(list[0].year);
          setSelectedMonth(list[0].month);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "月リストの取得に失敗しました");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 選択月が変わったらサマリーを取得
  useEffect(() => {
    if (selectedYear === null || selectedMonth === null) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMonthlySummary(selectedYear, selectedMonth);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "サマリーの取得に失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedYear, selectedMonth]);

  const selectMonth = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  return { months, selectedYear, selectedMonth, summary, loading, error, selectMonth };
}

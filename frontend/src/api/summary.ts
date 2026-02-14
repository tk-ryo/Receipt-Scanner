import client from "./client";
import type { MonthlySummary, MonthOption } from "@/types/summary";

export async function getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  const { data } = await client.get<MonthlySummary>("/summary/monthly", {
    params: { year, month },
  });
  return data;
}

export async function getMonthlyList(): Promise<MonthOption[]> {
  const { data } = await client.get<{ months: MonthOption[] }>("/summary/monthly-list");
  return data.months;
}

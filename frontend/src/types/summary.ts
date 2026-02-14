export interface CategorySummary {
  category: string;
  total_amount: number;
  count: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  total_amount: number;
  total_count: number;
  categories: CategorySummary[];
}

export interface MonthOption {
  year: number;
  month: number;
  count: number;
}

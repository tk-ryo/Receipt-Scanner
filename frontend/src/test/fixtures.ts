import type { Receipt, ReceiptItem, BatchScanResult, BatchScanResultItem } from "@/types/receipt";
import type { MonthlySummary, MonthOption } from "@/types/summary";

export function createMockReceiptItem(overrides?: Partial<ReceiptItem>): ReceiptItem {
  return {
    id: 1,
    name: "コーヒー",
    quantity: 1,
    price: 350,
    ...overrides,
  };
}

export function createMockReceipt(overrides?: Partial<Receipt>): Receipt {
  return {
    id: 1,
    store_name: "テストストア",
    date: "2025-01-15",
    total_amount: 1500,
    tax: 136,
    payment_method: "現金",
    category: "食費",
    image_path: "/uploads/test.jpg",
    thumbnail_path: "/uploads/thumbs/test.jpg",
    items: [createMockReceiptItem()],
    created_at: "2025-01-15T10:00:00",
    updated_at: "2025-01-15T10:00:00",
    ...overrides,
  };
}

export function createMockBatchScanResult(overrides?: Partial<BatchScanResult>): BatchScanResult {
  return {
    results: [
      {
        filename: "receipt1.jpg",
        success: true,
        receipt: createMockReceipt(),
        error: null,
      } satisfies BatchScanResultItem,
      {
        filename: "receipt2.jpg",
        success: false,
        receipt: null,
        error: "解析に失敗しました",
      } satisfies BatchScanResultItem,
    ],
    success_count: 1,
    error_count: 1,
    ...overrides,
  };
}

export function createMockMonthlySummary(overrides?: Partial<MonthlySummary>): MonthlySummary {
  return {
    year: 2025,
    month: 1,
    total_amount: 50000,
    total_count: 10,
    categories: [
      { category: "食費", total_amount: 30000, count: 6 },
      { category: "日用品", total_amount: 20000, count: 4 },
    ],
    ...overrides,
  };
}

export function createMockMonthOption(overrides?: Partial<MonthOption>): MonthOption {
  return {
    year: 2025,
    month: 1,
    count: 10,
    ...overrides,
  };
}

// --- ReceiptItem ---

export interface ReceiptItem {
  id: number;
  name: string | null;
  quantity: number | null;
  price: number | null;
}

export interface ReceiptItemCreate {
  name: string | null;
  quantity: number | null;
  price: number | null;
}

// --- Receipt ---

export interface Receipt {
  id: number;
  store_name: string | null;
  date: string | null;
  total_amount: number | null;
  tax: number | null;
  payment_method: string | null;
  category: string | null;
  image_path: string;
  thumbnail_path: string | null;
  items: ReceiptItem[];
  created_at: string;
  updated_at: string;
}

export interface ReceiptUpdate {
  store_name: string | null;
  date: string | null;
  total_amount: number | null;
  tax: number | null;
  payment_method: string | null;
  category: string | null;
  items: ReceiptItemCreate[];
}

export interface ReceiptListResponse {
  items: Receipt[];
  total: number;
}

// --- Batch Scan ---

export interface BatchScanResultItem {
  filename: string;
  success: boolean;
  receipt: Receipt | null;
  error: string | null;
}

export interface BatchScanResult {
  results: BatchScanResultItem[];
  success_count: number;
  error_count: number;
}

// --- Filter ---

export interface ReceiptFilterParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
  category?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

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

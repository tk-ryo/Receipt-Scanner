import client from "./client";
import type { Receipt, ReceiptFilterParams, ReceiptListResponse, ReceiptUpdate } from "@/types/receipt";

export async function scanReceipt(file: File): Promise<Receipt> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post<Receipt>("/receipts/scan", formData);
  return data;
}

export async function getReceipts(
  skip = 0,
  limit = 20,
  filters?: ReceiptFilterParams,
): Promise<ReceiptListResponse> {
  const params: Record<string, string | number> = { skip, limit };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") {
        params[key] = value;
      }
    }
  }
  const { data } = await client.get<ReceiptListResponse>("/receipts", { params });
  return data;
}

export async function getReceipt(id: number): Promise<Receipt> {
  const { data } = await client.get<Receipt>(`/receipts/${id}`);
  return data;
}

export async function updateReceipt(id: number, body: ReceiptUpdate): Promise<Receipt> {
  const { data } = await client.put<Receipt>(`/receipts/${id}`, body);
  return data;
}

export async function deleteReceipt(id: number): Promise<void> {
  await client.delete(`/receipts/${id}`);
}

export async function exportCsv(filters?: ReceiptFilterParams): Promise<void> {
  const params: Record<string, string | number> = {};
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") {
        params[key] = value;
      }
    }
  }
  const { data } = await client.get("/receipts/export/csv", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "receipts.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

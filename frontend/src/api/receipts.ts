import client from "./client";
import type { Receipt, ReceiptListResponse, ReceiptUpdate } from "@/types/receipt";

export async function scanReceipt(file: File): Promise<Receipt> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post<Receipt>("/receipts/scan", formData);
  return data;
}

export async function getReceipts(skip = 0, limit = 20): Promise<ReceiptListResponse> {
  const { data } = await client.get<ReceiptListResponse>("/receipts", {
    params: { skip, limit },
  });
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

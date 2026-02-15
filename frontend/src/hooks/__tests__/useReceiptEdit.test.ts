import { renderHook, act } from "@testing-library/react";
import { useReceiptEdit } from "../useReceiptEdit";
import { updateReceipt } from "@/api/receipts";
import { createMockReceipt } from "@/test/fixtures";

vi.mock("@/api/receipts", () => ({
  updateReceipt: vi.fn(),
}));

const mockUpdateReceipt = updateReceipt as ReturnType<typeof vi.fn>;

describe("useReceiptEdit", () => {
  const receipt = createMockReceipt({
    items: [{ id: 1, name: "コーヒー", quantity: 2, price: 350 }],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("receiptToForm 変換で正しい初期値を持つ", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    expect(result.current.form.store_name).toBe("テストストア");
    expect(result.current.form.items).toHaveLength(1);
    expect(result.current.form.items[0].name).toBe("コーヒー");
  });

  it("setField でフォームを更新する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.setField("store_name", "新しい店名"));
    expect(result.current.form.store_name).toBe("新しい店名");
  });

  it("setItem で name を更新する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.setItem(0, "name", "ラテ"));
    expect(result.current.form.items[0].name).toBe("ラテ");
  });

  it("setItem で quantity を数値変換する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.setItem(0, "quantity", "5"));
    expect(result.current.form.items[0].quantity).toBe(5);
  });

  it("setItem で price を数値変換する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.setItem(0, "price", "500"));
    expect(result.current.form.items[0].price).toBe(500);
  });

  it("setItem で空文字を null に変換する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.setItem(0, "name", ""));
    expect(result.current.form.items[0].name).toBeNull();

    act(() => result.current.setItem(0, "quantity", ""));
    expect(result.current.form.items[0].quantity).toBeNull();
  });

  it("addItem で品目を追加する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.addItem());
    expect(result.current.form.items).toHaveLength(2);
    expect(result.current.form.items[1]).toEqual({ name: null, quantity: 1, price: null });
  });

  it("removeItem で品目を削除する", () => {
    const { result } = renderHook(() => useReceiptEdit(receipt));

    act(() => result.current.removeItem(0));
    expect(result.current.form.items).toHaveLength(0);
  });

  it("save で API を呼出し saving 状態を管理する", async () => {
    const updated = createMockReceipt({ store_name: "更新済み" });
    mockUpdateReceipt.mockResolvedValue(updated);

    const { result } = renderHook(() => useReceiptEdit(receipt));

    let savedReceipt: unknown;
    await act(async () => {
      savedReceipt = await result.current.save();
    });

    expect(mockUpdateReceipt).toHaveBeenCalledWith(receipt.id, result.current.form);
    expect(savedReceipt).toEqual(updated);
    expect(result.current.saving).toBe(false);
  });
});

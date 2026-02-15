import { renderHook, act, waitFor } from "@testing-library/react";
import { useReceipts } from "../useReceipts";
import { getReceipts } from "@/api/receipts";
import { createMockReceipt } from "@/test/fixtures";

vi.mock("@/api/receipts", () => ({
  getReceipts: vi.fn(),
}));

const mockGetReceipts = getReceipts as ReturnType<typeof vi.fn>;

describe("useReceipts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期ロードでデータを取得する", async () => {
    const items = [createMockReceipt()];
    mockGetReceipts.mockResolvedValue({ items, total: 1 });

    const { result } = renderHook(() => useReceipts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual(items);
    expect(result.current.total).toBe(1);
  });

  it("setFilters でページ 1 にリセットする", async () => {
    mockGetReceipts.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useReceipts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    act(() => result.current.setFilters({ category: "食費" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.page).toBe(1);
  });

  it("setPage でデータ再取得する", async () => {
    mockGetReceipts.mockResolvedValue({ items: [], total: 40 });

    const { result } = renderHook(() => useReceipts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(mockGetReceipts).toHaveBeenCalledWith(20, 20, {}));
  });

  it("エラー時にエラーメッセージを設定する", async () => {
    mockGetReceipts.mockRejectedValue(new Error("取得エラー"));

    const { result } = renderHook(() => useReceipts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("取得エラー");
  });

  it("refresh でデータを再取得する", async () => {
    mockGetReceipts.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useReceipts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGetReceipts.mockResolvedValue({ items: [createMockReceipt()], total: 1 });
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.items).toHaveLength(1);
  });
});

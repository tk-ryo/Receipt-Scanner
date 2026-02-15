import { renderHook, act, waitFor } from "@testing-library/react";
import { useMonthlySummary } from "../useMonthlySummary";
import { getMonthlySummary, getMonthlyList } from "@/api/summary";
import { createMockMonthlySummary, createMockMonthOption } from "@/test/fixtures";

vi.mock("@/api/summary", () => ({
  getMonthlySummary: vi.fn(),
  getMonthlyList: vi.fn(),
}));

const mockGetMonthlyList = getMonthlyList as ReturnType<typeof vi.fn>;
const mockGetMonthlySummary = getMonthlySummary as ReturnType<typeof vi.fn>;

describe("useMonthlySummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("マウント時に月リストを取得し最初の月を自動選択する", async () => {
    const months = [
      createMockMonthOption({ year: 2025, month: 3 }),
      createMockMonthOption({ year: 2025, month: 2 }),
    ];
    const summary = createMockMonthlySummary({ year: 2025, month: 3 });
    mockGetMonthlyList.mockResolvedValue(months);
    mockGetMonthlySummary.mockResolvedValue(summary);

    const { result } = renderHook(() => useMonthlySummary());

    await waitFor(() => expect(result.current.months).toHaveLength(2));
    expect(result.current.selectedYear).toBe(2025);
    expect(result.current.selectedMonth).toBe(3);

    await waitFor(() => expect(result.current.summary).toEqual(summary));
  });

  it("selectMonth でサマリーを再取得する", async () => {
    const months = [createMockMonthOption({ year: 2025, month: 3 })];
    const summary1 = createMockMonthlySummary({ month: 3 });
    const summary2 = createMockMonthlySummary({ month: 2, total_amount: 30000 });
    mockGetMonthlyList.mockResolvedValue(months);
    mockGetMonthlySummary
      .mockResolvedValueOnce(summary1)
      .mockResolvedValueOnce(summary2);

    const { result } = renderHook(() => useMonthlySummary());
    await waitFor(() => expect(result.current.summary).toEqual(summary1));

    act(() => result.current.selectMonth(2025, 2));
    await waitFor(() => expect(result.current.summary).toEqual(summary2));
  });

  it("空リスト時は summary が null のまま", async () => {
    mockGetMonthlyList.mockResolvedValue([]);

    const { result } = renderHook(() => useMonthlySummary());
    await waitFor(() => expect(result.current.months).toEqual([]));

    expect(result.current.selectedYear).toBeNull();
    expect(result.current.selectedMonth).toBeNull();
    expect(result.current.summary).toBeNull();
  });

  it("月リスト取得エラーでエラーメッセージを設定する", async () => {
    mockGetMonthlyList.mockRejectedValue(new Error("API エラー"));

    const { result } = renderHook(() => useMonthlySummary());
    await waitFor(() => expect(result.current.error).toBe("API エラー"));
  });
});

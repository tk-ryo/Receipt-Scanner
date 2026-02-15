import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../DashboardPage";
import { createMockMonthlySummary, createMockMonthOption } from "@/test/fixtures";
import type { MonthlySummary, MonthOption } from "@/types/summary";

let mockMonths: MonthOption[] = [];
let mockSummary: MonthlySummary | null = null;
let mockLoading = false;
let mockError: string | null = null;
let mockSelectedYear: number | null = null;
let mockSelectedMonth: number | null = null;

vi.mock("@/hooks/useMonthlySummary", () => ({
  useMonthlySummary: () => ({
    months: mockMonths,
    selectedYear: mockSelectedYear,
    selectedMonth: mockSelectedMonth,
    summary: mockSummary,
    loading: mockLoading,
    error: mockError,
    selectMonth: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    mockMonths = [];
    mockSummary = null;
    mockLoading = false;
    mockError = null;
    mockSelectedYear = null;
    mockSelectedMonth = null;
  });

  it("ローディング状態を表示する", () => {
    mockLoading = true;
    renderPage();
    expect(screen.getByText("月次ダッシュボード")).toBeInTheDocument();
    // Loader2 アイコンが表示される（animate-spin のある要素）
  });

  it("エラー状態を表示する", () => {
    mockError = "サマリー取得エラー";
    renderPage();
    expect(screen.getByText("サマリー取得エラー")).toBeInTheDocument();
  });

  it("月選択セレクタを表示する", () => {
    mockMonths = [
      createMockMonthOption({ year: 2025, month: 3, count: 5 }),
      createMockMonthOption({ year: 2025, month: 2, count: 3 }),
    ];
    mockSelectedYear = 2025;
    mockSelectedMonth = 3;
    renderPage();

    expect(screen.getByText("対象月:")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("サマリーを表示する", () => {
    mockMonths = [createMockMonthOption({ year: 2025, month: 1 })];
    mockSelectedYear = 2025;
    mockSelectedMonth = 1;
    mockSummary = createMockMonthlySummary();
    renderPage();

    expect(screen.getByText(/2025年1月 合計金額/)).toBeInTheDocument();
    expect(screen.getByText("50,000円")).toBeInTheDocument();
    expect(screen.getByText("10件")).toBeInTheDocument();
  });

  it("空状態を表示する", () => {
    renderPage();
    expect(screen.getByText(/レシートデータがありません/)).toBeInTheDocument();
  });
});

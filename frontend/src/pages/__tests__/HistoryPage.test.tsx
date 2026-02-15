import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HistoryPage from "../HistoryPage";
import { createMockReceipt } from "@/test/fixtures";

const mockRefresh = vi.fn();
const mockSetPage = vi.fn();
const mockSetFilters = vi.fn();

let mockLoading = false;
let mockError: string | null = null;
let mockItems = [createMockReceipt()];
let mockTotal = 1;

vi.mock("@/hooks/useReceipts", () => ({
  useReceipts: () => ({
    items: mockItems,
    total: mockTotal,
    loading: mockLoading,
    error: mockError,
    page: 1,
    setPage: mockSetPage,
    filters: {},
    setFilters: mockSetFilters,
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  );
}

describe("HistoryPage", () => {
  beforeEach(() => {
    mockLoading = false;
    mockError = null;
    mockItems = [createMockReceipt()];
    mockTotal = 1;
    vi.clearAllMocks();
  });

  it("ローディング状態でスケルトンを表示する", () => {
    mockLoading = true;
    const { container } = renderPage();
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("エラー状態で再試行ボタンを表示する", async () => {
    const user = userEvent.setup();
    mockError = "取得エラー";
    mockItems = [];
    renderPage();

    expect(screen.getByText("取得エラー")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /再試行/ }));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("空状態を表示する", () => {
    mockItems = [];
    mockTotal = 0;
    renderPage();
    expect(screen.getByText("レシートがまだありません")).toBeInTheDocument();
  });

  it("レシートカードを表示する", () => {
    renderPage();
    expect(screen.getByText("テストストア")).toBeInTheDocument();
    expect(screen.getByText("¥1,500")).toBeInTheDocument();
  });

  it("ページネーションを表示する（2ページ以上）", () => {
    mockTotal = 40;
    renderPage();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /次へ/ })).toBeInTheDocument();
  });
});

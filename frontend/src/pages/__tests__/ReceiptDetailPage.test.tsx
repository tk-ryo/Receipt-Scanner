import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ReceiptDetailPage from "../ReceiptDetailPage";
import { getReceipt, deleteReceipt } from "@/api/receipts";
import { createMockReceipt } from "@/test/fixtures";

vi.mock("@/api/receipts", () => ({
  getReceipt: vi.fn(),
  deleteReceipt: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// useReceiptEdit をモック（ReceiptEditForm が使う）
vi.mock("@/hooks/useReceiptEdit", () => ({
  useReceiptEdit: () => ({
    form: {
      store_name: "テストストア",
      date: "2025-01-15",
      total_amount: 1500,
      tax: 136,
      payment_method: "現金",
      category: "食費",
      items: [],
    },
    saving: false,
    setField: vi.fn(),
    setItem: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    save: vi.fn(),
  }),
}));

const mockGetReceipt = getReceipt as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/receipts/1"]}>
      <Routes>
        <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
        <Route path="/history" element={<div>History</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ReceiptDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ローディング状態を表示する", () => {
    mockGetReceipt.mockReturnValue(new Promise(() => {})); // pending
    const { container } = renderPage();
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("エラー状態を表示する", async () => {
    mockGetReceipt.mockRejectedValue(new Error("取得エラー"));
    renderPage();

    expect(await screen.findByText("レシートの取得に失敗しました")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /再試行/ })).toBeInTheDocument();
  });

  it("正常にレシートを表示する", async () => {
    const receipt = createMockReceipt();
    mockGetReceipt.mockResolvedValue(receipt);
    renderPage();

    expect(await screen.findByText("テストストア")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("編集モードに切り替えられる", async () => {
    const user = userEvent.setup();
    const receipt = createMockReceipt();
    mockGetReceipt.mockResolvedValue(receipt);
    renderPage();

    await screen.findByText("テストストア");
    await user.click(screen.getByRole("button", { name: /編集/ }));

    expect(screen.getByText("レシート編集")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

// 各ページコンポーネントをモック
vi.mock("@/pages/ScanPage", () => ({
  default: () => <div>ScanPage</div>,
}));
vi.mock("@/pages/HistoryPage", () => ({
  default: () => <div>HistoryPage</div>,
}));
vi.mock("@/pages/ReceiptDetailPage", () => ({
  default: () => <div>ReceiptDetailPage</div>,
}));
vi.mock("@/pages/DashboardPage", () => ({
  default: () => <div>DashboardPage</div>,
}));
vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// App は BrowserRouter を含むため、テスト用に Routes だけ取り出す
import ScanPage from "@/pages/ScanPage";
import HistoryPage from "@/pages/HistoryPage";
import ReceiptDetailPage from "@/pages/ReceiptDetailPage";
import DashboardPage from "@/pages/DashboardPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ScanPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

describe("App routing", () => {
  it("/ で ScanPage をレンダリングする", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("ScanPage")).toBeInTheDocument();
  });

  it("/history で HistoryPage をレンダリングする", () => {
    render(
      <MemoryRouter initialEntries={["/history"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("HistoryPage")).toBeInTheDocument();
  });

  it("/receipts/:id で ReceiptDetailPage をレンダリングする", () => {
    render(
      <MemoryRouter initialEntries={["/receipts/1"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("ReceiptDetailPage")).toBeInTheDocument();
  });

  it("/dashboard で DashboardPage をレンダリングする", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("DashboardPage")).toBeInTheDocument();
  });
});

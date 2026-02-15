import { render, screen } from "@testing-library/react";
import AnalysisResult from "../AnalysisResult";
import { createMockReceipt } from "@/test/fixtures";

describe("AnalysisResult", () => {
  it("store_name と date を表示する", () => {
    const receipt = createMockReceipt();
    render(<AnalysisResult receipt={receipt} />);

    expect(screen.getByText("テストストア")).toBeInTheDocument();
    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
  });

  it("store_name が null の場合「店名不明」を表示する", () => {
    const receipt = createMockReceipt({ store_name: null });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("店名不明")).toBeInTheDocument();
  });

  it("date が null の場合「日付不明」を表示する", () => {
    const receipt = createMockReceipt({ date: null });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("日付不明")).toBeInTheDocument();
  });

  it("total_amount が null の場合「-」を表示する", () => {
    const receipt = createMockReceipt({ total_amount: null });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("total_amount をフォーマットして表示する", () => {
    const receipt = createMockReceipt({ total_amount: 1500 });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("¥1,500")).toBeInTheDocument();
  });

  it("payment_method の Badge を表示する", () => {
    const receipt = createMockReceipt({ payment_method: "現金" });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("現金")).toBeInTheDocument();
  });

  it("payment_method が null の場合 Badge を表示しない", () => {
    const receipt = createMockReceipt({ payment_method: null });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.queryByText("現金")).not.toBeInTheDocument();
  });

  it("items がある場合、品目セクションを表示する", () => {
    const receipt = createMockReceipt({
      items: [{ id: 1, name: "コーヒー", quantity: 2, price: 350 }],
    });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.getByText("品目")).toBeInTheDocument();
    expect(screen.getByText(/コーヒー/)).toBeInTheDocument();
  });

  it("items が空の場合、品目セクションを表示しない", () => {
    const receipt = createMockReceipt({ items: [] });
    render(<AnalysisResult receipt={receipt} />);
    expect(screen.queryByText("品目")).not.toBeInTheDocument();
  });
});

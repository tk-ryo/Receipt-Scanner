import { render, screen } from "@testing-library/react";
import ReceiptEditForm from "../ReceiptEditForm";
import { createMockReceipt } from "@/test/fixtures";

// useReceiptEdit をモック
const mockSetField = vi.fn();
const mockSave = vi.fn();
vi.mock("@/hooks/useReceiptEdit", () => ({
  useReceiptEdit: () => ({
    form: {
      store_name: "テストストア",
      date: "2025-01-15",
      total_amount: 1500,
      tax: 136,
      payment_method: "現金",
      category: "食費",
      items: [{ name: "コーヒー", quantity: 1, price: 350 }],
    },
    saving: false,
    setField: mockSetField,
    setItem: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    save: mockSave,
  }),
}));

// sonner のモック
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ReceiptEditForm", () => {
  const receipt = createMockReceipt();
  const onSaved = vi.fn();

  it("フォームフィールドの初期値を表示する", () => {
    render(<ReceiptEditForm receipt={receipt} onSaved={onSaved} />);

    expect(screen.getByLabelText("店名")).toHaveValue("テストストア");
    expect(screen.getByLabelText("日付")).toHaveValue("2025-01-15");
    expect(screen.getByLabelText("合計金額")).toHaveValue(1500);
  });

  it("保存ボタンが表示される", () => {
    render(<ReceiptEditForm receipt={receipt} onSaved={onSaved} />);
    expect(screen.getByRole("button", { name: /保存/ })).toBeInTheDocument();
  });
});

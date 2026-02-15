import { render, screen } from "@testing-library/react";
import ReceiptPreview from "../ReceiptPreview";

describe("ReceiptPreview", () => {
  it("img の src と alt を正しく設定する", () => {
    render(<ReceiptPreview src="/uploads/test.jpg" alt="テスト画像" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/test.jpg");
    expect(img).toHaveAttribute("alt", "テスト画像");
  });

  it("alt のデフォルト値は「レシート画像」", () => {
    render(<ReceiptPreview src="/uploads/test.jpg" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "レシート画像");
  });
});

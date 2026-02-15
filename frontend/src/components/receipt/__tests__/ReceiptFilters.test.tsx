import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReceiptFilters from "../ReceiptFilters";

describe("ReceiptFilters", () => {
  const defaultFilters = {};
  const onFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("フィルタパネルの開閉ができる", async () => {
    const user = userEvent.setup();
    render(
      <ReceiptFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />,
    );

    // 初期状態ではフィルタパネルは閉じている
    expect(screen.queryByLabelText("店名検索")).not.toBeInTheDocument();

    // フィルタボタンをクリックで開く
    await user.click(screen.getByRole("button", { name: /フィルタ/ }));
    expect(screen.getByLabelText("店名検索")).toBeInTheDocument();

    // もう一度クリックで閉じる
    await user.click(screen.getByRole("button", { name: /フィルタ/ }));
    expect(screen.queryByLabelText("店名検索")).not.toBeInTheDocument();
  });

  it("hasActiveFilters がある場合バッジを表示する", () => {
    const filters = { category: "食費" };
    render(
      <ReceiptFilters filters={filters} onFiltersChange={onFiltersChange} />,
    );
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("フィルタクリアボタンが表示される", async () => {
    const user = userEvent.setup();
    const filters = { category: "食費", sort_by: "date" };
    render(
      <ReceiptFilters filters={filters} onFiltersChange={onFiltersChange} />,
    );

    await user.click(screen.getByRole("button", { name: /フィルタ/ }));
    await user.click(screen.getByRole("button", { name: /フィルタをクリア/ }));

    expect(onFiltersChange).toHaveBeenCalledWith({
      sort_by: "date",
      sort_order: undefined,
    });
  });
});

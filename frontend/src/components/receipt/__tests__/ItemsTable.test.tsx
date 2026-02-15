import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemsTable from "../ItemsTable";

describe("ItemsTable", () => {
  const defaultProps = {
    items: [{ name: "コーヒー", quantity: 1, price: 350 }],
    onItemChange: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  };

  it("空状態の表示", () => {
    render(
      <ItemsTable {...defaultProps} items={[]} />,
    );
    expect(screen.getByText("品目がありません")).toBeInTheDocument();
  });

  it("アイテムの入力フィールドを表示する", () => {
    render(<ItemsTable {...defaultProps} />);
    expect(screen.getByDisplayValue("コーヒー")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("350")).toBeInTheDocument();
  });

  it("追加ボタンをクリックで onAdd が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ItemsTable {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /追加/ }));
    expect(defaultProps.onAdd).toHaveBeenCalled();
  });

  it("削除ボタンをクリックで onRemove が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ItemsTable {...defaultProps} />);

    // 削除ボタンはゴミ箱アイコン
    const deleteButtons = screen.getAllByRole("button").filter(
      (btn) => !btn.textContent?.includes("追加"),
    );
    // 最後のボタン（追加以外）をクリック
    await user.click(deleteButtons[deleteButtons.length - 1]);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });

  it("disabled 状態で入力・ボタンが無効になる", () => {
    render(<ItemsTable {...defaultProps} disabled />);
    expect(screen.getByDisplayValue("コーヒー")).toBeDisabled();
    expect(screen.getByRole("button", { name: /追加/ })).toBeDisabled();
  });
});

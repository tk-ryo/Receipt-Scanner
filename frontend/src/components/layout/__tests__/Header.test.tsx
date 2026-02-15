import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";

describe("Header", () => {
  it("ナビリンクの存在と href を確認する", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const scanLink = screen.getByRole("link", { name: "スキャン" });
    expect(scanLink).toHaveAttribute("href", "/");

    const historyLink = screen.getByRole("link", { name: "履歴" });
    expect(historyLink).toHaveAttribute("href", "/history");

    const dashboardLink = screen.getByRole("link", { name: "ダッシュボード" });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });
});

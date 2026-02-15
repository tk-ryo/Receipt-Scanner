import { render, screen } from "@testing-library/react";
import MonthlySummaryCard from "../MonthlySummaryCard";

describe("MonthlySummaryCard", () => {
  it("年月、金額、件数を表示する", () => {
    render(
      <MonthlySummaryCard
        totalAmount={50000}
        totalCount={10}
        year={2025}
        month={1}
      />,
    );

    expect(screen.getByText(/2025年1月/)).toBeInTheDocument();
    expect(screen.getByText("50,000円")).toBeInTheDocument();
    expect(screen.getByText("10件")).toBeInTheDocument();
  });
});

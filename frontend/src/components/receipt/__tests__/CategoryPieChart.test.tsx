import { render, screen } from "@testing-library/react";
import CategoryPieChart from "../CategoryPieChart";

// recharts のモック（ResponsiveContainer が jsdom で動かないため）
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CategoryPieChart", () => {
  it("空データ時に「データがありません」を表示する", () => {
    render(<CategoryPieChart categories={[]} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("データあり時にチャートをレンダリングする", () => {
    const categories = [
      { category: "食費", total_amount: 30000, count: 6 },
      { category: "日用品", total_amount: 20000, count: 4 },
    ];
    render(<CategoryPieChart categories={categories} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.queryByText("データがありません")).not.toBeInTheDocument();
  });
});

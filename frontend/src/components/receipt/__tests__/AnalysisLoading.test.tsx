import { render, screen } from "@testing-library/react";
import AnalysisLoading from "../AnalysisLoading";

describe("AnalysisLoading", () => {
  it("スケルトン要素が存在する", () => {
    const { container } = render(<AnalysisLoading />);
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
